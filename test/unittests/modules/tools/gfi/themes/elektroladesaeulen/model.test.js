import {expect} from "chai";
import Model from "@modules/tools/gfi/themes/elektroladesaeulen/model.js";
import * as moment from "moment";

var model;

before(function () {
    model = new Model();

    moment.locale("de");
});

describe("tools/gfi/themes/elektroladesaeulen", function () {

    describe("splitProperties", function () {
        it("should return an empty object for undefined input", function () {
            expect(model.splitProperties(undefined)).to.be.an("object").that.is.empty;
        });
        it("should return an empty object for empty object input", function () {
            expect(model.splitProperties({})).to.be.an("object").that.is.empty;
        });
        it("should return an object with values as array for object with Pipes input", function () {
            var properties = {
                Stecker: "Typ2/Schuko | Typ2/Schuko",
                DatastreamID: "100 | 200"
            };

            expect(model.splitProperties(properties))
                .to.nested.include({"Stecker[0]": "Typ2/Schuko"})
                .and.to.nested.include({"Stecker[1]": "Typ2/Schuko"})
                .and.to.nested.include({"DatastreamID[0]": "100"})
                .and.to.nested.include({"DatastreamID[1]": "200"});
        });
        it("should return an empty object for incorrect object without Pipes input", function () {
            var properties = {
                Stecker: "Typ2/Schuko",
                DatastreamID: 100
            };

            expect(model.splitProperties(properties)).to.be.an("object")
                .to.nested.include({"Stecker[0]": "Typ2/Schuko"})
                .and.to.nested.include({"DatastreamID[0]": "100"});
        });
        it("should return an empty object for incorrect object with values as array and object input", function () {
            var properties = {
                Stecker: ["Typ2/Schuko"],
                DatastreamID: {a: "b"}
            };

            expect(model.splitProperties(properties)).to.be.an("object")
                .to.nested.include({"Stecker[0]": "Typ2/Schuko"})
                .and.to.nested.include({"DatastreamID[0]": ""});
        });
    });
    describe("createGfiHeadingChargingStation", function () {
        it("should return an object with keys and blank values for undefined input", function () {
            expect(model.createGfiHeadingChargingStation(undefined)).to.be.an("object").that.includes({
                StandortID: "",
                Adresse: "",
                Eigentümer: ""
            });
        });
        it("should return an object with keys and blank values for empty object input", function () {
            expect(model.createGfiHeadingChargingStation({})).to.be.an("object").that.includes({
                StandortID: "",
                Adresse: "",
                Eigentümer: ""
            });
        });
        it("should return an object with adress as object for correct object input", function () {
            var allProperties = {
                chargings_station_nr: ["100", "100"],
                location_name: ["Musterstrasse", "Musterstrasse"],
                postal_code: ["99999", "99999"],
                city: ["Hamburg", "Hamburg"],
                owner: ["Mustermann", "Mustermann"]
            };

            expect(model.createGfiHeadingChargingStation(allProperties)).to.be.an("object").that.includes({
                StandortID: "100",
                Adresse: "Musterstrasse, 99999 Hamburg",
                Eigentümer: "Mustermann"
            });
        });
        it("should return an object with adress as object for correct object input", function () {
            var allProperties = {
                chargings_station_nr: [100],
                dd: ["Musterstrasse", "Musterstrasse"],
                thtbeefvvw: ["99999", "99999"],
                city: ["Hamburg", "Hamburg"],
                owner: ["Mustermann"]
            };

            expect(model.createGfiHeadingChargingStation(allProperties)).to.be.an("object").that.includes({
                StandortID: "100",
                Adresse: "",
                Eigentümer: "Mustermann"
            });
        });
    });
    describe("createGfiTableHeadingChargingStation", function () {
        it("should return an empty array for undefined input", function () {
            expect(model.createGfiTableHeadingChargingStation(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty object input", function () {
            expect(model.createGfiTableHeadingChargingStation({})).to.be.an("array").that.is.empty;
        });
        it("should return an array with Ladezeiten for correct object input", function () {
            var allProperties = {
                sms_no_charging_station: ["1001", "1002"]
            };

            expect(model.createGfiTableHeadingChargingStation(allProperties)).to.be.an("array").that.includes("Ladepunkt: 1001", "Ladepunkt: 1002");
        });
        it("should return an empty array for incorrect object input", function () {
            var allProperties = {
                sms_noa_chargiaasng_station: ["1001", "1002"]
            };

            expect(model.createGfiTableHeadingChargingStation(allProperties)).to.be.an("array").that.is.empty;
        });
    });
    describe("changeStateToGerman", function () {
        it("should return an empty object for undefined input", function () {
            expect(model.changeStateToGerman(undefined)).to.be.an("object").that.is.empty;
        });
        it("should return an empty object for empty object input", function () {
            expect(model.changeStateToGerman({})).to.be.an("object").that.is.empty;
        });
        it("should return an empty object for correct object input", function () {
            var gfiProperties = {
                Zustand: ["available", "charging", "outoforder"]
            };

            expect(model.changeStateToGerman(gfiProperties)).to.be.an("object")
                .to.nested.include({"Zustand[0]": "Frei"})
                .and.to.nested.include({"Zustand[1]": "Belegt"})
                .and.to.nested.include({"Zustand[2]": "Außer Betrieb"});
        });
        it("should return an empty object for incorrect object input", function () {
            var gfiProperties = {
                Zustand: ["xxx", "yyy", "zzz"]
            };

            expect(model.changeStateToGerman(gfiProperties)).to.be.an("object")
                .to.nested.include({"Zustand[0]": ""})
                .and.to.nested.include({"Zustand[1]": ""})
                .and.to.nested.include({"Zustand[2]": ""});
        });
    });
    describe("buildRequestFromQuery", function () {
        it("should return an empty string for undefined input", function () {
            expect(model.buildRequestFromQuery(undefined, undefined, undefined)).to.be.an("string").that.is.empty;
        });
        it("should return an empty string for strings input", function () {
            expect(model.buildRequestFromQuery("test", "test", "test")).to.be.an("string").that.is.empty;
        });
        it("should return url as string for strings input, version as string that contains a number", function () {
            expect(model.buildRequestFromQuery("test", "test", "1.0")).to.be.an("string").to.equal("test/v1.0/Datastreamstest");
        });
        it("should return url as string for correct input", function () {
            expect(model.buildRequestFromQuery("?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc;$filter=phenomenonTime gt 2017-12-11T00:00:00.000Z)&$filter=@iot.id eq'89'or @iot.id eq'727'",
                "https://51.5.242.162/itsLGVhackathon", "1.0"))
                .to.be.an("string")
                .to.equal("https://51.5.242.162/itsLGVhackathon/v1.0/Datastreams?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc;$filter=phenomenonTime gt 2017-12-11T00:00:00.000Z)&$filter=@iot.id eq'89'or @iot.id eq'727'");
        });
    });
    describe("dataCleaning", function () {
        it("should return an empty array for undefined input", function () {
            expect(model.dataCleaning(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty array input", function () {
            expect(model.dataCleaning([])).to.be.an("array").that.is.empty;
        });
        it("should return an array that is equal to input array for incorrect array input", function () {
            expect(model.dataCleaning([
                "xyz", 123, "xyz", "abcde"
            ])).to.be.an("array").that.includes("xyz", 123, "xyz", "abcde");
        });
        it("should return an array without doublicates for correct array input", function () {
            var dataArray = [{
                Observations: [{
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available"
                },
                {
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available"
                }]
            },
            {
                Observations: [{
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "charging"
                },
                {
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "available"
                }]
            }];

            expect(model.dataCleaning(dataArray)).to.have.deep.members([{
                Observations: [{
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available"
                }]
            },
            {
                Observations: [{
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "charging"
                },
                {
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "available"
                }]
            }]);
        });
    });
    describe("checkObservationsNotEmpty", function () {
        it("should return false for undefined input", function () {
            expect(model.checkObservationsNotEmpty(undefined)).to.be.false;
        });
        it("should return false for empty array input", function () {
            expect(model.checkObservationsNotEmpty([])).to.be.false;
        });
        it("should return false for incorrect array input", function () {
            expect(model.checkObservationsNotEmpty(["test", "abc"])).to.be.false;
        });
        it("should return true for correct array input", function () {
            var historicalData = [{
                Observations: [{
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available"
                },
                {
                    phenomenonTime: "2018-06-17T12:55:52",
                    result: "charging"
                }]
            }];

            expect(model.checkObservationsNotEmpty(historicalData)).to.be.true;
        });
    });
    describe("changeTimeZone", function () {
        it("should return an empty array for undefined input", function () {
            expect(model.changeTimeZone(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty array and timezone +3 input", function () {
            expect(model.changeTimeZone([], "+3")).to.be.an("array").that.is.empty;
        });
        it("should return an array that is equal to input array for incorrect array and timezone +1 input", function () {
            expect(model.changeTimeZone(["test", "abc"], "+1")).to.be.an("array").that.includes("test", "abc");
        });
        it("should return array with changend phenomenonTime for correct array and timezone +5 input", function () {
            var historicalData = [{
                Observations: [{
                    phenomenonTime: "2018-06-19T07:13:57.421Z",
                    result: "available"
                },
                {
                    phenomenonTime: "2018-01-19T07:13:57.421Z",
                    result: "charging"
                }]
            }];

            expect(model.changeTimeZone(historicalData, "+5")).to.be.an("array");
        });
    });
    describe("addIndex", function () {
        it("should return an empty array for undefined input", function () {
            expect(model.addIndex(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty array input", function () {
            expect(model.addIndex([])).to.be.an("array").that.is.empty;
        });
        it("should return an array that is equal to input array for incorrect array input", function () {
            expect(model.addIndex(["test", "abc"])).to.be.an("array").that.includes("test", "abc");
        });
        it("should return array with index for correct array input", function () {
            var historicalData = [{
                Observations: [{
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available"
                }]
            },
            {
                Observations: [{
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "charging"
                },
                {
                    phenomenonTime: "2018-06-17T12:59:15",
                    result: "available"
                }]
            }];

            expect(model.addIndex(historicalData)).to.be.an("array").to.have.deep.members([{
                Observations: [{
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available",
                    index: 0
                }]
            },
            {
                Observations: [{
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "charging",
                    index: 0
                },
                {
                    phenomenonTime: "2018-06-17T12:59:15",
                    result: "available",
                    index: 1
                }]
            }]);
        });
    });
    describe("divideDataByWeekday", function () {
        it("should return an array with seven empty arrays for undefined input", function () {
            expect(model.divideDataByWeekday(undefined, undefined, undefined)).to.be.an("array").to.have.deep.members([
                [], [], [], [], [], [], []
            ]);
        });
        it("should return an array with seven empty arrays for empty array and empty string input", function () {
            expect(model.divideDataByWeekday([], "", "")).to.be.an("array").to.have.deep.members([
                [], [], [], [], [], [], []
            ]);
        });
        it("should return an array with seven empty arrays for empty array and empty string input", function () {
            expect(model.divideDataByWeekday(["test", 1111, "abcd"], "", "xa")).to.be.an("array").to.have.deep.members([
                [], [], [], [], [], [], []
            ]);
        });
        it("should return an array with seven arrays that contains divided data for correct data without lastDay input", function () {
            var historicalDataWithIndex = [{
                    Observations: [{
                        phenomenonTime: "2018-06-17T10:55:52",
                        result: "available",
                        index: 0
                    }]
                },
                {
                    Observations: [{
                        phenomenonTime: "2018-06-17T12:59:15",
                        result: "charging",
                        index: 0
                    },
                    {
                        phenomenonTime: "2018-06-17T12:57:15",
                        result: "available",
                        index: 1
                    }]
                }],
                endDay = "2018-06-19";

            expect(model.divideDataByWeekday(historicalDataWithIndex, "", endDay)).to.be.an("array").to.have.deep.members([
                [[{
                    phenomenonTime: "2018-06-19T00:00:00",
                    result: "available"
                }],
                [{
                    phenomenonTime: "2018-06-19T00:00:00",
                    result: "charging"
                }]],
                [[{
                    phenomenonTime: "2018-06-18T00:00:00",
                    result: "available"
                }],
                [{
                    phenomenonTime: "2018-06-18T00:00:00",
                    result: "charging"
                }]],
                [[{
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available",
                    index: 0
                }],
                [{
                    phenomenonTime: "2018-06-17T12:59:15",
                    result: "charging",
                    index: 0
                },
                {
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "available",
                    index: 1

                }]],
                [], [], [], []
            ]);
        });
    });
    describe("processDataForAllWeekdays", function () {
        it("should return an empty array for undefined input", function () {
            expect(model.processDataForAllWeekdays(undefined, undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty input", function () {
            expect(model.processDataForAllWeekdays([], "", "")).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for incorrect input", function () {
            expect(model.processDataForAllWeekdays(["xyz", 83247], "", "")).to.be.an("array").that.is.empty;
        });
        it("should return an array with seven arrays that contains divided data for correct data without lastDay input", function () {
            var historicalData = [{
                    Observations: [{
                        phenomenonTime: "2018-06-17T10:55:52",
                        result: "available",
                        index: 0
                    }]
                },
                {
                    Observations: [{
                        phenomenonTime: "2018-06-17T12:59:15",
                        result: "charging",
                        index: 0
                    },
                    {
                        phenomenonTime: "2018-06-17T12:57:15",
                        result: "available",
                        index: 1
                    }]
                }],
                endDay = "2018-06-19";

            expect(model.processDataForAllWeekdays(historicalData, "", endDay)).to.be.an("array").to.have.deep.members([
                [[{
                    phenomenonTime: "2018-06-19T00:00:00",
                    result: "available"
                }],
                [{
                    phenomenonTime: "2018-06-19T00:00:00",
                    result: "charging"
                }]],
                [[{
                    phenomenonTime: "2018-06-18T00:00:00",
                    result: "available"
                }],
                [{
                    phenomenonTime: "2018-06-18T00:00:00",
                    result: "charging"
                }]],
                [[{
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available",
                    index: 0
                }],
                [{
                    phenomenonTime: "2018-06-17T12:59:15",
                    result: "charging",
                    index: 0
                },
                {
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "available",
                    index: 1

                }]],
                [], [], [], []
            ]);
        });
    });
    describe("addGfiParams", function () {
        it("should return an empty string for undefined input", function () {
            expect(model.addGfiParams(undefined, undefined)).to.be.an("string").that.is.empty;
        });
        it("should return an empty string for empty input", function () {
            expect(model.addGfiParams("", {})).to.be.an("string").that.is.empty;
        });
        it("should return an empty string for incorrect input", function () {
            expect(model.addGfiParams("abc", {xyz: 2})).to.be.an("string").that.includes("abc");
        });
        it("should return query with date as string for correct input", function () {
            var query = "?$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc",
                gfiParams = {
                    startDate: "31.01.2018"
                };

            expect(model.addGfiParams(query, gfiParams)).to.be.an("string").that.includes("?"
                + "$select=@iot.id&$expand=Observations($select=result,phenomenonTime;$orderby=phenomenonTime desc"
                + ";$filter=phenomenonTime gt 2018-01-10T00:00:00.000Z");
        });
    });
    describe("filterDataByActualTimeStep", function () {
        it("should return an empty object for undefined input", function () {
            expect(model.filterDataByActualTimeStep(undefined, undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty object for empty input", function () {
            expect(model.filterDataByActualTimeStep([], "", "")).to.be.an("array").that.is.empty;
        });
        it("should return an empty object for incorrect input", function () {
            expect(model.filterDataByActualTimeStep([{test: "text"}], "123", "abc")).to.be.an("array").that.is.empty;
        });
        it("should return an array with objects between the timesteps for correct input", function () {
            var dayData = [{
                    phenomenonTime: "2018-06-21T00:00:00",
                    result: "charging"
                },
                {
                    phenomenonTime: "2018-06-21T01:10:00",
                    result: "available"
                }],
                actualTimeStep = "2018-06-21T01:00:00",
                nextTimeStep = "2018-06-21T02:00:00";

            expect(model.filterDataByActualTimeStep(dayData, actualTimeStep, nextTimeStep)).to.have.deep.members([{
                phenomenonTime: "2018-06-21T01:10:00",
                result: "available"
            }]);
        });
    });
    describe("calculateOneHour", function () {
        it("should return number 0 for undefined input", function () {
            expect(model.calculateOneHour(undefined, undefined, undefined, undefined, undefined, undefined)).to.be.a("number").to.equal(0);
        });
        it("should return number 0 for empty input", function () {
            expect(model.calculateOneHour([], "", -1, "", "", "")).to.be.a("number").to.equal(0);
        });
        it("should return number 0 for empty input", function () {
            expect(model.calculateOneHour([{test: "123"}], "abc", -999, "1123", "hhh", "bbb")).to.be.a("number").to.equal(0);
        });
        it("should return number 0.167 for a result change after 10 minutes input", function () {
            var dataByActualTimeStep = [{
                    phenomenonTime: "2018-06-21T01:10:00",
                    result: "available"
                }],
                actualState = "charging",
                actualStateAsNumber = 1,
                actualTimeStep = "2018-06-21T01:00:00",
                nextTimeStep = "2018-06-21T02:00:00",
                targetResult = "charging";

            expect(model.calculateOneHour(dataByActualTimeStep, actualState, actualStateAsNumber,
                actualTimeStep, nextTimeStep, targetResult)).to.be.a("number").to.equal(0.167);
        });
    });
    describe("calculateWorkloadforOneDay", function () {
        it("should return an empty object for undefined input", function () {
            expect(model.calculateWorkloadforOneDay(undefined, undefined, undefined)).to.be.an("object").that.is.empty;
        });
        it("should return an empty object for empty input", function () {
            expect(model.calculateWorkloadforOneDay({}, [], "")).to.be.an("object").that.is.empty;
        });
        it("should return object that includes data from input object for incorrect input", function () {
            var emptyDayObj = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
                    8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
                    16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0},
                dayData = [{
                    phenomenonTime: "2018-06-20T00:00:00",
                    result: "available"
                },
                {
                    phenomenonTime: "2018-06-20T22:00:00",
                    result: "charging"
                }],
                targetResult = "charging";

            expect(model.calculateWorkloadforOneDay(emptyDayObj, dayData, targetResult)).to.be.an("object").that.includes({
                0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
                8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0,
                15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 1, 23: 1
            });
        });
    });
    describe("calculateWorkloadPerDayPerHour", function () {
        it("should return an empty array for undefined input", function () {
            expect(model.calculateWorkloadPerDayPerHour(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty input", function () {
            expect(model.calculateWorkloadPerDayPerHour([], "")).to.be.an("array").that.is.empty;
        });
        it("should return an array with 24 objects array for incorrect input", function () {
            expect(model.calculateWorkloadPerDayPerHour(["abc"], "123")).to.be.an("array").to.have.deep.members([{
                0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
                8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0,
                15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0
            }]);
        });
        it("should return an array with 24 objects representing the workload array for correct input", function () {
            var divideDataByWeekday = [[{
                    phenomenonTime: "2018-06-07T00:00:00",
                    result: "available"
                },
                {
                    phenomenonTime: "2018-06-07T23:00:00",
                    result: "charging"
                }]],
                targetResult = "charging";

            expect(model.calculateWorkloadPerDayPerHour(divideDataByWeekday, targetResult)).to.be.an("array").to.have.deep.members([{
                0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
                8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0,
                15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1
            }]);
        });
    });
    describe("arrayPerHour", function () {
        it("should return an empty array for undefined input", function () {
            expect(model.arrayPerHour(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty input", function () {
            expect(model.arrayPerHour([], -1)).to.be.an("array").that.is.empty;
        });
        it("should return an array with data from input array for incorrect input", function () {
            expect(model.arrayPerHour(["abc"], 1)).to.be.an("array").that.is.empty;
        });
        it("should return an array with data for correct input", function () {
            var dataPerHour = [{
                0: 1,
                1: 0
            },
            {
                0: 1,
                1: 1
            },
            {
                0: 0,
                1: 0
            }];

            expect(model.arrayPerHour(dataPerHour, 1)).to.be.an("array").that.includes(0, 1, 0);
        });
    });
    describe("calculateSumAndArithmeticMean", function () {
        it("should return an empty array for undefined input", function () {
            expect(model.calculateSumAndArithmeticMean(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty input", function () {
            expect(model.calculateSumAndArithmeticMean([])).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for incorrect input", function () {
            expect(model.calculateSumAndArithmeticMean(["abc"])).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for undefined input", function () {
            var dataPerHour = [{
                0: 1,
                1: 0
            },
            {
                0: 1,
                1: 1
            },
            {
                0: 0,
                1: 0
            }];

            expect(model.calculateSumAndArithmeticMean(dataPerHour)).to.be.an("array").to.have.deep.members([{
                hour: 0,
                sum: 2,
                mean: 0.667
            },
            {
                hour: 1,
                sum: 1,
                mean: 0.333
            }]);
        });
    });
    describe("checkValue", function () {
        it("should return undefined for undefined input", function () {
            expect(model.checkValue(undefined, undefined)).to.be.an("undefined");
        });
        it("should return undefined for empty input", function () {
            expect(model.checkValue([], "")).to.be.an("undefined");
        });
        it("should return undefined for incorrect input", function () {
            expect(model.checkValue(["abc"], "def")).to.be.an("undefined");
        });
        it("should return data for correct input", function () {
            var processedData = [{
                hour: 0,
                sum: 2,
                mean: 0.667
            },
            {
                hour: 1,
                sum: 1,
                mean: 0.333
            }];

            expect(model.checkValue(processedData, "mean")).to.be.an("object").that.includes({
                hour: 0,
                sum: 2,
                mean: 0.667
            });
        });
    });
    describe("createXAxisLabel", function () {

        it("should return empty string for undefined input", function () {
            expect(model.createXAxisLabel(undefined, undefined)).to.be.an("string").that.is.empty;
        });
        it("should return empty string for empty input", function () {
            expect(model.createXAxisLabel("", "")).to.be.an("string").that.is.empty;
        });
        it("should return empty string for incorrect input", function () {
            expect(model.createXAxisLabel("abc", "def")).to.be.an("string").that.is.empty;
        });
        it("should return empty string for incorrect input", function () {
            var day = moment("2018-06-22T10:05:52").format("dddd");

            expect(model.createXAxisLabel(day, "charging")).to.be.an("string").to.equal("Durchschnittliche "
            + "Auslastung Freitags");
        });
    });
});
