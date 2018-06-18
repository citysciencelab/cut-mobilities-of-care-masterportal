define(function(require) {
    var expect = require("chai").expect,
        Util = require("util"),
        Model = require("../../../../../modules/tools/einwohnerabfrage_hh/model.js");

    describe("tools/einwohnerabfrageModel", function () {
        var model,
            utilModel,
            cswResponseXml;

        before(function () {
            model = new Model();
            utilModel = new Util();
            cswResponseXml = utilModel.getCswResponse();
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
                var outerCoord = [556440.777563342, 5935149.148611423]
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

        describe("parseDate", function () {
            it("should return '31.12.2013'", function () {
                expect(model.parseDate(cswResponseXml)).to.equal("31.12.2013");
            });
        });
        describe("punctuate", function () {
            it("should not set two points for 7 digit number with decimals", function () {
                expect(model.punctuate(1234567.890)).to.equal("1.234.567");
            });
            it("should not set two  points for 7 digit number", function () {
                expect(model.punctuate(3456789)).to.equal("3.456.789");
            });
            it("should set  point for 4 digit number", function () {
                expect(model.punctuate(1000)).to.equal("1.000");
            });
            it("should not set  point for 3 digit number", function () {
                expect(model.punctuate(785)).to.equal("785");
            });
            it("should not set  point for 2 digit number", function () {
                expect(model.punctuate(85)).to.equal("85");
            });
            it("should not set  point for 1 digit number", function () {
                expect(model.punctuate(1)).to.equal("1");
            });
            it("should work with 1 digit number with decimals", function () {
                expect(model.punctuate(5.22)).to.equal("5");
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
