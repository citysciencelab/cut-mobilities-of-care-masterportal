define(function (require) {
    var expect = require("chai").expect,
        Model = require("../../../../../modules/core/modelList/list.js");

    describe("core/modelList/list", function () {
        var model,
            testLightModels = [
                {
                    id: "713",
                    transparency: 0,
                    isSelected: false
                },
                {
                    id: "714",
                    transparency: 0,
                    isSelected: false
                },
                {
                    id: "715",
                    transparency: 0,
                    isSelected: false
                }
            ],
            testParamLayers = [
                {
                    id: "713",
                    transparency: 50,
                    visibility: true
                }
            ],
            testParamLayersFailure = [
                {
                    id: "718",
                    transparency: 10,
                    visibility: true
                }
            ];

        before(function () {
            model = new Model();
        });

        describe("mergeParamsToLightModels (Für dev müssen die Test angepasst werden!!)", function () {
            it("should return lightModels array reversed", function () {
                expect(model.mergeParamsToLightModels(testLightModels, undefined)[2]).to.include({
                    id: "713",
                    transparency: 0,
                    isSelected: false
                });
            });

            it("should return unchanged lightModels array", function () {
                expect(model.mergeParamsToLightModels(testLightModels, testParamLayersFailure)).to.be.an("array").to.deep.include({
                    id: "713",
                    transparency: 0,
                    isSelected: false
                },
                {
                    id: "714",
                    transparency: 0,
                    isSelected: false
                },
                {
                    id: "715",
                    transparency: 0,
                    isSelected: false
                });
            });

            it("should return reversed lightModels array with id: 713 transparency: 50 and isSelected: true", function () {
                expect(model.mergeParamsToLightModels(testLightModels, testParamLayers)[2]).to.include({
                    id: "713",
                    transparency: 50,
                    isSelected: true
                });
            });
        });
        describe("sortLayers", function () {
            var gModel = new Backbone.Model({
                    "id": "1001",
                    "name": "gLayer"
                }),
                xModel = new Backbone.Model({
                    "id": "1002",
                    "name": "xLayer"
                }),
                aModel = new Backbone.Model({
                    "id": "1003",
                    "name": "aLayer"
                });

            it("should return an sorted array by key", function () {
                var layer = [
                        gModel,
                        xModel,
                        aModel
                    ],
                    key = "name";

                expect(model.sortLayers(layer, key)).to.be.an("array")
                    .to.nested.include(aModel)
                    .and.to.nested.include(gModel)
                    .and.to.nested.include(xModel);
            });

            it("should return an the input array by key is undefined", function () {
                var layer = [
                        gModel,
                        xModel,
                        aModel
                    ],
                    key;

                expect(model.sortLayers(layer, key)).to.be.an("array")
                    .to.nested.include(gModel)
                    .and.to.nested.include(xModel)
                    .and.to.nested.include(aModel);
            });

            it("should return an empty array by empty input", function () {
                var layer = [],
                    key = "";

                expect(model.sortLayers(layer, key)).to.be.an("array").that.is.empty;
            });
        });
    });
});
