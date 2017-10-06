'use strict';

System.register([], function (_export, _context) {
    "use strict";

    var _typeof, _createClass, DataParser;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [],
        execute: function () {
            _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
                return typeof obj;
            } : function (obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };

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

            _export('DataParser', DataParser = function () {
                function DataParser() {
                    _classCallCheck(this, DataParser);
                }

                _createClass(DataParser, [{
                    key: 'parseCsvData',
                    value: function parseCsvData(data) {
                        if (typeof data != 'string') throw new MediaError('expected string, got ' + (typeof data === 'undefined' ? 'undefined' : _typeof(data)));

                        throw new Error('nyi');
                    }
                }, {
                    key: 'parseAggData',
                    value: function parseAggData(data) {

                        console.info("parseAggData");
                        var target = data._embedded.stream._links.id;

                        var result = {};

                        var addValue = function addValue(name, time, value) {

                            if (value != null) {
                                if (typeof value == "number") {
                                    var key = target + "." + name;
                                    if (!(key in result)) result[key] = [];
                                    var val = [value, time];
                                    result[key].push(val);
                                } else if ('coordinates' in value) {

                                    var x = value.coordinates[0];
                                    var y = value.coordinates[1];
                                    addValue("x." + name, time, x);
                                    addValue("y." + name, time, y);
                                }
                            }
                        };

                        data.results.forEach(function (d) {
                            var time = new Date(d.t).getTime();
                            var value = d.v;

                            var avg = value.avg;
                            var min = value.min;
                            var max = value.max;
                            var med = value.median;

                            if (med != null) addValue("median", time, med);
                            if (avg != null) addValue("avg", time, avg);
                            if (min != null) addValue("min", time, min);
                            if (max != null) addValue("max", time, max);
                        });

                        var ret = _.map(result, function (value, key, collection) {
                            return {
                                "target": key,
                                "datapoints": value
                            };
                        });

                        return ret;
                    }
                }, {
                    key: 'parseDataSingle',
                    value: function parseDataSingle(data) {
                        console.info("DataParser.parseDataSingle");

                        var target = data._embedded.stream._links.self.id;

                        var result = {};

                        var addObject = function addObject(key, value, time) {
                            if (!(key in result)) result[key] = [];

                            var val = [value, time];
                            result[key].push(val);
                        };

                        data.results.forEach(function (d) {
                            var time = new Date(d.t).getTime();

                            if ('v' in d) {
                                if ('v' in d.v) {
                                    addObject(target, d.v.v, time);
                                } else if ('p' in d.v) {
                                    addObject(target + ".X", d.v.p.coordinates[0], time);
                                    addObject(target + ".Y", d.v.p.coordinates[1], time);
                                    addObject(target + ".Z", d.v.p.coordinates[2], time);
                                }
                            }
                        });

                        var ret = _.map(result, function (value, key, collection) {
                            return {
                                "target": key,
                                "datapoints": value
                            };
                        });

                        return ret;
                    }
                }, {
                    key: 'parseData',
                    value: function parseData(data) {
                        console.info("DataParser.parseData");
                        var data2 = {};

                        var addValue = function addValue(name, value, timevalue) {
                            if (!(name in data2)) {
                                data2[name] = [];
                            }
                            var val = [value, timevalue];
                            data2[name].push(val);
                        };

                        data.results.forEach(function (d) {
                            var time;
                            for (time in d) {
                                break;
                            }

                            var timevalue = new Date(time).getTime();

                            for (var key in d[time]) {

                                if ('v' in d[time][key]) {
                                    addValue(key, d[time][key].v, timevalue);
                                } else if ('p' in d[time][key]) {
                                    addValue(key + ".X", d[time][key].p.coordinates[0], timevalue);
                                    addValue(key + ".Y", d[time][key].p.coordinates[1], timevalue);
                                    addValue(key + ".Z", d[time][key].p.coordinates[2], timevalue);
                                }
                            }
                        });

                        return _.map(data2, function (value, key, collection) {
                            return { "target": key, "datapoints": value };
                        });
                    }
                }]);

                return DataParser;
            }());

            _export('DataParser', DataParser);
        }
    };
});
//# sourceMappingURL=dataparse.js.map
