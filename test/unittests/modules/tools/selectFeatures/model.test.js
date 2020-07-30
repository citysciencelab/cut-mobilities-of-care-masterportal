import SelectFeaturesModel from "@modules/tools/selectFeatures/model.js";
import {expect} from "chai";

const {
    translateGFI,
    beautifyKey,
    beautifyValue,
    isValidKey,
    isValidValue
} = SelectFeaturesModel.prototype;

describe("tools/selectFeatures/model", function () {
    describe("translateGFI", function () {
        const properties = {
                "warp_speed": "10",
                "beverages": "Black Coffee |earl grey, hot "
            },
            gfiAttributes = {
                "warp_speed": "Warpgeschwindigkeit",
                "beverages": " getränke "
            };

        it("uses gfiAttributes key name lookup as-is", function () {
            expect(translateGFI.call(SelectFeaturesModel.prototype, properties, gfiAttributes))
                .to.eql([
                    ["Warpgeschwindigkeit", "10"],
                    [" getränke ", "Black Coffee<br/>earl grey, hot"]
                ]);
        });

        it("returns beautified key/value pair array if gfiAttributes is 'showAll'", function () {
            expect(translateGFI.call(SelectFeaturesModel.prototype, properties, "showAll"))
                .to.eql([
                    ["Warp Speed", "10"],
                    ["Beverages", "Black Coffee<br/>earl grey, hot"]
                ]);
        });

        it("returns empty array if gfiAttributes is 'ignore'", function () {
            expect(translateGFI(properties, "ignore"))
                .to.eql([]);
        });
    });

    describe("beautifyKey", function () {
        it("changes '_' to ' ' and uppercases each word", function () {
            expect(beautifyKey("raumschiff_enterprise"))
                .to.equal("Raumschiff Enterprise");
        });
    });

    describe("beautifyValue", function () {
        it("trims the values", function () {
            expect(beautifyValue(" asdf ")).to.equal("asdf");
        });

        it("interprets | as newline; keeps trimming", function () {
            expect(beautifyValue(" asdf | fdsa "))
                .to.equal("asdf<br/>fdsa");
        });
    });

    describe("isValidKey", function () {
        it("returns true if key not in ignore list", function () {
            expect(isValidKey("VALID")).to.be.true;
        });

        it("returns false if key in ignore list", function () {
            expect(isValidKey("shape")).to.be.false;
            expect(isValidKey("sHaPe")).to.be.false;
            expect(isValidKey("SHAPE")).to.be.false;
        });
    });

    describe("isValidValue", function () {
        it("returns true on non-empty string", function () {
            expect(isValidValue("Jean-Luc Picard")).to.be.true;
        });

        it("returns false on empty string", function () {
            expect(isValidValue("")).to.be.false;
        });

        it("returns false on 'null' string", function () {
            expect(isValidValue("null")).to.be.false;
            expect(isValidValue("nUlL")).to.be.false;
            expect(isValidValue("NULL")).to.be.false;
        });
    });
});
