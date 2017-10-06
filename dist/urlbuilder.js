'use strict';

System.register([], function (_export, _context) {
    "use strict";

    var _createClass, UrlBuilder;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [],
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

            _export('UrlBuilder', UrlBuilder = function () {
                function UrlBuilder(baseUrl, apikey, sensorid) {
                    _classCallCheck(this, UrlBuilder);

                    this.baseUrl = baseUrl;
                    this.apikey = apikey;
                    this.sensorid = sensorid;
                }

                _createClass(UrlBuilder, [{
                    key: 'buildQueryUrl',
                    value: function buildQueryUrl(targets) {
                        var arr = [];

                        var streamid = null;
                        if (targets) {
                            streamid = targets.map(function (x) {
                                return x.target;
                            }).join(",");
                        }

                        console.info('streamid');
                        console.info(streamid);

                        if (!streamid) streamid = this.sensorid;

                        if (streamid) {
                            console.info('streamid=' + streamid);
                            arr.push('id=' + streamid);
                        }

                        arr.push('limit=10000');
                        arr.push('properties=resulttype');

                        // only request scalars
                        //arr.push('resulttype=scalarvalue');

                        // api url
                        var url = this.buildUrl("/streams", arr);

                        console.info("URL=" + url);
                        return url;
                    }
                }, {
                    key: 'buildUrl',
                    value: function buildUrl(str, arr) {
                        var baseUrl = this.baseUrl;
                        var url = baseUrl + str;

                        var opt = [];

                        if (this.apikey != "") opt.push('apikey=' + this.apikey);

                        if (arr) {
                            for (var i = 0; i < arr.length; ++i) {
                                opt.push(arr[i]);
                            }
                        }

                        if (opt.length > 0) {
                            var query = opt.join('&');
                            url += '?' + query;
                        }

                        console.info('url: ' + url);
                        return url;
                    }
                }]);

                return UrlBuilder;
            }());

            _export('UrlBuilder', UrlBuilder);
        }
    };
});
//# sourceMappingURL=urlbuilder.js.map
