

export class UrlBuilder {

    constructor(apikey, sensorid) {
        this.apikey = apikey;
        this.sensorid = sensorid;
    }

    buildQueryUrl(targets) {
        var arr = [];

        var streamid = null;
        if (targets) {
            streamid = targets.map(x => x.target).join(",");
        }

        console.info('streamid');
        console.info(streamid);

        if (!streamid)
            streamid = this.sensorid;

        console.info('streamid=' + streamid);
        arr.push('id=' + streamid);

        arr.push('properties=resulttype');

        // only request scalars
        //arr.push('resulttype=scalarvalue');

        // api url
        var url = this.buildUrl("/streams", arr);

        console.info("URL=" + url);
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
