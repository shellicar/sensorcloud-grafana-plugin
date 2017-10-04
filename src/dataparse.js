
export class DataParser {
    constructor() {

    }

    parseData(data) {
        console.info("DataParser.parseData");
        var result = [];
        
            var data2 = {};
        
            for (var i = 0; i < data.results.length; ++i) {
              var d = data.results[i];
              var time = Object.keys(d)[0];
              var timevalue = new Date(time).getTime();
        
              for (var key in d[time]) {
                var value = d[time][key].v;
                if (value != null) {
        
                  if (!(key in data2))
                  {
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
            return result;
    }
}
