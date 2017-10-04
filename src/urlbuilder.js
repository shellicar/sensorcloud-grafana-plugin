

export class UrlBuilder {

    constructor(apikey, sensorid) {
        this.apikey = apikey;
        this.sensorid = sensorid;
    }

    buildQueryUrl() {
        var arr = [];
        if (this.sensorid) {
            arr.push('id=' + this.sensorid);
        }
        // only request scalars
        arr.push('resulttype=scalarvalue');
        // api url
        var url = this.buildUrl("/streams", arr);
        return url;
    }

    buildUrl(str, arr) {
        var baseUrl = "https://sensor-cloud.io/api/sensor/v2";
        var url = baseUrl + str;

        var opt = [];

        if (this.apikey != "")
            opt.push('apikey=' + this.apikey);

        if (arr) {
            for (var i = 0; i < arr.length; ++i)
                opt.push(arr[i]);
        }

        if (opt.length > 0) {
            var query = opt.join('&');
            url += '?' + query
        }

        console.info('url: ' + url);
        return url;
    }
}
