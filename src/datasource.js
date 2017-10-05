import _ from "lodash";
import { DataParser } from "./dataparse.js";
import { UrlBuilder } from "./urlbuilder.js";
import { RequestCache } from "./requestcache.js";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {

    if (instanceSettings.jsonData != null) {
      this.sensorid = instanceSettings.jsonData['sensorid'] || "";
      this.apikey = instanceSettings.jsonData['apikey'] || "";
    }
    else {
      this.sensorid = "";
      this.apikey = "";
    }
    this.builder = new UrlBuilder(this.apikey, this.sensorid);

    this.type = instanceSettings.type;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;

    console.debug('basic auth');
    console.debug(instanceSettings.basicAuth);

    this.headers = { 'Content-Type': 'application/json' };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }

    this.requester = new RequestCache(this.backendSrv, this.withCredentials, this.headers);

  }

  buildUrl(str, arr) {
    return this.builder.buildUrl(str, arr);
  }

  buildQueryUrl(targets) {
    return this.builder.buildQueryUrl(targets);
  }

  query(options) {
    var query = this.buildQueryParameters(options);

    query.targets = query.targets.filter(t => !t.hide);

    if (query.targets.length <= 0) {
      return this.q.when({ data: [] });
    }

    // build URL
    var arr = [];
    var url = this.buildQueryUrl(query.targets);

    // request key to differentiate requests with different returning data but with same URL
    var cacheKey = {
      url: url,
      query:
      [
        this.makeISOString(query.range.from),
        this.makeISOString(query.range.to),
        query.maxDataPoints,
        query.targets
      ]
    };

    var promise = this.requester.doRequest(url, cacheKey, x => {

      //var pq = this.parseQuery(x, query);
      var pq = this.parseQueryAgg(x, query);
      return pq;
    });

    return promise;
  }


  metricFindQuery(query) {
    console.info('metricFindQuery');

    var interpolated = {
      target: this.templateSrv.replace(query, null, 'regex')
    };

    var url = this.buildQueryUrl();

    var cacheKey = {
      url: url,
      query: "findMetrics"
    };


    var myHandler = x => {
      var obj = x.data._embedded.streams;

      var arr_reply = [];

      for (var key in obj) {
        var id = obj[key].id;
        var type = obj[key].resulttype;

        arr_reply.push(id);
      }

      return this.mapToTextValue({ data: arr_reply });
    };

    // get the promise
    var promise = this.requester.doRequest(url, cacheKey);

    // wrap around another promise
    var myPromise = new Promise((resolve, reject) => {
      resolve(promise);
    });

    return myPromise.then(myHandler);

  }


  parseAggData(data) {
    console.info("parseAggData");
    console.info(data);

    var parser = new DataParser();
    return parser.parseAggData(data);
  }

  parseData(data, multiple) {
    console.info("parseData");
    var parser = new DataParser();

    if (multiple)
      return parser.parseData(data);
    return parser.parseDataSingle(data);
  }

  parseQueryExt(streams, query, api_call, parse_func, extra_arr) {
    //var streams = str.data._embedded.streams;

    console.error("streams");
    console.error(streams);

    var streamid = streams.join(",");

    var arr = [];
    arr.push('streamid=' + streamid);
    arr.push('start=' + this.makeISOString(query.range.from));
    arr.push('end=' + this.makeISOString(query.range.to));
    arr.push('limit=' + query.maxDataPoints);
    arr.push('sort=descending');
    arr.push('media=json');

    if (extra_arr != null)
      arr.push(extra_arr);

    var url = this.buildUrl(api_call, arr);

    var cacheKey = { url: url, query: "extended" };

    var multiple = streams.length > 1;

    var promise = this.requester.doRequest(url, cacheKey, parse_func);/*x => {
      x.data = this.parseData(x.data, multiple);
      return x;
    });*/

    return promise;
  }


  async doAllPromises(promises) {

    console.info("doAllPromises: " + promises.length);
    var data = [];

    for (var i = 0; i < promises.length; ++i) {
      var promise = promises[i];
      console.info("awaiting - " + i);
      var result = await promise;
      console.info("awaited")
      

      for(var j=0; j<result.data.length; ++j)
      {
        data.push(result.data[j]);
      }
    }

    console.info("data=");
    console.info(data);

    return {data: data};
  }


  parseQueryAgg(str, query) {
    var streams = str.data._embedded.streams;
    streams = streams.map(x => x.id)
    console.info("parseQueryAgg");
    console.info(streams);

    var promises = [];

    for (var i = 0; i < streams.length; ++i) {
      var str = streams[i];
      console.error("str=" + str);
      var multiple = streams.length > 1;

      var arr = ["aggperiod=" + query.intervalMs];
      var promise = this.parseQueryExt([str], query, '/aggregation', x => {
        var newData = this.parseAggData(x.data);
        x.data = newData;
        return x;
      }, arr);
      promises.push(promise);
    }


    return this.doAllPromises(promises);


    var thePromise = new Promise((resolve, reject) => {
      resolve(promises);
    });

    thePromise.then(x => {





      var result = [];
      for (var i = 0; i < x.length; ++i) {
        if (x[i].status != 200)
          throw 'error';

        for (var j = 0; j < x[i].data.length; ++j)
          result.push(x[i].data[j]);
      }
      console.info("final promise");
      console.info(result);

      var ret = { data: result };
      console.info("FINAL: ");
      console.info(ret);
      return ret;
    });
    return thePromise;
  }

  parseQuery(str, query) {
    var streams = str.data._embedded.streams;
    console.error("streams");
    console.error(streams);;
    streams = streams.map(x => x.id);
    console.error(streams);

    var multiple = streams.length > 1;
    return this.parseQueryExt(streams, query, '/observations', x => {
      x.data = this.parseData(x.data, multiple);
      return x;
    });
  }

  makeISOString(v) {
    if (v == null) { return null; }

    var str = v.toISOString();
    return str;
  }

  parseTestResult(data) {
    try {
      var count = data.count;
      if (count > 100)
        throw Error('too many streams, plugin only supports up to 100');
    }
    catch (err) {
      return { status: "error", message: err.message, title: "Error" };
    }

    return { status: "success", message: "Data source is working", title: "Success" };
  }

  testDatasource() {
    var url = this.buildQueryUrl();

    return this.doRequest({
      url: url,
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        console.info("Response = 200");

        return this.parseTestResult(response.data);
      }
    });
  }

  annotationQuery(options) {
    var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
    var annotationQuery = {
      range: options.range,
      annotation: {
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
        query: query
      },
      rangeRaw: options.rangeRaw
    };

    return this.doRequest({
      url: this.buildUrl('/annotations_not_implemented'),
      method: 'POST',
      data: annotationQuery
    }).then(result => {
      return result.data;
    });
  }



  mapToTextValue(result) {
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      } else if (_.isObject(d)) {
        return { text: d, value: i };
      }
      return { text: d, value: d };
    });
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    var promise = this.backendSrv.datasourceRequest(options);
    promise.then(x => {
      console.info("performing HTTP request");
      return x;
    })
    return promise;
  }

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie'
      };
    });

    options.targets = targets;

    return options;
  }
}
