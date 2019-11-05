import SensorLayerModel from "@modules/core/modelList/layer/sensor.js";
import * as moment from "moment";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import {expect} from "chai";

describe("core/modelList/layer/sensor", function () {
    var sensorLayer;

    before(function () {
        sensorLayer = new SensorLayerModel();

        moment.locale("de");
    });

    describe("buildSensorThingsUrl", function () {
        it("should return url as String for undefined input", function () {
            expect(sensorLayer.buildSensorThingsUrl(undefined, undefined, undefined)).to.be.a("string");
        });
        it("should return version in String", function () {
            expect(sensorLayer.buildSensorThingsUrl(undefined, 1.0, undefined)).to.have.string("v1.0");
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

    describe("createFeatures", function () {
        it("should return a empty array for empty array input", function () {
            expect(sensorLayer.createFeatures(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return a empty array for undefined input", function () {
            expect(sensorLayer.createFeatures([], undefined)).to.be.an("array").that.is.empty;
        });
        it("should return a empty array for obj and undefined epsg input", function () {
            var data = [{location: [10, 10]}];

            expect(sensorLayer.createFeatures(data, undefined)).to.be.an("array").that.is.empty;
        });
    });
    describe("getFeatureByDataStreamId", function () {
        it("should return undefined on undefined inputs", function () {
            expect(sensorLayer.getFeatureByDataStreamId(undefined, undefined)).to.be.undefined;
        });
        it("should return undefined on undefined array", function () {
            expect(sensorLayer.getFeatureByDataStreamId(undefined, "1")).to.be.undefined;
        });
        it("should return undefined on empty array and undefined datastreamid", function () {
            expect(sensorLayer.getFeatureByDataStreamId([], undefined)).to.be.undefined;
        });
        it("should return undefined on empty array", function () {
            expect(sensorLayer.getFeatureByDataStreamId([], "1")).to.be.undefined;
        });
        it("should return a Feature", function () {
            var feature0 = new Feature({
                    dataStreamId: "1",
                    geometry: new Point([100, 100])
                }),
                feature1 = new Feature({
                    dataStreamId: "2",
                    geometry: new Point([100, 100])
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getFeatureByDataStreamId(features, "1")).to.be.an.instanceof(Feature);
        });
        it("should return a Feature with combined dataStreamId", function () {
            var feature0 = new Feature({
                    dataStreamId: "1",
                    geometry: new Point([100, 100])
                }),
                feature1 = new Feature({
                    dataStreamId: "2 | 3",
                    geometry: new Point([100, 100])
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getFeatureByDataStreamId(features, "3")).to.be.an.instanceof(Feature);
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
    describe("aggregateDataStreamValue", function () {
        it("should return undefined for undefined input", function () {
            expect(sensorLayer.aggregateDataStreamValue(undefined)).to.be.undefined;
        });
        it("should return feature as is", function () {
            var feature = new Feature({
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamValue(feature)).to.be.instanceof(Feature);
        });
        it("should return feature with dataStreamValue for one dataStream", function () {
            var feature = new Feature({
                dataStreamId: "123",
                dataStreamName: "ds",
                dataStream_123_ds: "a",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamValue(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamValue(feature).get("dataStreamValue")).to.equal("a");
        });
        it("should return feature with dataStreamValue for more dataStreams", function () {
            var feature = new Feature({
                dataStreamId: "123 | 456",
                dataStreamName: "ds1 | ds2",
                dataStream_123_ds1: "a",
                dataStream_456_ds2: "b",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamValue(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamValue(feature).get("dataStreamValue")).to.equal("a | b");
        });
    });

    describe("aggregateDataStreamPhenomenonTime", function () {
        it("should return undefined for undefined input", function () {
            expect(sensorLayer.aggregateDataStreamPhenomenonTime(undefined)).to.be.undefined;
        });
        it("should return feature as is", function () {
            var feature = new Feature({
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature)).to.be.instanceof(Feature);
        });
        it("should return feature with dataStreamPhenomenonTime for one dataStream", function () {
            var feature = new Feature({
                dataStreamId: "123",
                dataStreamName: "ds",
                dataStream_123_ds_phenomenonTime: "a",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature).get("dataStreamPhenomenonTime")).to.equal("a");
        });
        it("should return feature with dataStreamPhenomenonTime for more dataStreams", function () {
            var feature = new Feature({
                dataStreamId: "123 | 456",
                dataStreamName: "ds1 | ds2",
                dataStream_123_ds1_phenomenonTime: "a",
                dataStream_456_ds2_phenomenonTime: "b",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature).get("dataStreamPhenomenonTime")).to.equal("a | b");
        });
    });

    describe("excludeDataStreamKeys", function () {
        it("should return undefined for undefined input", function () {
            expect(sensorLayer.excludeDataStreamKeys(undefined, undefined)).to.be.undefined;
        });
        it("should return empty array for empty keys", function () {
            expect(sensorLayer.excludeDataStreamKeys([], "test_")).to.be.an("array").that.is.empty;
        });
        it("should return empty array for empty string", function () {
            expect(sensorLayer.excludeDataStreamKeys(["test_1", "test_2"], "")).to.be.undefined;
        });
        it("should return empty array with only one key", function () {
            expect(sensorLayer.excludeDataStreamKeys(["test_1", "test_2", "hello"], "test_")).to.deep.equal(["hello"]);
        });
    });
});
