import Model from "@modules/tools/gfi/themes/model.js";
import {expect} from "chai";

var model;

before(function () {
    model = new Model();
});

describe("tools/gfi/themes/Model", function () {
    describe("allKeysToLowerCase", function () {
        it("should return an empty object for undefined input", function () {
            expect(model.allKeysToLowerCase(undefined)).to.be.an("object").that.is.empty;
        });
        it("should return an object with keys that be lowercase for object input", function () {
            var obj = {
                Test1: "value1",
                Test2: "value2"
            };

            expect(model.allKeysToLowerCase(obj)).to.be.an("object").that.includes({
                test1: "value1",
                test2: "value2"
            });
        });
    });

    describe("translateGFI", function () {
        it("should return an empty array for undefined input", function () {
            expect(model.translateGFI(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an correct array for gfiList and gfiAttributes input", function () {
            var gfiList = [
                    {
                        strasse: "Teststraße",
                        ort: "Testort"
                    }
                ],
                gfiAttributes = {
                    strasse: "StrassenName",
                    ort: "Ortname"
                };

            expect(model.translateGFI(gfiList, gfiAttributes)).to.be.an("array").to.deep.include({
                Ortname: "Testort",
                StrassenName: "Teststraße"
            });
        });
    });
    describe("translateNameFromObject", function () {
        it("should return 'val2' for origName= 'another_' and condition= 'startsWith'", function () {
            const preGfi = {
                key1: "val1",
                another_key: "val2"
            };

            expect(model.translateNameFromObject(preGfi, "another_", "startsWith")).to.equal("val2");
        });
        it("should return 'val2' for origName= 'key' and condition= 'endsWith'", function () {
            const preGfi = {
                key1: "val1",
                another_key: "val2"
            };

            expect(model.translateNameFromObject(preGfi, "key", "endsWith")).to.equal("val2");
        });
        it("should return 'val2' for origName= 'other_k' and condition= 'contains'", function () {
            const preGfi = {
                key1: "val1",
                another_key: "val2"
            };

            expect(model.translateNameFromObject(preGfi, "other_k", "contains")).to.equal("val2");
        });
        it("should return undefined for invalid condition", function () {
            const preGfi = {
                key1: "val1",
                another_key: "val2"
            };

            expect(model.translateNameFromObject(preGfi, "other_k", "fooBar")).to.be.undefined;
        });
        it("should return undefined for undefined condition", function () {
            const preGfi = {
                key1: "val1",
                another_key: "val2"
            };

            expect(model.translateNameFromObject(preGfi, "other_k", undefined)).to.be.undefined;
        });
        it("should return undefined for empty preGfi", function () {
            expect(model.translateNameFromObject({}, "other_k", "contains")).to.be.undefined;
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
