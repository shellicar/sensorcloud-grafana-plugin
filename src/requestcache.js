import _ from "lodash";

export class RequestCache {
    constructor(backend, credentials, headers) {
        this.backendSrv = backend;
        this.withCredentials = credentials;
        this.headers = headers;
        this.cache = [];
    }

    buildRequest(url) {
        var options = {
            url: url,
            method: 'GET'
        };

        options.withCredentials = this.withCredentials;
        options.headers = this.headers;

        return this.backendSrv.datasourceRequest(options);
    }

    doRequest(url, cachekey, func) {

        const CacheAge = 30000;

        while (this.cache.length > 0 && Date.now() - this.cache[0].time > CacheAge) {
            console.info("expiring cached item");
            this.cache.shift();
        }


        for (var i = 0; i < this.cache.length; ++i) {
            if (_.isEqual(this.cache[i].key, cachekey)) {
                return this.cache[i].promise;
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
}
