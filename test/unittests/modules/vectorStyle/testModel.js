define(function(require) {
    var expect = require("chai").expect,
        Model = require("../../../../modules/vectorStyle/model.js"),
        Util = require("util");

    describe("vectorStyle", function () {
        var model,
            utilModel,
            features;

        before(function () {
           utilModel = new Util();
            features = utilModel.createTestFeatures("resources/testFeatures.xml");
        });

        describe("createStyle", function () {
            it("should return default style if feature is undefined and not clustered", function () {
                var defaultStyle,
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

                model = new Model({});
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
                var style = {
                    class: "POINT_WRONG"
                },
                defaultStyle,
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

            it("should return default style if subClass !== \"SIMPLE\" || \"CUSTOM\" || \"CIRCLE\"", function () {
                var style = {
                    subClass: "SIMPLE_WRONG"
                },
                defaultStyle,
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

            describe ("POINT SIMPLE", function () {
                it("should return style with default simplePoint values", function () {
                    var style = {
                            class: "POINT",
                            subClass: "SIMPLE"
                        },
                        createdStyle,
                        createdStyleObj = {},
                        expectedValues = {
                            imageName: "undefinedblank.png", // undefined, da wir nicht aus der Config und Util den Pfad holen.
                            imageScale: 1
                        };

                    model = new Model(style);
                    createdStyle = model.createStyle(features[0], false);
                    createdStyleObj.imageName = createdStyle.getImage().getSrc();
                    createdStyleObj.imageScale = createdStyle.getImage().getScale();
                    expect(createdStyleObj).to.deep.equal(expectedValues);
                });

                it("should return style with set simplePoint values", function () {
                    var style = {
                        class: "POINT",
                            subClass: "SIMPLE",
                            imageName: "krankenhaus.png",
                            imageScale: 2.5
                        },
                        createdStyle,
                        createdStyleObj = {},
                        expectedValues = {
                            imageName: "undefinedkrankenhaus.png", // undefined, da wir nicht aus der Config und Util den Pfad holen.
                            imageScale: 2.5,
                            imageSize : ""
                        };

                    model = new Model(style);
                    createdStyle = model.createStyle(features[0], false);
                    createdStyleObj.imageName = createdStyle.getImage().getSrc();
                    createdStyleObj.imageScale = createdStyle.getImage().getScale();
                    createdStyleObj.imageSize = createdStyle.getImage().getSize();
                    expect(createdStyleObj).to.deep.equal(expectedValues);
                });
            });

            describe ("POINT CUSTOM", function () {
                it("should return default style if styleField and StyleFieldValues[0] do not match", function () {
                    var style = {
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
                    defaultStyle,
                    defaultStyleObj = {};

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
                    var style = {
                        layerId: "1711",
                        class: "POINT",
                        subClass: "CUSTOM",
                        styleField: "kh_nummer",
                        styleFieldValues: [
                            {
                                styleFieldValue: "20",
                                imageName: "krankenhaus.png",
                                imageScale: 2.5,
                            }
                        ]
                    },
                    expectedValues = {
                        imageName: "undefinedkrankenhaus.png",
                        imageScale: 2.5,
                        imageSize: "" //imageSize wird nur dann als array gesetzt, wenn der imageName mit .svg endet.
                    },
                    createdStyle,
                    createdStyleObj = {};

                    model = new Model(style);
                    createdStyle = model.createStyle(features[0], false);
                    createdStyleObj.imageName = createdStyle.getImage().getSrc();
                    createdStyleObj.imageScale = createdStyle.getImage().getScale();
                    createdStyleObj.imageSize = createdStyle.getImage().getSize();
                    expect(createdStyleObj).to.deep.equal(expectedValues);
                });
            });

            describe("POINT CIRCLE", function () {
                it("should return style with default circle values", function () {
                    var style = {
                        class: "POINT",
                        subClass : "CIRCLE"
                    },
                    circleStyle,
                    circleStyleObj = {},
                    defaultValues = {
                        radius: 10,
                        fillColor: [0, 153, 255, 1],
                        strokeColor: [0, 0, 0, 1],
                        strokeWidth: 2
                    };

                    model = new Model(style);
                    circleStyle = model.createStyle(features[0], false);
                    circleStyleObj.radius = circleStyle.getImage().getRadius();
                    circleStyleObj.fillColor = circleStyle.getImage().getFill().getColor();
                    circleStyleObj.strokeColor = circleStyle.getImage().getStroke().getColor();
                    circleStyleObj.strokeWidth = circleStyle.getImage().getStroke().getWidth();
                    expect(circleStyleObj).to.deep.equal(defaultValues);
                });
                it("should return style with given circle values", function () {
                    var style = {
                        class: "POINT",
                        subClass : "CIRCLE",
                        circleRadius: 20,
                        circleFillColor: [255, 255, 255, 1],
                        circleStrokeColor: [123, 123, 123, 0],
                        circleStrokeWidth: 30
                    },
                    circleStyle,
                    circleStyleObj = {},
                    expectedValues = {
                        radius: 20,
                        fillColor: [255, 255, 255, 1],
                        strokeColor: [123, 123, 123, 0],
                        strokeWidth: 30
                    };

                    model = new Model(style);
                    circleStyle = model.createStyle(features[0], false);
                    circleStyleObj.radius = circleStyle.getImage().getRadius();
                    circleStyleObj.fillColor = circleStyle.getImage().getFill().getColor();
                    circleStyleObj.strokeColor = circleStyle.getImage().getStroke().getColor();
                    circleStyleObj.strokeWidth = circleStyle.getImage().getStroke().getWidth();
                     expect(circleStyleObj).to.deep.equal(expectedValues);
                });
            });
            describe("TEXT SIMPLE", function () {
                it("should return simple style with text", function () {
                    var style = {
                        class: "POINT",
                        subClass : "SIMPLE",
                        imageName: "krankenhaus.png",
                        labelField: "name"
                    },
                    text;

                    model = new Model(style);
                    text = model.createStyle(features[0], false).getText().getText();
                    expect(text).to.be.equal("Evangelisches Krankenhaus Alsterdorf");
                });
            });
            describe("TEXT CLUSTERED", function () {
                it("should return style with cluster text", function () {
                    var style = {
                        class: "POINT",
                        subClass : "SIMPLE",
                        imageName: "krankenhaus.png",
                        labelField: "name"
                    },
                    text,
                    clusterFeature = new ol.Feature({features: [features[0], features[1]]});

                    model = new Model(style);
                    text = model.createStyle(clusterFeature, true).getText().getText();
                    expect(text).to.equal("2");
                });
                it("should return style with no text", function () {
                    var style = {
                        class: "POINT",
                        subClass : "SIMPLE",
                        imageName: "krankenhaus.png",
                        labelField: "name",
                        clusterText: "NONE"
                    },
                    text,
                    clusterFeature = new ol.Feature({features: [features[0], features[1]]});

                    model = new Model(style);
                    text = model.createStyle(clusterFeature, true).getText();
                    expect(text).to.be.undefined;
                });
                it("should return style with given text", function () {
                    var style = {
                        class: "POINT",
                        subClass : "SIMPLE",
                        imageName: "krankenhaus.png",
                        labelField: "name",
                        clusterText: "mehrere Features"
                    },
                    text,
                    clusterFeature = new ol.Feature({features: [features[0], features[1]]});

                    model = new Model(style);
                    text = model.createStyle(clusterFeature, true).getText().getText();
                    expect(text).to.be.equal("mehrere Features");
                });
            });
        });
    });
});
