define(function(require) {
    var expect = require("chai").expect,
        Util = require("util"),
        Model = require("../../../../../modules/tools/einwohnerabfrage/model.js");

    describe("tools/einwohnerabfrageModel", function () {
        var model,
            utilModel,
            testFeature;

        before(function () {
            model = new Model();
            utilModel = new Util();
            testFeature = utilModel.createTestFeatures()[0];
        });

        describe("roundRadius", function () {
            it("should return 405.4 m for input 405.355", function () {
                expect(model.roundRadius(405.355)).to.equal("405.4 m");
            });
            it("should return 405.4 m for input 1305.355", function () {
                expect(model.roundRadius(1305.355)).to.equal("1.31 km");
            });
            it("should return 405.4 m for input 500.355", function () {
                expect(model.roundRadius(500.355)).to.equal("0.5 km");
            });
        });

        describe("toggleOverlay", function () {
            it("overlay should be attached to the map", function () {
                model.toggleOverlay("Box", model.get("circleOverlay"));
                expect(model.get("circleOverlay").getMap()).to.be.undefined;
            });
            it("overlay should not be attached to the map", function () {
                model.toggleOverlay("Circle", model.get("circleOverlay"));
                expect(model.get("circleOverlay").getMap()).to.not.be.undefined;
            });
        });

        describe("showOverlayOnSketch", function () {
            it("should update overlay innerHTML on geometry changes", function () {
                var geometry = new ol.geom.Circle([556440.777563342, 5935149.148611423]);

                model.showOverlayOnSketch(geometry, model.get("circleOverlay"));
                geometry.setRadius(50);
                expect(model.get("circleOverlay").getElement().innerHTML).to.equal("50 m");
            });
            it("should update overlay position on geometry changes", function () {
                var geometry = new ol.geom.Circle([556440.777563342, 5935149.148611423]);

                model.showOverlayOnSketch(geometry, model.get("circleOverlay"));
                geometry.setRadius(50);
                expect(geometry.getLastCoordinate()).to.deep.equal(model.get("circleOverlay").getPosition());
            });
        });

        describe("createDrawInteraction", function () {
            it("should have a draw interaction", function () {
                model.createDrawInteraction("Box");
                expect(model.get("drawInteraction")).not.to.be.undefined;
            });
        });
    });
});
