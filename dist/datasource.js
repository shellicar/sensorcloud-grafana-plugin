'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('GenericDatasource', GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          console.info('current.json: ');
          console.info(instanceSettings.jsonData);
          this.sensorid = instanceSettings.jsonData['sensorid'];
          this.apikey = instanceSettings.jsonData['apikey'];
          this.type = instanceSettings.type;
          this.name = instanceSettings.name;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
          this.withCredentials = instanceSettings.withCredentials;
          this.headers = { 'Content-Type': 'application/json' };
          if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
            this.headers['Authorization'] = instanceSettings.basicAuth;
          }
        }

        _createClass(GenericDatasource, [{
          key: 'buildUrl',
          value: function buildUrl(str, arr) {
            var baseUrl = "https://sensor-cloud.io/api/sensor/v2";
            var url = baseUrl + str;

            var opt = [];
            opt.push('apikey=' + this.apikey);
            if (arr) {
              for (var i = 0; i < arr.length; ++i) {
                opt.push(arr[i]);
              }
            }

            if (opt.length > 0) {
              var query = opt.join('&');
              url += '?' + query;
            }

            console.info('buildUrl: ' + url);
            return url;
          }
        }, {
          key: 'buildQueryUrl',
          value: function buildQueryUrl(query) {

            var arr = [];
            //arr.push('');

            var url = this.buildUrl("/streams", arr);
            return url;
          }
        }, {
          key: 'query',
          value: function query(options) {
            var _this = this;

            var query = this.buildQueryParameters(options);

            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets.length <= 0) {
              return this.q.when({ data: [] });
            }

            // build URL
            var arr = [];
            var url = this.buildQueryUrl(query);

            return this.doRequest({
              url: url,
              method: 'GET'
            }).then(function (x) {
              var pq = _this.parseQuery(x, query);
              console.info('returning query');
              return pq;
            }).then(function (x) {
              console.info('done!');
              return x;
            });
          }
        }, {
          key: 'parseData',
          value: function parseData(data) {
            console.info('parseData');
            console.info(data);

            var result = [];

            var data2 = {};

            for (var i = 0; i < data.results.length; ++i) {
              var d = data.results[i];
              var time = Object.keys(d)[0];
              var timevalue = new Date(time).getTime();

              //console.info('d=' + d);
              for (var key in d[time]) {
                //console.info('key=' + key);
                var value = d[time][key].v;
                if (value != null) {
                  //console.info('value' + value);

                  if (!(key in data2)) {
                    console.info('creating dict for ' + key);
                    data2[key] = [];
                  }

                  var val = [value, timevalue];
                  data2[key].push(val);
                }
              }
            }

            for (var key in data2) {
              var item = {
                "target": key,
                "datapoints": data2[key]
              };
              result.push(item);
            }
            console.info('result');
            console.info(result);
            return result;
          }
        }, {
          key: 'parseQuery',
          value: function parseQuery(str, query) {
            var _this2 = this;

            console.info('parseQuery');
            console.info(str);
            console.info(query);

            var streams = str.data._embedded.streams;

            var strnames = [];
            for (var i = 0; i < streams.length; ++i) {
              strnames.push(streams[i].id);
            }
            var streamid = strnames.reverse().join(",");

            var arr = [];
            arr.push('streamid=' + streamid);
            arr.push('start=' + this.makeISOString(query.range.from));
            arr.push('end=' + this.makeISOString(query.range.to));
            arr.push('limit=' + query.maxDataPoints);
            arr.push('sort=descending');

            var url = this.buildUrl('/observations', arr);

            var req = this.doRequest({
              url: url,
              method: 'GET'
            }).then(function (x) {
              x.data = _this2.parseData(x.data);
              return x;
            });

            return req;

            /*
            console.info(str);
            console.info(query);
              var data = [];
            var data_result = {
              data: data
            };
              var promise = this.q(() => {});
              var streams = str.data._embedded.streams;
            for (var i = 0; i < streams.length; ++i) {
                (i => {
                var id = streams[i].id;
                console.info('id=');
                console.info(id);
                
                promise.then(() => {
              
                  var item = {
                    "target": id
                  };
                    var p1 = this.getDataPoints(id, query);
                  p1.then(y => {
                    console.info('setting datapoints');
                    item.datapoints = y.data;
                  });
                  console.info('resolving?');
                  Promise.resolve(p1);
                  console.info('resolved');
                  x.data.push(item);
                    console.info(x);
                  return x;
                });
              })(i);
                
                
            
            */

            /*
            var item = {
              "target": id
            };
              if(promise == null)
            {
              promise = this.getDataPoints(id, query);
            }
            promise.then(y => {
              });
            result.push(item);*/

            /*
                  ((id, item) => {
                    promise.then(x => {
            
                      console.info('getting getDataPoints promise');
                      return this.getDataPoints(id, query).then(y => {
                        console.info('setting datapoints');
                        item.datapoints = y.data;
                      });
                    });
                  })(id, item);
            
            
            
                  result.push(item);*/

            /*
            promise.then(x => {
              var prom = this.getDataPoints(id, query);
              prom.then(y => {
                item.datapoints = y.data;
              });
              return prom;
            });*/

            /*
            
            
            // closure id
            (id => {
              console.info('inside closure');
              promise.then(x => {
                var item = {
                  "target": id
                };
                  var dp1 = (item => {
                  console.info('inside closure2');
                            
                var dp = this.getDataPoints(id, query);
                dp.then(x => {
                  console.info('x - dp');
                  console.info(x);
                  item.datapoints = x.data;
                });
                return dp;
                })(item);
                  x.data.push(item);
                return dp1;
              });
            })(id);*/
            /*  }
                  console.info('returning promise');
              return promise;*/
          }
        }, {
          key: 'makeISOString',
          value: function makeISOString(v) {
            if (v == null) {
              return null;
            }

            console.info(v);
            var str = v.toISOString();
            console.info(str);
            return str;
          }
        }, {
          key: 'getDataPoints',
          value: function getDataPoints(id, query) {

            console.info('getDataPoints');

            var first = this.makeISOString(query.range.from);
            var last = this.makeISOString(query.range.to);

            console.info('query');
            console.info(query);

            var opt = [];
            opt.push('streamid=' + id);
            if (first != null) opt.push('first=' + first);
            if (last != null) opt.push('last=' + last);

            opt.push('limit=' + query.maxDataPoints);

            console.info('options:');
            console.info(opt);
            var url = this.buildUrl('/observations', opt);

            var req = this.doRequest({
              url: url,
              method: 'GET'
            });

            req.then(function (x) {
              var results = x.data.results;

              var retVal = [];

              for (var i = 0; i < results.length; ++i) {
                var val = results[i];
                if (val.t != null && val.v != null && val.v.v != null) {
                  var td = new Date(val.t);
                  var t = td.getTime();
                  var v = val.v.v;
                  var idx = [v, t];
                  retVal.push(idx);
                }
              }

              x.data = retVal;

              return x;
            });

            return req;
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.doRequest({
              url: this.buildUrl('/'),
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
              }
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
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
            }).then(function (result) {
              return result.data;
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(query) {
            var interpolated = {
              target: this.templateSrv.replace(query, null, 'regex')
            };

            console.info('metricFind');
            console.info(interpolated);

            return this.doRequest({
              url: this.buildUrl('/search_not_implemented_yet'),
              method: 'GET'
            }).then(this.mapToTextValue);
          }
        }, {
          key: 'mapToTextValue',
          value: function mapToTextValue(result) {
            return _.map(result.data, function (d, i) {
              if (d && d.text && d.value) {
                return { text: d.text, value: d.value };
              } else if (_.isObject(d)) {
                return { text: d, value: i };
              }
              return { text: d, value: d };
            });
          }
        }, {
          key: 'doRequest',
          value: function doRequest(options) {
            options.withCredentials = this.withCredentials;
            options.headers = this.headers;

            return this.backendSrv.datasourceRequest(options);
          }
        }, {
          key: 'buildQueryParameters',
          value: function buildQueryParameters(options) {
            var _this3 = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });

            var targets = _.map(options.targets, function (target) {
              return {
                target: _this3.templateSrv.replace(target.target, options.scopedVars, 'regex'),
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'timeserie'
              };
            });

            options.targets = targets;

            return options;
          }
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
