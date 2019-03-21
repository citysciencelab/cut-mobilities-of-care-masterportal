import {expect} from "chai";
import SensorLayerModel from "@modules/core/modelList/layer/sensor.js";
import * as moment from "moment";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";


describe("core/modelList/layer/sensor", function () {
    var sensorLayer;

    before(function () {
        sensorLayer = new SensorLayerModel();

        moment.locale("de");
    });

    describe("buildSensorThingsURL", function () {
        it("should return url as String for undefined input", function () {
            expect(sensorLayer.buildSensorThingsURL(undefined, undefined, undefined)).to.be.a("string");
        });
        it("should return version in String", function () {
            expect(sensorLayer.buildSensorThingsURL(undefined, 1.0, undefined)).to.have.string("v1.0");
        });
    });

    describe("getCoordinates", function () {
        it("should return an undefined for undefined input", function () {
            expect(sensorLayer.getCoordinates(undefined)).to.be.undefined;
        });
        it("should return an undefined for empty array input", function () {
            expect(sensorLayer.getCoordinates([])).to.be.undefined;
        });
        it("should return in array with coordinates as array from input object", function () {
            var thing = {
                Locations: [{
                    location: {
                        type: "Feature",
                        geometry: {
                            coordinates: [100, 100]
                        }
                    }
                }]
            };

            expect(sensorLayer.getCoordinates(thing)).to.deep.equal([100, 100]);
        });
        it("should return undefined if a subitem is missing", function () {
            var thing = {
                Locations: [{
                    location: {
                        type: "Feature"
                    }
                }]
            };

            expect(sensorLayer.getCoordinates(thing)).to.be.undefined;
        });
        it("should return undefined if a subitem is missing", function () {
            var thing1 = {
                Locations: [{
                    location: {
                        type: "Point"
                    }
                }]
            };

            expect(sensorLayer.getCoordinates(thing1)).to.be.undefined;
        });
    });

    describe("mergeByCoordinates", function () {
        it("should return an array that is empty with undefined input", function () {
            expect(sensorLayer.mergeByCoordinates(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an array that is empty for array with testdata", function () {
            var dataArray = [{Test: [{name: "testname"}]}];

            expect(sensorLayer.mergeByCoordinates(dataArray)).to.be.an("array").that.is.empty;
        });
    });

    describe("aggregateArrays", function () {
        it("should return an object that is empty for undefined input", function () {
            expect(sensorLayer.aggregateArrays(undefined)).to.be.an("object").that.is.empty;
        });
        it("should return an array that is empty for an empty array input", function () {
            expect(sensorLayer.aggregateArrays([])).to.be.an("object").that.is.empty;
        });
    });

    describe("addProperties", function () {
        it("should return an array that is empty for undefined input", function () {
            expect(sensorLayer.addProperties(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an array that is empty for an empty array input", function () {
            expect(sensorLayer.addProperties([])).to.be.an("array").that.is.empty;
        });
    });

    describe("combineProperties", function () {
        it("should return an object that is empty for undefined input", function () {
            expect(sensorLayer.combineProperties(undefined, undefined)).to.be.an("object").that.is.empty;
        });
        it("should return an object that is empty for undefined and empty input", function () {
            expect(sensorLayer.combineProperties(undefined, [])).to.be.an("object").that.is.empty;
        });
        it("should return an object that is empty for empty arrays input", function () {
            expect(sensorLayer.combineProperties([], [])).to.be.an("object").that.is.empty;
        });
        it("should return an object that includes keys ans values with Pipes", function () {
            var thingsProperties = [{key1: "Text1", key2: "Text2"}, {key1: "Text3", key2: "Text4"}],
                keys = ["key1", "key2"];

            expect(sensorLayer.combineProperties(keys, thingsProperties)).to.be.an("object").that.includes({
                key1: "Text1 | Text3",
                key2: "Text2 | Text4"});
        });
    });

    describe("changeTimeZone", function () {
        it("should return an empty for undefined input", function () {
            expect(sensorLayer.changeTimeZone(undefined, undefined)).that.have.string("");
        });
        it("should return an empty  string for undefined phenomenontime and utc +1", function () {
            expect(sensorLayer.changeTimeZone(undefined, "+1")).that.have.string("");
        });
        it("should return an string in summertime", function () {
            var summerTime = "2018-06-05T12:11:47.922Z";

            expect(sensorLayer.changeTimeZone(summerTime, "+1")).to.have.string("05 Juni 2018, 14:11:47");
        });
        it("should return an string in wintertime", function () {
            var winterTime = "2018-01-01T12:11:47.922Z";

            expect(sensorLayer.changeTimeZone(winterTime, "+1")).to.have.string("01 Januar 2018, 13:11:47");
        });
    });

    describe("drawPoints", function () {
        it("should return a empty array for empty array input", function () {
            expect(sensorLayer.drawPoints(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return a empty array for undefined input", function () {
            expect(sensorLayer.drawPoints([], undefined)).to.be.an("array").that.is.empty;
        });
        it("should return a empty array for obj and undefined epsg input", function () {
            var data = [{location: [10, 10]}];

            expect(sensorLayer.drawPoints(data, undefined)).to.be.an("array").that.is.empty;
        });
    });
    describe("getFeatureByDataStreamId", function () {
        it("should return a empty array for undefined input", function () {
            expect(sensorLayer.getFeatureByDataStreamId(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return a empty array for given id and undefined features input", function () {
            expect(sensorLayer.getFeatureByDataStreamId(15, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return a empty array for undefined id and empty array input", function () {
            expect(sensorLayer.getFeatureByDataStreamId(undefined, [])).to.be.an("array").that.is.empty;
        });
        it("should return a empty array for given id an empty array input", function () {
            expect(sensorLayer.getFeatureByDataStreamId(15, [])).to.be.an("array").that.is.empty;
        });
        it("should return a empty array for false id an empty array input", function () {
            expect(sensorLayer.getFeatureByDataStreamId("xyz", [])).to.be.an("array").that.is.empty;
        });
        it("should return a empty array", function () {
            var feature0 = new Feature({
                    geometry: new Point([100, 100])
                }),
                feature1 = new Feature({
                    geometry: new Point([100, 100])
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getFeatureByDataStreamId("xyz", features)).to.be.an("array").that.is.empty;
        });
    });
    describe("getDataStreamIds", function () {
        it("should return a empty array for undefined input", function () {
            expect(sensorLayer.getDataStreamIds(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an array with Strings for features input", function () {
            var feature0 = new Feature({
                    geometry: new Point([100, 100])
                }),
                feature1 = new Feature({
                    geometry: new Point([100, 100])
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getDataStreamIds(features)).to.be.an("array").that.includes("", "");
        });
    });


});
