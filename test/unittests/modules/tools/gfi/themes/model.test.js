import {expect} from "chai";
import Model from "@modules/tools/gfi/themes/model.js";

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
});
