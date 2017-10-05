"use strict";

System.register(["lodash", "./dataparse.js", "./urlbuilder.js", "./requestcache.js"], function (_export, _context) {
  "use strict";

  var _, DataParser, UrlBuilder, RequestCache, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_dataparseJs) {
      DataParser = _dataparseJs.DataParser;
    }, function (_urlbuilderJs) {
      UrlBuilder = _urlbuilderJs.UrlBuilder;
    }, function (_requestcacheJs) {
      RequestCache = _requestcacheJs.RequestCache;
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

      _export("GenericDatasource", GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          if (instanceSettings.jsonData != null) {
            this.sensorid = instanceSettings.jsonData['sensorid'] || "";
            this.apikey = instanceSettings.jsonData['apikey'] || "";
          } else {
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

        _createClass(GenericDatasource, [{
          key: "buildUrl",
          value: function buildUrl(str, arr) {
            return this.builder.buildUrl(str, arr);
          }
        }, {
          key: "buildQueryUrl",
          value: function buildQueryUrl(targets) {
            return this.builder.buildQueryUrl(targets);
          }
        }, {
          key: "query",
          value: function query(options) {
            var _this = this;

            var query = this.buildQueryParameters(options);
            console.info('optionss');
            console.info(options);

            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets.length <= 0) {
              return this.q.when({ data: [] });
            }

            // build URL
            var arr = [];
            var url = this.buildQueryUrl(query.targets);

            // request key to differentiate requests with different returning data but with same URL
            var cacheKey = {
              url: url,
              query: [this.makeISOString(query.range.from), this.makeISOString(query.range.to), query.maxDataPoints]
            };

            var promise = this.requester.doRequest(url, cacheKey, function (x) {
              var pq = _this.parseQuery(x, query);
              return pq;
            });

            return promise;
          }
        }, {
          key: "metricFindQuery",
          value: function metricFindQuery(query) {
            var _this2 = this;

            console.info('metricFindQuery');

            var interpolated = {
              target: this.templateSrv.replace(query, null, 'regex')
            };

            var url = this.buildQueryUrl();

            var cacheKey = {
              url: url,
              query: "findMetrics"
            };

            var myHandler = function myHandler(x) {
              var obj = x.data._embedded.streams;

              var arr_reply = [];

              for (var key in obj) {
                var id = obj[key].id;
                var type = obj[key].resulttype;

                //if(type == "scalarvalue")
                {
                  arr_reply.push(id);
                } /*
                  else if(type == "geolocationvalue")
                  {
                   arr_reply.push(id + "_lat");
                   arr_reply.push(id + "_lon");
                   arr_reply.push(id + "_alt");
                  }*/
              }

              return _this2.mapToTextValue({ data: arr_reply });

              /*
              var ret = obj.map(y => y.id);
              console.info('x=');
              console.info(x);
              var result = this.mapToTextValue({ data: ret });
              return result;*/
            };

            // get the promise
            var promise = this.requester.doRequest(url, cacheKey);

            // wrap around another promise
            var myPromise = new Promise(function (resolve, reject) {
              resolve(promise);
            });

            return myPromise.then(myHandler);

            /*
             promise.then(x => {
              console.info('x=');
              console.info(x);
              var obj = x.data._embedded.streams;
              var ret = obj.map(y => y.id);
              console.info('ret=');
              console.info(ret);
              var result = this.mapToTextValue({ 'data': ret });
              console.info('result');
              console.info(result);
              return result;
            });*/

            /*, x => {
              var obj = x.data._embedded.streams;
              var ret = obj.map(y => y.id);
              return this.mapToTextValue({data: ret});
            });*/

            /*
            return this.doRequest({
              url: url,
              method: 'GET',
            }).then(x => {
              var obj = x.data._embedded.streams;
              var ret = obj.map(y => y.id);
              return this.mapToTextValue({data: ret});
            });*/
          }
        }, {
          key: "parseData",
          value: function parseData(data, multiple) {
            console.info("parseData");
            var parser = new DataParser();

            if (multiple) return parser.parseData(data);
            return parser.parseDataSingle(data);
          }
        }, {
          key: "parseQuery",
          value: function parseQuery(str, query) {
            var _this3 = this;

            console.info("parseQuery");

            var streams = str.data._embedded.streams;

            var streamid = streams.map(function (x) {
              return x.id;
            }).join(",");

            var arr = [];
            arr.push('streamid=' + streamid);
            arr.push('start=' + this.makeISOString(query.range.from));
            arr.push('end=' + this.makeISOString(query.range.to));
            arr.push('limit=' + query.maxDataPoints);
            arr.push('sort=descending');
            arr.push('media=json');

            var url = this.buildUrl('/observations', arr);

            var cacheKey = { url: url, query: "extended" };

            var multiple = streams.length > 1;

            var promise = this.requester.doRequest(url, cacheKey, function (x) {
              x.data = _this3.parseData(x.data, multiple);
              return x;
            });

            return promise;
          }
        }, {
          key: "makeISOString",
          value: function makeISOString(v) {
            if (v == null) {
              return null;
            }

            var str = v.toISOString();
            return str;
          }
        }, {
          key: "parseTestResult",
          value: function parseTestResult(data) {
            try {
              var count = data.count;
              if (count > 100) throw Error('too many streams, plugin only supports up to 100');
            } catch (err) {
              return { status: "error", message: err.message, title: "Error" };
            }

            return { status: "success", message: "Data source is working", title: "Success" };
          }
        }, {
          key: "testDatasource",
          value: function testDatasource() {
            var _this4 = this;

            var url = this.buildQueryUrl();

            return this.doRequest({
              url: url,
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                console.info("Response = 200");

                return _this4.parseTestResult(response.data);
              }
            });
          }
        }, {
          key: "annotationQuery",
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
          key: "mapToTextValue",
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
          key: "doRequest",
          value: function doRequest(options) {
            options.withCredentials = this.withCredentials;
            options.headers = this.headers;

            var promise = this.backendSrv.datasourceRequest(options);
            promise.then(function (x) {
              console.info("performing HTTP request");
              return x;
            });
            return promise;
          }
        }, {
          key: "buildQueryParameters",
          value: function buildQueryParameters(options) {
            var _this5 = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });

            var targets = _.map(options.targets, function (target) {
              return {
                target: _this5.templateSrv.replace(target.target, options.scopedVars, 'regex'),
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

      _export("GenericDatasource", GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
