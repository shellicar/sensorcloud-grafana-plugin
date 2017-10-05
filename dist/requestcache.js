"use strict";

System.register(["lodash"], function (_export, _context) {
    "use strict";

    var _, _createClass, RequestCache;

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

            _export("RequestCache", RequestCache = function () {
                function RequestCache(backend, credentials, headers) {
                    _classCallCheck(this, RequestCache);

                    this.backendSrv = backend;
                    this.withCredentials = credentials;
                    this.headers = headers;
                    this.cache = [];
                }

                _createClass(RequestCache, [{
                    key: "buildRequest",
                    value: function buildRequest(url) {
                        var options = {
                            url: url,
                            method: 'GET'
                        };

                        options.withCredentials = this.withCredentials;
                        options.headers = this.headers;

                        return this.backendSrv.datasourceRequest(options);
                    }
                }, {
                    key: "doRequest",
                    value: function doRequest(url, cachekey, func) {

                        var CacheAge = 30000;

                        while (this.cache.length > 0 && Date.now() - this.cache[0].time > CacheAge) {
                            console.debug("expiring cached item");
                            // remove first item
                            this.cache.shift();
                        }

                        for (var i = 0; i < this.cache.length; ++i) {
                            if (_.isEqual(this.cache[i].key, cachekey)) {
                                console.info("returning cached item");
                                //return this.cache[i].promise;
                            }
                        }

                        var promise = this.buildRequest(url);
                        promise = promise.then(func);

                        var cacheItem = {
                            key: cachekey,
                            promise: promise,
                            time: Date.now()
                        };
                        this.cache.push(cacheItem);

                        return promise;
                    }
                }]);

                return RequestCache;
            }());

            _export("RequestCache", RequestCache);
        }
    };
});
//# sourceMappingURL=requestcache.js.map
