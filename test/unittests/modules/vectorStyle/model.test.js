import {expect} from "chai";
import Model from "@modules/vectorStyle/model";
import Util from "@testUtil";
import Feature from "ol/Feature.js";

describe("vectorStyle", function () {
    let model,
        utilModel,
        features,
        vectorStyle;

    before(function () {
        utilModel = new Util();

        features = utilModel.createTestFeatures("resources/testFeatures.xml");
        vectorStyle = new Model();
    });

    describe("createStyle", function () {
        it("should return default style if feature is undefined and not clustered", function () {
            model = new Model({});

            const defaultStyleObj = {},
                defaultValues = {
                    circleRadius: 5,
                    circleFillColor: "rgba(255,255,255,0.4)",
                    circleStrokeColor: "#3399CC",
                    circleStrokeWidth: 1.25,
                    fillColor: "rgba(255,255,255,0.4)",
                    strokeColor: "#3399CC",
                    strokeWidth: 1.25
                },
                defaultStyle = model.createStyle(undefined, false);

            defaultStyleObj.circleRadius = defaultStyle.getImage().getRadius();
            defaultStyleObj.circleFillColor = defaultStyle.getImage().getFill().getColor();
            defaultStyleObj.circleStrokeColor = defaultStyle.getImage().getStroke().getColor();
            defaultStyleObj.circleStrokeWidth = defaultStyle.getImage().getStroke().getWidth();
            defaultStyleObj.fillColor = defaultStyle.getFill().getColor();
            defaultStyleObj.strokeColor = defaultStyle.getStroke().getColor();
            defaultStyleObj.strokeWidth = defaultStyle.getStroke().getWidth();
            expect(defaultStyleObj).to.deep.equal(defaultValues);
        });

        it("should return default style if class !== \"POINT\" || \"POLYGON\" || \"LINE\"", function () {
            const style = {
                    class: "POINT_WRONG"
                },
                defaultStyleObj = {};
            var defaultStyle;

            model = new Model(style);

            defaultStyle = model.createStyle(features[0], false);
            defaultStyleObj.circleRadius = defaultStyle.getImage().getRadius();
            defaultStyleObj.circleFillColor = defaultStyle.getImage().getFill().getColor();
            defaultStyleObj.circleStrokeColor = defaultStyle.getImage().getStroke().getColor();
            defaultStyleObj.circleStrokeWidth = defaultStyle.getImage().getStroke().getWidth();
            defaultStyleObj.fillColor = defaultStyle.getFill().getColor();
            defaultStyleObj.strokeColor = defaultStyle.getStroke().getColor();
            defaultStyleObj.strokeWidth = defaultStyle.getStroke().getWidth();
        });

        it("should return default style if subClass !== \"SIMPLE\" || \"CUSTOM\" || \"CIRCLE\"", function () {
            const style = {
                    subClass: "SIMPLE_WRONG"
                },
                defaultStyleObj = {},
                defaultValues = {
                    circleRadius: 5,
                    circleFillColor: "rgba(255,255,255,0.4)",
                    circleStrokeColor: "#3399CC",
                    circleStrokeWidth: 1.25,
                    fillColor: "rgba(255,255,255,0.4)",
                    strokeColor: "#3399CC",
                    strokeWidth: 1.25
                };
            var defaultStyle;

            model = new Model(style);

            defaultStyle = model.createStyle(features[0], false);
            defaultStyleObj.circleRadius = defaultStyle.getImage().getRadius();
            defaultStyleObj.circleFillColor = defaultStyle.getImage().getFill().getColor();
            defaultStyleObj.circleStrokeColor = defaultStyle.getImage().getStroke().getColor();
            defaultStyleObj.circleStrokeWidth = defaultStyle.getImage().getStroke().getWidth();
            defaultStyleObj.fillColor = defaultStyle.getFill().getColor();
            defaultStyleObj.strokeColor = defaultStyle.getStroke().getColor();
            defaultStyleObj.strokeWidth = defaultStyle.getStroke().getWidth();
            expect(defaultStyleObj).to.deep.equal(defaultValues);
        });

        describe("POINT SIMPLE", function () {
            it("should return style with default simplePoint values", function () {
                const style = {
                        class: "POINT",
                        subClass: "SIMPLE"
                    },
                    createdStyleObj = {},
                    expectedValues = {
                        imageName: "/lgv-config/img/blank.png", // undefined, da wir nicht aus der Config und Util den Pfad holen.
                        imageScale: 1
                    };
                var createdStyle;

                model = new Model(style);

                createdStyle = model.createStyle(features[0], false);
                createdStyleObj.imageName = createdStyle.getImage().getSrc();
                createdStyleObj.imageScale = createdStyle.getImage().getScale();
                expect(createdStyleObj).to.deep.equal(expectedValues);
            });

            it("should return style with set simplePoint values", function () {
                const style = {
                        class: "POINT",
                        subClass: "SIMPLE",
                        imageName: "krankenhaus.png",
                        imageScale: 2.5
                    },
                    createdStyleObj = {},
                    expectedValues = {
                        imageName: "/lgv-config/img/krankenhaus.png", // undefined, da wir nicht aus der Config und Util den Pfad holen.
                        imageScale: 2.5,
                        imageSize: ""
                    };
                var createdStyle;

                model = new Model(style);

                createdStyle = model.createStyle(features[0], false);
                createdStyleObj.imageName = createdStyle.getImage().getSrc();
                createdStyleObj.imageScale = createdStyle.getImage().getScale();
                createdStyleObj.imageSize = createdStyle.getImage().getSize();
                expect(createdStyleObj).to.deep.equal(expectedValues);
            });
        });

        describe("POINT CUSTOM", function () {
            it("should return default style if styleField and StyleFieldValues[0] do not match", function () {
                const style = {
                        layerId: "1711",
                        class: "POINT",
                        subClass: "CUSTOM",
                        styleField: "",
                        styleFieldValues: [
                            {
                                styleFieldValue: "TESTTEST",
                                imageName: "krankenhaus.png"
                            }
                        ]
                    },
                    defaultValues = {
                        circleRadius: 5,
                        circleFillColor: "rgba(255,255,255,0.4)",
                        circleStrokeColor: "#3399CC",
                        circleStrokeWidth: 1.25,
                        fillColor: "rgba(255,255,255,0.4)",
                        strokeColor: "#3399CC",
                        strokeWidth: 1.25
                    },
                    defaultStyleObj = {};
                var defaultStyle;

                model = new Model(style);

                defaultStyle = model.createStyle(features[0], false);
                defaultStyleObj.circleRadius = defaultStyle.getImage().getRadius();
                defaultStyleObj.circleFillColor = defaultStyle.getImage().getFill().getColor();
                defaultStyleObj.circleStrokeColor = defaultStyle.getImage().getStroke().getColor();
                defaultStyleObj.circleStrokeWidth = defaultStyle.getImage().getStroke().getWidth();
                defaultStyleObj.fillColor = defaultStyle.getFill().getColor();
                defaultStyleObj.strokeColor = defaultStyle.getStroke().getColor();
                defaultStyleObj.strokeWidth = defaultStyle.getStroke().getWidth();
                expect(defaultStyleObj).to.deep.equal(defaultValues);
            });
            it("should return custom style if", function () {
                const style = {
                        layerId: "1711",
                        class: "POINT",
                        subClass: "CUSTOM",
                        styleField: "kh_nummer",
                        styleFieldValues: [
                            {
                                styleFieldValue: "20",
                                imageName: "krankenhaus.png",
                                imageScale: 2.5
                            }
                        ]
                    },
                    expectedValues = {
                        imageName: "/lgv-config/img/krankenhaus.png",
                        imageScale: 2.5,
                        imageSize: "" // imageSize wird nur dann als array gesetzt, wenn der imageName mit .svg endet.
                    },
                    createdStyleObj = {};
                var createdStyle;

                model = new Model(style);

                createdStyle = model.createStyle(features[0], false);
                createdStyleObj.imageName = createdStyle.getImage().getSrc();
                createdStyleObj.imageScale = createdStyle.getImage().getScale();
                createdStyleObj.imageSize = createdStyle.getImage().getSize();
                expect(createdStyleObj).to.deep.equal(expectedValues);
            });
        });

        describe("getRangeValueFromRangeAttribute", function () {
            const testFeatureForRangeValue = {
                get: function (key) {
                    if (key === "foo") {
                        return 100;
                    }
                    else if (key === "undefined") {
                        return 101;
                    }
                    else if (key === " ") {
                        return 102;
                    }
                    else if (key === "1") {
                        return "this should never happen";
                    }
                    else if (key === 1) {
                        return "and this should also never happen";
                    }
                    return undefined;
                }
            };

            it("should return the value of rangeAttribute as key of the given feature if rangeAttribute is not a Number", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, "foo", null)).to.equal(100);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, "undefined", null)).to.equal(101);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, " ", null)).to.equal(102);
            });
            it("should return the default value if rangeAttribute is not a number and not a feature key", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, "bar", "baz")).to.equal("baz");
            });
            it("should return the given rangeAttribute if rangeAttribute is a Number - even if no feature is given", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, 1, null)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, "1", null)).to.equal("1");
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, false, 1)).to.equal(false);
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, true, 1)).to.equal(true);
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, null, 1)).to.equal(null);
            });
            it("should return the given default value if an undefined rangeAttribute is given - even if no feature is given", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, undefined, 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, undefined, "bar")).to.equal("bar");
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, undefined, {bar: "baz"})).to.deep.equal({bar: "baz"});
            });

            it("should handle a rangeAttribute of the type Number always as max value, never as key of the feature", function () {
                // see testFeatureForRangeValue and its reaction to the key "1"
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, 1, null)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, "1", null)).to.equal("1");
            });
            it("should return the default value if anything unexpected is given", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(undefined, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(false, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(true, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute("bar", "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(123456, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute([1, 2, 3], "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute({}, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute({get: "bar"}, "foo", 1)).to.equal(1);

                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, undefined, 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, [1, 2, 3], 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, {}, 1)).to.equal(1);
            });
        });

        describe("getRangeValueFromRangeAttribute", function () {
            const testFeatureForRangeValue = {
                get: function (key) {
                    if (key === "foo") {
                        return 100;
                    }
                    else if (key === "undefined") {
                        return 101;
                    }
                    else if (key === " ") {
                        return 102;
                    }
                    else if (key === "1") {
                        return "this should never happen";
                    }
                    else if (key === 1) {
                        return "and this should also never happen";
                    }
                    return undefined;
                }
            };

            it("should return the value of rangeAttribute as key of the given feature if rangeAttribute is not a Number", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, "foo", null)).to.equal(100);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, "undefined", null)).to.equal(101);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, " ", null)).to.equal(102);
            });
            it("should return the default value if rangeAttribute is not a number and not a feature key", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, "bar", "baz")).to.equal("baz");
            });
            it("should return the given rangeAttribute if rangeAttribute is a Number - even if no feature is given", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, 1, null)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, "1", null)).to.equal("1");
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, false, 1)).to.equal(false);
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, true, 1)).to.equal(true);
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, null, 1)).to.equal(null);
            });
            it("should return the given default value if an undefined rangeAttribute is given - even if no feature is given", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, undefined, 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, undefined, "bar")).to.equal("bar");
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, undefined, {bar: "baz"})).to.deep.equal({bar: "baz"});
            });

            it("should handle a rangeAttribute of the type Number always as max value, never as key of the feature", function () {
                // see testFeatureForRangeValue and its reaction to the key "1"
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, 1, null)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, "1", null)).to.equal("1");
            });
            it("should return the default value if anything unexpected is given", function () {
                expect(vectorStyle.getRangeValueFromRangeAttribute(null, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(undefined, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(false, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(true, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute("bar", "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(123456, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute([1, 2, 3], "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute({}, "foo", 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute({get: "bar"}, "foo", 1)).to.equal(1);

                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, undefined, 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, [1, 2, 3], 1)).to.equal(1);
                expect(vectorStyle.getRangeValueFromRangeAttribute(testFeatureForRangeValue, {}, 1)).to.equal(1);
            });
        });

        describe("isFeatureValueInStyleFieldRange", function () {
            it("should check wheather or not an absolute value is in a given absolute range [x..y[", function () {
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, [0, 1])).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(1, [0, 1])).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(20, [20, 30])).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(30, [20, 30])).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(-30, [-30, -20])).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(-20, [-30, -20])).to.be.false;
            });
            it("should interpret null in a range as infinit", function () {
                expect(vectorStyle.isFeatureValueInStyleFieldRange(Number.MIN_SAFE_INTEGER, [null, 0])).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, [null, 0])).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(Number.MAX_SAFE_INTEGER, [0, null])).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, [1, null])).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(Number.MIN_SAFE_INTEGER, [null, null])).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(Number.MAX_SAFE_INTEGER, [null, null])).to.be.true;
            });
            it("should calculate a given value into a relative range if a maximum value is given to process", function () {
                expect(vectorStyle.isFeatureValueInStyleFieldRange(20, [0.2, 0.8], 100)).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(80, [0.2, 0.8], 100)).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(Number.MAX_SAFE_INTEGER / 2, [0.5, null], Number.MAX_SAFE_INTEGER)).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(Number.MAX_SAFE_INTEGER / 2, [null, 0.5], Number.MAX_SAFE_INTEGER)).to.be.false;
            });
            it("should calculate a given value into a relative range if a maximum and minimum value is given to process", function () {
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, [0.5, null], 50, -50)).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, [null, 0.5], 50, -50)).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, [0.5, null], Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER)).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, [null, 0.5], Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER)).to.be.false;
            });
            it("should process values even if they are numbers hidden in strings", function () {
                expect(vectorStyle.isFeatureValueInStyleFieldRange("-100", [null, null])).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange("100", [null, null])).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange("0.123456789", [null, null])).to.be.true;
                expect(vectorStyle.isFeatureValueInStyleFieldRange("foo", [null, null])).to.be.false;
            });

            it("should not process null as value - as null stands for infinit in this case", function () {
                expect(vectorStyle.isFeatureValueInStyleFieldRange(null, [null, null])).to.be.false;
            });
            it("should not process funny ranges", function () {
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, null)).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, {})).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, [1, 2, 3])).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, [1])).to.be.false;
                expect(vectorStyle.isFeatureValueInStyleFieldRange(0, "foo")).to.be.false;
            });
        });

        describe("getStyleFieldValueObject", function () {
            it("should return false if no feature, no styleFieldValues or no styleFieldParam as String or Object is given", function () {
                expect(vectorStyle.getStyleFieldValueObject({foo: "bar"}, false, [1, 2, 3])).to.be.false;
                expect(vectorStyle.getStyleFieldValueObject(false, {foo: "bar"}, [1, 2, 3])).to.be.false;
                expect(vectorStyle.getStyleFieldValueObject(false, "baz", [1, 2, 3])).to.be.false;
                expect(vectorStyle.getStyleFieldValueObject({foo: "bar"}, {foo: "bar"}, false)).to.be.false;
                expect(vectorStyle.getStyleFieldValueObject({foo: "bar"}, "baz", false)).to.be.false;
            });
            it("should return null when no feature attribute matches the given styleFieldName", function () {
                expect(vectorStyle.getStyleFieldValueObject(features[0], "unknown styleFieldName given", [])).to.be.null;
            });
            it("should return null when no styleFieldValue matched any entry of given styleFieldValues", function () {
                let styleFieldValues = [
                    {styleFieldValue: "baz"},
                    {styleFieldValue: "qux"},
                    {styleFieldValue: "foobar"}
                ];

                features[0].set("foo", "bar");
                expect(vectorStyle.getStyleFieldValueObject(features[0], "foo", styleFieldValues)).to.be.null;

                styleFieldValues = [{}, {}, {}];
                expect(vectorStyle.getStyleFieldValueObject(features[0], "foo", styleFieldValues)).to.be.null;
            });

            it("should return the entry of styleFieldValues that matches a given styleFieldValue if both are strings", function () {
                const styleFieldValues = [
                        {styleFieldValue: "baz"},
                        {styleFieldValue: "bar", foobar: 123},
                        {styleFieldValue: "qux"}
                    ],
                    expectedValue = {styleFieldValue: "bar", foobar: 123};

                features[0].set("foo", "bar");
                expect(vectorStyle.getStyleFieldValueObject(features[0], "foo", styleFieldValues)).to.deep.equal(expectedValue);
            });
            it("should return the entry of styleFieldValues that finds styleFieldValue within its range", function () {
                const styleFieldValues = [
                        {styleFieldValue: [null, 0]},
                        {styleFieldValue: [0, 1], foobar: 123},
                        {styleFieldValue: [1, null]}
                    ],
                    expectedValue = {styleFieldValue: [0, 1], foobar: 123};

                features[0].set("foo", 0);
                expect(vectorStyle.getStyleFieldValueObject(features[0], "foo", styleFieldValues)).to.deep.equal(expectedValue);
            });
            it("should return the entry of styleFieldValues that finds styleFieldValue within its relative range setup by min and max range values", function () {
                const styleFieldValues = [
                        {styleFieldValue: [0, 0.5]},
                        {styleFieldValue: [0.5, 1], foobar: 123},
                        {styleFieldValue: [1, null]}
                    ],
                    maxRangeAttribute = 200,
                    minRangeAttribute = -200,
                    expectedValue = {styleFieldValue: [0.5, 1], foobar: 123};

                features[0].set("foo", 0);
                expect(vectorStyle.getStyleFieldValueObject(features[0], "foo", styleFieldValues, maxRangeAttribute, minRangeAttribute)).to.deep.equal(expectedValue);
            });
            it("should return a styleFieldValues entry that has styleFieldValue within its relative range setup by min and max range values found in the feature", function () {
                const styleFieldValues = [
                        {styleFieldValue: [0, 0.5]},
                        {styleFieldValue: [0.5, 1], foobar: 123},
                        {styleFieldValue: [1, null]}
                    ],
                    maxRangeAttribute = "fooMax",
                    minRangeAttribute = "fooMin",
                    expectedValue = {styleFieldValue: [0.5, 1], foobar: 123};

                features[0].set("foo", 0);
                features[0].set("fooMax", 200);
                features[0].set("fooMin", -200);
                expect(vectorStyle.getStyleFieldValueObject(features[0], "foo", styleFieldValues, maxRangeAttribute, minRangeAttribute)).to.deep.equal(expectedValue);
            });
        });

        describe("POINT CIRCLE", function () {
            it("should return style with default circle values", function () {
                const style = {
                        class: "POINT",
                        subClass: "CIRCLE"
                    },
                    circleStyleObj = {},
                    defaultValues = {
                        radius: 10,
                        fillColor: [0, 153, 255, 1],
                        strokeColor: [0, 0, 0, 1],
                        strokeWidth: 2
                    };
                var circleStyle;

                model = new Model(style);

                circleStyle = model.createStyle(features[0], false);
                circleStyleObj.radius = circleStyle.getImage().getRadius();
                circleStyleObj.fillColor = circleStyle.getImage().getFill().getColor();
                circleStyleObj.strokeColor = circleStyle.getImage().getStroke().getColor();
                circleStyleObj.strokeWidth = circleStyle.getImage().getStroke().getWidth();
                expect(circleStyleObj).to.deep.equal(defaultValues);
            });
            it("should return style with given circle values", function () {
                const style = {
                        class: "POINT",
                        subClass: "CIRCLE",
                        circleRadius: 20,
                        circleFillColor: [255, 255, 255, 1],
                        circleStrokeColor: [123, 123, 123, 0],
                        circleStrokeWidth: 30
                    },
                    circleStyleObj = {},
                    expectedValues = {
                        radius: 20,
                        fillColor: [255, 255, 255, 1],
                        strokeColor: [123, 123, 123, 0],
                        strokeWidth: 30
                    };
                var circleStyle;

                model = new Model(style);

                circleStyle = model.createStyle(features[0], false);
                circleStyleObj.radius = circleStyle.getImage().getRadius();
                circleStyleObj.fillColor = circleStyle.getImage().getFill().getColor();
                circleStyleObj.strokeColor = circleStyle.getImage().getStroke().getColor();
                circleStyleObj.strokeWidth = circleStyle.getImage().getStroke().getWidth();
                expect(circleStyleObj).to.deep.equal(expectedValues);
            });
        });

        describe("LINE SIMPLE", function () {
            it("should return a simple line style", function () {
                const style = {
                        class: "LINE",
                        subClass: "SIMPLE",
                        lineStrokeColor: [1, 1, 1, 1],
                        lineStrokeWidth: 1
                    },
                    lineModel = new Model(style),
                    lineStyle = lineModel.createStyle(features[0], false),
                    circleStyleObj = {},
                    expectedValues = {
                        strokeColor: [1, 1, 1, 1],
                        strokeWidth: 1,
                        strokeDash: null
                    };

                circleStyleObj.strokeColor = lineStyle.getStroke().getColor();
                circleStyleObj.strokeWidth = lineStyle.getStroke().getWidth();
                circleStyleObj.strokeDash = lineStyle.getStroke().getLineDash();

                expect(circleStyleObj).to.deep.equal(expectedValues);
            });

            it("should return a simple dashed line style", function () {
                const style = {
                        class: "LINE",
                        subClass: "SIMPLE",
                        lineStrokeColor: [1, 1, 1, 1],
                        lineStrokeWidth: 1,
                        lineStrokeDash: [1, 1]
                    },
                    lineModel = new Model(style),
                    lineStyle = lineModel.createStyle(features[0], false),
                    circleStyleObj = {},
                    expectedValues = {
                        strokeColor: [1, 1, 1, 1],
                        strokeWidth: 1,
                        strokeDash: [1, 1]
                    };

                circleStyleObj.strokeColor = lineStyle.getStroke().getColor();
                circleStyleObj.strokeWidth = lineStyle.getStroke().getWidth();
                circleStyleObj.strokeDash = lineStyle.getStroke().getLineDash();

                expect(circleStyleObj).to.deep.equal(expectedValues);
            });

            it("should return a line style with a specific style selected out of its styleFieldValues", function () {
                const style = {
                        class: "LINE",
                        subClass: "SIMPLE",
                        lineStrokeColor: [1, 1, 1, 1],
                        lineStrokeWidth: 1,
                        lineStrokeDash: [1, 1],
                        styleField: "foo",
                        styleFieldValues: [
                            {
                                styleFieldValue: "bar",
                                lineStrokeColor: [2, 2, 2, 1],
                                lineStrokeWidth: 2,
                                lineStrokeDash: [2, 2]
                            },
                            {
                                styleFieldValue: "baz",
                                lineStrokeColor: [3, 3, 3, 1],
                                lineStrokeWidth: 3,
                                lineStrokeDash: [3, 3]
                            }
                        ]
                    },
                    lineModel = new Model(style),
                    circleStyleObj = {},
                    expectedValues = {
                        strokeColor: [2, 2, 2, 1],
                        strokeWidth: 2,
                        strokeDash: [2, 2]
                    };
                var lineStyle;

                features[0].set("foo", "bar");
                lineStyle = lineModel.createStyle(features[0], false);
                circleStyleObj.strokeColor = lineStyle.getStroke().getColor();
                circleStyleObj.strokeWidth = lineStyle.getStroke().getWidth();
                circleStyleObj.strokeDash = lineStyle.getStroke().getLineDash();

                expect(circleStyleObj).to.deep.equal(expectedValues);
            });
        });

        describe("TEXT SIMPLE", function () {
            it("should return simple style with text", function () {
                const style = {
                    class: "POINT",
                    subClass: "SIMPLE",
                    imageName: "krankenhaus.png",
                    labelField: "name"
                };
                var text;

                model = new Model(style);
                text = model.createStyle(features[0], false).getText().getText();
                expect(text).to.be.equal("Evangelisches Krankenhaus Alsterdorf");
            });
        });
        describe("TEXT CLUSTERED", function () {
            it("should return style with cluster text", function () {
                const style = {
                        class: "POINT",
                        subClass: "SIMPLE",
                        imageName: "krankenhaus.png",
                        labelField: "name"
                    },
                    clusterFeature = new Feature({features: [features[0], features[1]]});
                var text;

                model = new Model(style);
                text = model.createStyle(clusterFeature, true).getText().getText();
                expect(text).to.equal("2");
            });
            it("should return style with no text", function () {
                const style = {
                        class: "POINT",
                        subClass: "SIMPLE",
                        imageName: "krankenhaus.png",
                        labelField: "name",
                        clusterText: "NONE"
                    },
                    clusterFeature = new Feature({features: [features[0], features[1]]});
                var text;

                model = new Model(style);
                text = model.createStyle(clusterFeature, true).getText();
                expect(text).to.be.undefined;
            });
            it("should return style with given text", function () {
                const style = {
                        class: "POINT",
                        subClass: "SIMPLE",
                        imageName: "krankenhaus.png",
                        labelField: "name",
                        clusterText: "mehrere Features"
                    },
                    clusterFeature = new Feature({features: [features[0], features[1]]});
                var text;

                model = new Model(style);
                text = model.createStyle(clusterFeature, true).getText().getText();
                expect(text).to.be.equal("mehrere Features");
            });
        });
    });
    describe("getScalingAttributesAsObject", function () {
        it("should return an object with empty = 0 for undefined input", function () {
            expect(vectorStyle.getScalingAttributesAsObject(undefined)).to.be.an("object").to.include({
                empty: 0
            });
        });
        it("should return an object with empty = 0 for empty input", function () {
            expect(vectorStyle.getScalingAttributesAsObject({})).to.be.an("object").to.include({
                empty: 0
            });
        });
        it("should return an object with available = 0 and empty = 0 for correct input", function () {
            expect(vectorStyle.getScalingAttributesAsObject({available: [
                0, 220, 0, 0
            ]})).to.be.an("object").to.include({
                available: 0,
                empty: 0
            });
        });
    });
    describe("fillScalingAttributes", function () {
        it("should return an object with empty = 0 for undefined input", function () {
            expect(vectorStyle.fillScalingAttributes(undefined, undefined)).to.be.an("object").to.include({
                empty: 0
            });
        });
        it("should return an object with empty = 0 for empty input", function () {
            expect(vectorStyle.fillScalingAttributes({}), "").to.be.an("object").to.include({
                empty: 0
            });
        });
        it("should return an object with empty = 1 for object with empty: 0 and false string input", function () {
            expect(vectorStyle.fillScalingAttributes({empty: 0}, "test")).to.be.an("object").to.include({
                empty: 1
            });
        });
        it("should return an object with empty = 0 for undefined input", function () {
            const scalingAttributesAsObject = {
                    available: 0,
                    charging: 0,
                    outoforder: 0,
                    empty: 0
                },
                scalingAttribute = "available | available";

            expect(vectorStyle.fillScalingAttributes(scalingAttributesAsObject, scalingAttribute))
                .to.be.an("object").to.include({
                    available: 2,
                    charging: 0,
                    outoforder: 0,
                    empty: 0
                });
        });
    });
    describe("calculateCircleSegment", function () {
        it("should return a string that contains a circlesegment as svg-string for data of a semicircle input", function () {
            const startAngelDegree = 0,
                endAngelDegree = 180,
                circleRadius = 21,
                size = 58,
                gap = 10;

            expect(vectorStyle.calculateCircleSegment(startAngelDegree, endAngelDegree, circleRadius, size, gap)).to.be.a("string")
                .to.equal("M 49.920088659926655 27.16972940229918 A 21 21 0 0 0 8.079911340073345 27.16972940229918");
        });
    });
    describe("calculateSizeIntervalCircleBar", function () {
        it("should be 10 at large circleBarRadius and small values input", function () {
            expect(vectorStyle.calculateSizeIntervalCircleBar(5, 1, 3, 5)).to.be.a("number").to.equal(10);
        });
        it("should be 20 at large circleBarRadius and large values input", function () {
            expect(vectorStyle.calculateSizeIntervalCircleBar(5, 2, 10, 5)).to.be.a("number").to.equal(30);
        });
        it("should be 10 at large circleBarRadius and stateValue is NaN input", function () {
            expect(vectorStyle.calculateSizeIntervalCircleBar(NaN, 2, 10, 5)).to.be.a("number").to.equal(10);
        });
    });
    describe("calculateLengthIntervalCircleBar", function () {
        it("should be 1 for positive stateValue input", function () {
            expect(vectorStyle.calculateLengthIntervalCircleBar(10, 1, 3, 1)).to.be.a("number").to.equal(1);
        });
        it("should be 12 fop negative stateValue input", function () {
            expect(vectorStyle.calculateLengthIntervalCircleBar(10, 2, -1, 5)).to.be.a("number").to.equal(12);
        });
        it("should be 0 for stateValue is NaN input", function () {
            expect(vectorStyle.calculateLengthIntervalCircleBar(10, 2, NaN, 5)).to.be.a("number").to.equal(0);
        });
        it("should be 0 for stateValue is undefined input", function () {
            expect(vectorStyle.calculateLengthIntervalCircleBar(10, 2, undefined, 5)).to.be.a("number").to.equal(0);
        });
    });
    describe("createNominalCircleSegments", function () {
        it("should be an svg by default values input", function () {
            expect(vectorStyle.createNominalCircleSegments(features[0]))
                .to.equal("<svg width='38' height='38' xmlns='http://www.w3.org/2000/svg'"
                + " xmlns:xlink='http://www.w3.org/1999/xlink'><circle cx='19' cy='19' r='10'"
                + " stroke='#ffffff' stroke-width='4' fill='#ffffff' fill-opacity='0'/></svg>");
        });
    });
    describe("createIntervalCircleBar", function () {
        it("should be an svg by default values input", function () {
            expect(vectorStyle.createIntervalCircleBar(features[0]))
                .to.equal("<svg width='12' height='12' xmlns='http://www.w3.org/2000/svg'"
                + " xmlns:xlink='http://www.w3.org/1999/xlink'><line x1='6' y1='6' x2='6'"
                + " y2='0' stroke='#000000' stroke-width='5' /><circle cx='6' cy='6' r='6'"
                + " stroke='#000000' stroke-width='1' fill='#000000' /></svg>");
        });
        describe("normalizeRgbColor", function () {
            it("should be extend the given array with length 3 by value 1", function () {
                expect(vectorStyle.normalizeRgbColor([255, 255, 255])).to.be.an("array").to.to.include(255, 255, 255, 1);
            });
            it("should be extend the given array with length 2 by value 1, 1", function () {
                expect(vectorStyle.normalizeRgbColor([255, 255])).to.be.an("array").to.to.include(255, 255, 1, 1);
            });
            it("should be return the input value, which is an array with length 4", function () {
                expect(vectorStyle.normalizeRgbColor([0, 0, 0, 0])).to.be.an("array").to.to.include(0, 0, 0, 0);
            });
        });
    });
    describe("translateNameFromObject", function () {
        it("should return 'another_key' for origName= 'another_' and condition= 'startsWith'", function () {
            expect(model.translateNameFromObject(["key1", "another_key"], "another_", "startsWith")).to.equal("another_key");
        });
        it("should return 'another_key' for origName= 'key' and condition= 'endsWith'", function () {
            expect(model.translateNameFromObject(["key1", "another_key"], "key", "endsWith")).to.equal("another_key");
        });
        it("should return 'another_key' for origName= 'other_k' and condition= 'contains'", function () {
            expect(model.translateNameFromObject(["key1", "another_key"], "other_k", "contains")).to.equal("another_key");
        });
        it("should return undefined for invalid condition", function () {
            expect(model.translateNameFromObject(["key1", "another_key"], "other_k", "fooBar")).to.be.undefined;
        });
        it("should return undefined for undefined condition", function () {
            expect(model.translateNameFromObject(["key1", "another_key"], "other_k", undefined)).to.be.undefined;
        });
        it("should return undefined for empty keys", function () {
            expect(model.translateNameFromObject([], "other_k", "contains")).to.be.undefined;
        });
        it("should return undefined for unexpected keys", function () {
            expect(model.translateNameFromObject(undefined, "foo", "bar")).to.be.undefined;
            expect(model.translateNameFromObject(false, "foo", "bar")).to.be.undefined;
            expect(model.translateNameFromObject(null, "foo", "bar")).to.be.undefined;
            expect(model.translateNameFromObject({}, "foo", "bar")).to.be.undefined;
            expect(model.translateNameFromObject("foo", "foo", "bar")).to.be.undefined;
            expect(model.translateNameFromObject(123456, "foo", "bar")).to.be.undefined;
        });
        it("should return undefined for unexpected name parameter", function () {
            expect(model.translateNameFromObject([], undefined, "bar")).to.be.undefined;
            expect(model.translateNameFromObject([], false, "bar")).to.be.undefined;
            expect(model.translateNameFromObject([], null, "bar")).to.be.undefined;
            expect(model.translateNameFromObject([], {}, "bar")).to.be.undefined;
            expect(model.translateNameFromObject([], [], "bar")).to.be.undefined;
            expect(model.translateNameFromObject([], 123456, "bar")).to.be.undefined;
        });
        it("should return undefined for unexpected condition parameter", function () {
            expect(model.translateNameFromObject([], "foo", undefined)).to.be.undefined;
            expect(model.translateNameFromObject([], "foo", false)).to.be.undefined;
            expect(model.translateNameFromObject([], "foo", null)).to.be.undefined;
            expect(model.translateNameFromObject([], "foo", {})).to.be.undefined;
            expect(model.translateNameFromObject([], "foo", [])).to.be.undefined;
            expect(model.translateNameFromObject([], "foo", 123456)).to.be.undefined;
        });
    });
    describe("checkIfMatchesValid", function () {
        it("should return false for more than 1 match", function () {
            expect(model.checkIfMatchesValid("", "", ["key1", "key2"])).to.be.false;
        });
        it("should return true for exactly 1 match", function () {
            expect(model.checkIfMatchesValid("", "", ["key1"])).to.be.true;
        });
        it("should return false for 0 matches", function () {
            expect(model.checkIfMatchesValid("", "", [])).to.be.false;
        });
    });
});
