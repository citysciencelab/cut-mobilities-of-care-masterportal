import {expect} from "chai";
import Model from "@modules/snippets/slider/model.js";
import Util from "@modules/core/util.js";

describe("snippets/slider/model", function () {
    var model;

    new Util();

    beforeEach(function () {
        model = new Model({
            values: ["123", "542", "2", "6534", "98"],
            type: "integer"
        });
    });
    describe("parseValues", function () {
        it("should return an array of numbers", function () {
            var parsedValues = model.parseValues(model.get("values")),
                allValues = _.every(parsedValues, function (value) {
                    return _.isNumber(value);
                });

            expect(allValues).to.be.true;
        });
    });

    describe("parseValueToNumber", function () {
        it("should return NaN for undefined input", function () {
            expect(model.parseValueToNumber(undefined, undefined)).to.be.NaN;
        });
        it("should return NaN for false input", function () {
            expect(model.parseValueToNumber("abc", "integer")).to.be.NaN;
        });
        it("should return float for float input", function () {
            expect(model.parseValueToNumber("10.02", "decimal")).to.equal(10.02);
        });
        it("should return integer for integer input", function () {
            expect(model.parseValueToNumber("10", "integer")).to.equal(10);
        });
    });

    describe("checkInvalidInput", function () {
        it("should return NaN for NaN input", function () {
            expect(model.checkInvalidInput(NaN, NaN)).to.be.NaN;
        });
        it("should return 100 for value is NaN and otherValue is 100", function () {
            expect(model.checkInvalidInput(NaN, 100)).to.equal(100);
        });
        it("should return 10 for correct input", function () {
            expect(model.checkInvalidInput(10, 999)).to.equal(10);
        });
    });

    describe("changeValuesByText", function () {
        it("should return sorted values for correct input", function () {
            expect(model.changeValuesByText(1000, 500)).to.be.an("array").includes(500, 1000);
        });
        it("should return min from initValue und max from param for min as empty String and max as number input", function () {
            model.get("valuesCollection").at(0).set("initValue", 100);
            model.get("valuesCollection").at(1).set("initValue", 2000);

            expect(model.changeValuesByText("", 500)).to.be.an("array").includes(100, 500);
        });
        it("should return min from param und max from initValue for min as number and max as empty String input", function () {
            model.get("valuesCollection").at(0).set("initValue", 100);
            model.get("valuesCollection").at(1).set("initValue", 2000);

            expect(model.changeValuesByText(500, "")).to.be.an("array").includes(500, 2000);
        });
        it("should return min and max from initValue for min and max as empty String input", function () {
            model.get("valuesCollection").at(0).set("initValue", 100);
            model.get("valuesCollection").at(1).set("initValue", 2000);
            model.get("valuesCollection").at(0).setValue(100);
            model.get("valuesCollection").at(1).setValue(2000);

            expect(model.changeValuesByText("", "")).to.be.an("array").includes(100, 2000);
        });
        it("should return min and max from initValue for undefined input", function () {
            model.get("valuesCollection").at(0).set("initValue", 100);
            model.get("valuesCollection").at(1).set("initValue", 2000);
            model.get("valuesCollection").at(0).setValue(100);
            model.get("valuesCollection").at(1).setValue(2000);

            expect(model.changeValuesByText(undefined, undefined)).to.be.an("array").includes(100, 2000);
        });
    });
});
