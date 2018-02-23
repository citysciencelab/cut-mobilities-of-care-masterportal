define(function(require) {
    var expect = require("chai").expect,
        Model = require("../../../../../modules/core/modelList/list.js"),
        Util = require("../../../../../modules/core/util");

    describe("core/modelList/list", function () {
        var model,
            util,
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
            util = new Util();
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
    });
});
