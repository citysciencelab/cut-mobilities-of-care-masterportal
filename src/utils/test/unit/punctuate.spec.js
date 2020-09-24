import {expect} from "chai";
import punctuate from "../../punctuate";

describe("punctuate", function () {
    let model;

    /**
     * Used to test instance independent incrementing
     */
    class TestModel {
        /**
         * converts value to String and rewrites punctuation rules. The 1000 separator is "." and the decimal separator is a ","
         * @param {String} [value=""] value to be punctuated
         * @returns {string} punctuated value
         */
        punctuate (value) {
            return punctuate(value);
        }
    }

    before(function () {
        model = new TestModel();
    });

    it("should set two points for 7 digit number with decimals", function () {
        expect(model.punctuate(1234567.890)).to.equal("1.234.567,89");
    });
    it("should set two  points for 7 digit number", function () {
        expect(model.punctuate(3456789)).to.equal("3.456.789");
    });
    it("should set point for 4 digit number", function () {
        expect(model.punctuate(1000)).to.equal("1.000");
    });
    it("should not set point for 3 digit number", function () {
        expect(model.punctuate(785)).to.equal("785");
    });
    it("should not set point for 2 digit number", function () {
        expect(model.punctuate(85)).to.equal("85");
    });
    it("should not set point for 1 digit number", function () {
        expect(model.punctuate(1)).to.equal("1");
    });
    it("should work with 1 digit number with decimals", function () {
        expect(model.punctuate(5.22)).to.equal("5,22");
    });
});
