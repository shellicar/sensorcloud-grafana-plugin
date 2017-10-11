
export class DataParser {
    constructor() {

    }

    parseCsvData(data) {
        if (typeof data != 'string')
            throw new MediaError('expected string, got ' + typeof data);

        throw new Error('nyi');
    }

    parseAggData(data) {

        console.info("parseAggData");
        console.error('target=' + target);

        // find stream ID
        var target = data._embedded.stream.id;
        if(target == null)
            target = data._embedded.stream._links.id;

        console.error('target=' + target);

        var result = {};

        var addValue = (name, time, value) => {

            if (value != null) {
                if (typeof value == "number") {
                    var key = target + "." + name;
                    if (!(key in result))
                        result[key] = [];
                    var val = [value, time];
                    result[key].push(val);
                }
                else if ('coordinates' in value) {

                    var x = value.coordinates[0];
                    var y = value.coordinates[1];
                    addValue("x." + name, time, x);
                    addValue("y." + name, time, y);
                }
            }
        }

        data.results.forEach(d => {
            var time = new Date(d.t).getTime();
            var value = d.v;

            var avg = value.avg;
            var min = value.min;
            var max = value.max;
            var med = value.median;

            if (med != null)
                addValue("median", time, med);
            if (avg != null)
                addValue("avg", time, avg);
            if (min != null)
                addValue("min", time, min);
            if (max != null)
                addValue("max", time, max);

        })


        var ret = _.map(result, (value, key, collection) => {
            return {
                "target": key,
                "datapoints": value
            }
        });

        return ret;
    }

    parseDataSingle(data) {
        console.info("DataParser.parseDataSingle");

        var target = data._embedded.stream._links.self.id;

        var result = {};

        var addObject = (key, value, time) => {
            if (!(key in result))
                result[key] = [];

            var val = [value, time];
            result[key].push(val);
        }


        data.results.forEach(d => {
            var time = new Date(d.t).getTime();

            if ('v' in d) {
                if ('v' in d.v) {
                    addObject(target, d.v.v, time);
                }
                else if ('p' in d.v) {
                    addObject(target + ".X", d.v.p.coordinates[0], time);
                    addObject(target + ".Y", d.v.p.coordinates[1], time);
                    addObject(target + ".Z", d.v.p.coordinates[2], time);
                }
            }
        });

        var ret = _.map(result, (value, key, collection) => {
            return {
                "target": key,
                "datapoints": value
            }
        });

        return ret;
    }

    parseData(data) {
        console.info("DataParser.parseData");
        var data2 = {};

        var addValue = (name, value, timevalue) => {
            if (!(name in data2)) {
                data2[name] = [];
            }
            var val = [value, timevalue];
            data2[name].push(val);
        }

        data.results.forEach(d => {
            var time;
            for (time in d) { break; }

            var timevalue = new Date(time).getTime();

            for (var key in d[time]) {

                if ('v' in d[time][key]) {
                    addValue(key, d[time][key].v, timevalue);
                }
                else if ('p' in d[time][key]) {
                    addValue(key + ".X", d[time][key].p.coordinates[0], timevalue);
                    addValue(key + ".Y", d[time][key].p.coordinates[1], timevalue);
                    addValue(key + ".Z", d[time][key].p.coordinates[2], timevalue);
                }

            }
        });

        return _.map(data2, (value, key, collection) => {
            return { "target": key, "datapoints": value }
        });
    }

}
