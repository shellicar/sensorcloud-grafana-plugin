"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var _createClass, DataParser;

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

      _export("DataParser", DataParser = function () {
        function DataParser() {
          _classCallCheck(this, DataParser);
        }

        _createClass(DataParser, [{
          key: "parseData",
          value: function parseData(data) {
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

                  if (!(key in data2)) {
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
        }]);

        return DataParser;
      }());

      _export("DataParser", DataParser);
    }
  };
});
//# sourceMappingURL=dataparse.js.map
