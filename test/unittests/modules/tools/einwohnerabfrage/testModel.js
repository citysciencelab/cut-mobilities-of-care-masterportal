define(function (require) {
    var expect = require("chai").expect,
        testUtil = require("util"),
        Util = require("../../../../../modules/core/util.js"),
        Model = require("../../../../../modules/tools/einwohnerabfrage_hh/model.js");

    describe("tools/einwohnerabfrageModel", function () {
        var model,
            testUtilModel,
            cswResponseXml;

        before(function () {
            model = new Model();
            testUtilModel = new testUtil();
            new Util();
            cswResponseXml = testUtilModel.getCswResponse();
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
                model.showOverlayOnSketch(50, []);
                expect(model.get("circleOverlay").getElement().innerHTML).to.equal("50 m");
            });
            it("should update overlay position on geometry changes", function () {
                var outerCoord = [556440.777563342, 5935149.148611423];

                model.showOverlayOnSketch(50, outerCoord);
                expect(outerCoord).to.deep.equal(model.get("circleOverlay").getPosition());
            });
        });

        describe("createDrawInteraction", function () {
            it("should have a draw interaction", function () {
                model.createDrawInteraction("Box");
                expect(model.get("drawInteraction")).not.to.be.undefined;
            });
        });

        describe("isOwnMetaRequest", function () {
            it("should return true if uniqueId is in uniqueIdList", function () {
                expect(model.isOwnMetaRequest(["1234", "5678"], "1234")).to.be.true;
            });
            it("should return false if uniqueId is NOT in uniqueIdList", function () {
                expect(model.isOwnMetaRequest(["1234", "5678"], "91011")).to.be.false;
            });
            it("should return false if uniqueId is undefined", function () {
                expect(model.isOwnMetaRequest(["1234", "5678"], undefined)).to.be.false;
            });
            it("should return false if uniqueIdList is undefined", function () {
                expect(model.isOwnMetaRequest(undefined, "91011")).to.be.false;
            });
            it("should return false if uniqueIdList and uniqueId is undefined", function () {
                expect(model.isOwnMetaRequest(undefined, undefined)).to.be.false;
            });
        });
        describe("removeUniqueIdFromList", function () {
            it("should remove uniqueId from uniqueIdList if uniqueId in uniqueIdList", function () {
                model.removeUniqueIdFromList(["1234", "5678"], "1234");
                expect(model.get("uniqueIdList")).to.deep.equal(["5678"]);
            });
            it("should leave uniqueIdList if uniqueId not in uniqueIdList", function () {
                model.removeUniqueIdFromList(["1234", "5678"], "123456789");
                expect(model.get("uniqueIdList")).to.deep.equal(["1234", "5678"]);
            });
            it("should leave uniqueIdList if uniqueId is undefined", function () {
                model.removeUniqueIdFromList(["1234", "5678"], undefined);
                expect(model.get("uniqueIdList")).to.deep.equal(["1234", "5678"]);
            });
            it("should leave uniqueIdList if uniqueIdList is undefined", function () {
                model.removeUniqueIdFromList(undefined, "5678");
                expect(model.get("uniqueIdList")).to.be.an("array").that.is.empty;
            });
            it("should leave uniqueIdList if uniqueIdList and uniqueId is undefined", function () {
                model.removeUniqueIdFromList(undefined, undefined);
                expect(model.get("uniqueIdList")).to.be.an("array").that.is.empty;
            });
        });

        describe("getFormattedDecimalString", function () {
            it("should return empty String for number without decimals", function () {
                expect(model.getFormattedDecimalString(1234567, 5)).to.equal("");
            });
            it("should return correct decimals with devider when maxlength < numder of decimals", function () {
                expect(model.getFormattedDecimalString(1234.567, 1)).to.equal(",5");
            });
            it("should return correct decimals with devider when maxlength > numder of decimals", function () {
                expect(model.getFormattedDecimalString(123456.7, 5)).to.equal(",7");
            });
            it("should return correct decimals without devider when maxlength === 0", function () {
                expect(model.getFormattedDecimalString(123456.7, 0)).to.equal("");
            });
        });
        describe("chooseUnitAndPunctuate", function () {
            it("should return correct unit for value < 250000", function () {
                expect(model.chooseUnitAndPunctuate(567, 0)).to.have.string("m²");
            });
            it("should return correct unit for value > 250000 and value < 10000000", function () {
                expect(model.chooseUnitAndPunctuate(250000.1, 1)).to.have.string("ha");
            });
            it("should return correct unit for value >  250000", function () {
                expect(model.chooseUnitAndPunctuate(99999999, 0)).to.have.string("km²");
            });
            it("should return correctly formatted number with unit", function () {
                expect(model.chooseUnitAndPunctuate(1234567.123, 3)).to.equal("123,456 ha");
            });
            it("should return correctly formatted number with unit when number > 250000 and value < 10000000 maxlength === 0", function () {
                expect(model.chooseUnitAndPunctuate(1234567.123, 0)).to.equal("123 ha");
            });
            it("should return correctly formatted number with unit when value < 250000 && maxlength === 0", function () {
                expect(model.chooseUnitAndPunctuate(14567.123, 0)).to.equal("14.567 m²");
            });
            it("should return correctly formatted number with unit when value > 10000000 &&  maxlength === 1", function () {
                expect(model.chooseUnitAndPunctuate(99999999.999, 1)).to.equal("99,9 km²");
            });
        });
    });
});
