
export class DataParser {
    constructor() {

    }

    parseCsvData(data) {
        if (typeof data != 'string')
            throw new MediaError('expected string, got ' + typeof data);

        throw new Error('nyi');
    }

    parseDataSingle(data) {
        console.info("DataParser.parseDataSingle");

        /* var parseobj = obj => {
             return [obj.v.v, new Date(obj.t).getTime()];
         }*/

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
                console.error('adding: ' + name);
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
