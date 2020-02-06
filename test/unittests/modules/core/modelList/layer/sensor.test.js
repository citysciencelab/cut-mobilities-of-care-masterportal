import SensorLayerModel from "@modules/core/modelList/layer/sensor.js";
import * as moment from "moment";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import LineString from "ol/geom/LineString";
import {expect} from "chai";
import VectorLayer from "ol/layer/Vector.js";
import {Vector as VectorSource} from "ol/source.js";
import sinon from "sinon";

describe("core/modelList/layer/sensor", function () {
    var sensorLayer;

    before(function () {
        sensorLayer = new SensorLayerModel();
        sensorLayer.set("url", "test/test/test", {silent: true});

        moment.locale("de");

        sinon.stub(Radio, "request").callsFake(function (channel, topic) {
            if (channel === "MapView" && topic === "getCurrentExtent") {
                return [100, 100, 200, 200];
            }
            else if (channel === "MapView" && topic === "getProjection") {
                return "EPSG:25832";
            }
            else if (channel === "Map" && topic === "registerListener") {
                return {"key": "test"};
            }

            return null;
        });
    });

    after(function () {
        sinon.restore();
    });

    describe("initialize", function () {
        it("ol/layer is not declared on startup", function () {
            expect(sensorLayer.get("layer")).to.be.undefined;
        });
    });

    describe("buildSensorThingsUrl", function () {
        it("should return url as String for undefined input", function () {
            expect(sensorLayer.buildSensorThingsUrl(undefined, undefined, undefined)).to.be.a("string");
        });
        it("should return version in String", function () {
            expect(sensorLayer.buildSensorThingsUrl(undefined, 1.0, undefined)).to.have.string("v1.0");
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
    describe("aggregatePropertiesOfThings", function () {
        it("should set one Thing in a simple way without aggregation", function () {
            const allThings = [
                    {
                        name: "foo",
                        description: "bar",
                        properties: {
                            "baz": "qux"
                        },
                        Locations: [{
                            location: {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: [1, 2, 3]
                                }
                            }
                        }],
                        Datastreams: [{"foobar": 1}]
                    }
                ],
                expectedOutcome = [{
                    location: [1, 2, 3],
                    properties: {
                        baz: "qux",
                        name: "foo",
                        description: "bar",
                        requestUrl: "http://example.com",
                        versionUrl: "1.0"
                    }
                }];

            sensorLayer.set("url", "http://example.com", {silent: true});
            sensorLayer.set("version", "1.0", {silent: true});

            expect(sensorLayer.aggregatePropertiesOfThings(allThings)).to.deep.equal(expectedOutcome);
        });
        it("should aggregate Things if there is more than one thing", function () {
            const allThings = [[
                    {
                        name: "foo",
                        description: "bar",
                        properties: {
                            "baz": "qux"
                        },
                        Locations: [{
                            location: {
                                type: "Point",
                                coordinates: [3, 4, 5]
                            }
                        }]
                    },
                    {
                        name: "oof",
                        description: "rab",
                        properties: {
                            "baz": "xuq"
                        },
                        Locations: [{
                            location: {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: [3, 4, 5]
                                }
                            }
                        }]
                    }
                ]],
                expectedOutcome = [{
                    location: [3, 4, 5],
                    properties: {
                        baz: "qux | xuq",
                        name: "foo | oof",
                        description: "bar | rab",
                        requestUrl: "http://example.com",
                        versionUrl: "1.0"
                    }
                }];

            sensorLayer.set("url", "http://example.com", {silent: true});
            sensorLayer.set("version", "1.0", {silent: true});

            expect(sensorLayer.aggregatePropertiesOfThings(allThings)).to.deep.equal(expectedOutcome);
        });
    });
    describe("flattenArray", function () {
        it("should return flattened array", function () {
            expect(sensorLayer.flattenArray([["1", "2"], ["3"], ["4"]])).to.deep.equal(["1", "2", "3", "4"]);
        });
        it("should return empty array on empty array input", function () {
            expect(sensorLayer.flattenArray([])).to.deep.equal([]);
        });
        it("should return empty array on undefined input", function () {
            expect(sensorLayer.flattenArray(undefined)).to.be.undefined;
        });
        it("should return empty array on other input", function () {
            expect(sensorLayer.flattenArray(123)).to.equal(123);
            expect(sensorLayer.flattenArray("123")).to.equal("123");
            expect(sensorLayer.flattenArray({id: "123"})).to.deep.equal({id: "123"});
        });
    });
    describe("enlargeExtent", function () {
        it("should return correctly enlarged extent", function () {
            expect(sensorLayer.enlargeExtent([100, 100, 200, 200], 0.1)).to.be.an("array").to.have.ordered.members([90, 90, 210, 210]);
        });
        it("should return correctly reduced extent", function () {
            expect(sensorLayer.enlargeExtent([100, 100, 200, 200], -0.1)).to.be.an("array").to.have.ordered.members([110, 110, 190, 190]);
        });
    });

    describe("getFeaturesInExtent", function () {
        it("should return no feature within extent", function () {
            sensorLayer.setLayer(new VectorLayer({
                source: new VectorSource(),
                name: "test",
                typ: "SensorThings",
                id: "123"
            }));
            sensorLayer.get("layer").getSource().addFeatures([new Feature({
                geometry: new Point([50, 50])
            })]);

            expect(sensorLayer.getFeaturesInExtent()).to.be.an("array").that.is.empty;
        });

        it("should return only one feature within extent", function () {
            sensorLayer.get("layer").getSource().addFeatures([new Feature({
                geometry: new Point([150, 150])
            })]);

            expect(sensorLayer.getFeaturesInExtent()).to.be.an("array").to.have.lengthOf(1);
        });

        it("should also return a feature inside enlarged extent", function () {
            sensorLayer.get("layer").getSource().addFeatures([new Feature({
                geometry: new Point([201, 201])
            })]);

            expect(sensorLayer.getFeaturesInExtent()).to.be.an("array").to.have.lengthOf(2);
        });
    });

    describe("checkConditionsForSubscription", function () {
        it("should be undefined on startup", function () {
            expect(sensorLayer.checkConditionsForSubscription()).to.be.undefined;
            expect(sensorLayer.get("isSubscribed")).to.be.false;
        });

        it("should be true when inRange and selected", function () {
            sensorLayer.set("isOutOfRange", false, {silent: true});
            sensorLayer.set("isSelected", true, {silent: true});
            expect(sensorLayer.checkConditionsForSubscription()).to.be.true;
        });

        it("should be false when out of range", function () {
            sensorLayer.set("isOutOfRange", true, {silent: true});
            sensorLayer.set("isSelected", true, {silent: true});
            sensorLayer.set("isSubscribed", true, {silent: true});
            expect(sensorLayer.checkConditionsForSubscription()).to.be.false;
        });

        it("should be false when unselected", function () {
            sensorLayer.set("isOutOfRange", false, {silent: true});
            sensorLayer.set("isSelected", false, {silent: true});
            expect(sensorLayer.checkConditionsForSubscription()).to.be.false;
        });
    });

    describe("changedConditions", function () {
        it("should set moveendListener", function () {
            sensorLayer.set("isSubscribed", false, {silent: true});
            sensorLayer.set("isOutOfRange", false, {silent: true});
            sensorLayer.set("isSelected", true, {silent: true});
            sensorLayer.changedConditions();
            expect(sensorLayer.get("moveendListener")).to.not.be.null;
        });

        it("should unset moveendListener", function () {
            sensorLayer.set("isSubscribed", true, {silent: true});
            sensorLayer.set("isOutOfRange", true, {silent: true});
            sensorLayer.set("isSelected", true, {silent: true});
            sensorLayer.changedConditions();
            expect(sensorLayer.get("moveendListener")).to.be.null;
        });
    });

    describe("subscribeToSensorThings", function () {
        let topics = [];

        it("should subscribe on a topic", function () {
            topics = [];
            sensorLayer.set("mqttClient", {
                subscribe: function (topic) {
                    topics.push(topic);
                }
            });

            sensorLayer.set("subscriptionTopics", {});
            sensorLayer.subscribeToSensorThings();

            expect(topics).to.deep.equal(["v1.0/Datastreams()/Observations"]);
        });
        it("should not subscribe on a topic that has already been subscribed", function () {
            topics = [];
            sensorLayer.set("mqttClient", {
                unsubscribe: function (topic) {
                    topics.push(topic);
                }
            });

            sensorLayer.set("subscriptionTopics", {
                "": true
            });
            sensorLayer.subscribeToSensorThings();

            expect(topics).to.be.empty;
        });
    });

    describe("unsubscribeFromSensorThings", function () {
        let topics = [];

        it("should unsubscribe from a topic", function () {
            topics = [];
            sensorLayer.set("mqttClient", {
                unsubscribe: function (topic) {
                    topics.push(topic);
                }
            });

            sensorLayer.set("subscriptionTopics", {
                "foo": true
            });
            sensorLayer.unsubscribeFromSensorThings();

            expect(topics).to.deep.equal(["v1.0/Datastreams(foo)/Observations"]);
        });
        it("should not unsubscribe from a topic that is already unsubscribed", function () {
            topics = [];
            sensorLayer.set("mqttClient", {
                unsubscribe: function (topic) {
                    topics.push(topic);
                }
            });

            sensorLayer.set("subscriptionTopics", {
                "foo": false
            });
            sensorLayer.unsubscribeFromSensorThings();

            expect(topics).to.be.empty;
        });
    });

    describe("updateObservationForDatastreams", function () {
        const feature = new Feature({
            Datastreams: [{
                "@iot.id": "foo",
                Observations: []
            }, {
                "@iot.id": "bar",
                Observations: []
            }]
        });

        it("should add the given observation to the property Datastreams where the datastream id equals the given datastream id", function () {
            sensorLayer.updateObservationForDatastreams(feature, "foo", "qox");

            expect(feature.get("Datastreams")[0].Observations).to.deep.equal(["qox"]);
            expect(feature.get("Datastreams")[1].Observations).to.be.empty;
        });
    });

    describe("getJsonGeometry", function () {
        it("should return the location in geometry", function () {
            const testObject = {
                Locations: [
                    {
                        location: {
                            geometry: {
                                type: "Point",
                                test: "Test"
                            }
                        }
                    }
                ]
            };

            expect(sensorLayer.getJsonGeometry(testObject, 0)).to.be.an("object").to.include({test: "Test"});
            expect(sensorLayer.getJsonGeometry(testObject, 1)).to.be.null;
        });
        it("should return the location without geometry", function () {
            const testObject2 = {
                Locations: [
                    {
                        location: {
                            type: "Point",
                            test: "Test"
                        }
                    }
                ]
            };

            expect(sensorLayer.getJsonGeometry(testObject2, 0)).to.be.an("object").to.include({test: "Test"});
            expect(sensorLayer.getJsonGeometry(testObject2, 1)).to.be.null;
        });
    });

    describe("parseJson", function () {
        it("should parse point object", function () {
            const obj = {
                "type": "Point",
                "coordinates": [10.210913, 53.488449]
            };

            sensorLayer.set("epsg", "EPSG:4326", {silent: true});
            expect(sensorLayer.parseJson(obj)).to.be.an.instanceof(Feature);
            expect(sensorLayer.parseJson(obj).getGeometry()).to.be.an.instanceof(Point);
        });
    });

    describe("parseJson", function () {
        it("should parse line object", function () {
            const obj = {
                "type": "LineString",
                "coordinates": [[10.210913, 53.488449], [11.210913, 54.488449]]
            };

            sensorLayer.set("epsg", "EPSG:4326", {silent: true});
            expect(sensorLayer.parseJson(obj)).to.be.an.instanceof(Feature);
            expect(sensorLayer.parseJson(obj).getGeometry()).to.be.an.instanceof(LineString);
        });
    });
});
