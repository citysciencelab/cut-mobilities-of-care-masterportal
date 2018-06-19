define(function (require) {
    var expect = require("chai").expect,
        Model = require("../../../../../../../modules/tools/gfi/themes/elektroladesaeulen/model.js"),
        model;

    before(function () {
        model = new Model();
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
                expect(model.divideDataByWeekday(undefined, undefined)).to.be.an("array").to.have.deep.members([
                    [], [], [], [], [], [], []
                ]);
            });
            it("should return an array with seven empty arrays for empty array and empty string input", function () {
                expect(model.divideDataByWeekday([], "")).to.be.an("array").to.have.deep.members([
                    [], [], [], [], [], [], []
                ]);
            });
            it("should return an array with seven empty arrays for empty array and empty string input", function () {
                expect(model.divideDataByWeekday(["test", 1111, "abcd"], "")).to.be.an("array").to.have.deep.members([
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
                }];
                expect(model.divideDataByWeekday(historicalDataWithIndex, "")).to.be.an("array").to.have.deep.members([
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
                expect(model.processDataForAllWeekdays(undefined, undefined)).to.be.an("array").that.is.empty;
            });
            it("should return an empty array for empty input", function () {
                expect(model.processDataForAllWeekdays([], "")).to.be.an("array").that.is.empty;
            });
            it("should return an empty array for incorrect input", function () {
                expect(model.processDataForAllWeekdays(["xyz", 83247], "")).to.be.an("array").that.is.empty;
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
                }];

                expect(model.processDataForAllWeekdays(historicalData, "")).to.be.an("array").to.have.deep.members([
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
        describe("calculateWorkloadPerDayPerHour", function () {
            it("should return an empty string for undefined input", function () {
                expect(model.calculateWorkloadPerDayPerHour(undefined, undefined)).that.is.empty;
            });
        });
    });
});
