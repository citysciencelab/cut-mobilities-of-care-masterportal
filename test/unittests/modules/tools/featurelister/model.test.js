import Model from "@modules/tools/featurelister/model.js";
import {expect} from "chai";

describe("featurelister/model", function () {
    let model;

    const exampleSchool = [{
            "adresse_ort": "21147 Hamburg",
            "schulform": "Grundschule",
            "schulname": "Beispielname",
            "schultyp": "Hauptstandort",
            "stadtteil": "Neugraben-Fischbek",
            "adresse_strasse_hausnr": "Schulstraße 123",
            "Testeintrag_1": "Sollte nicht im Ergebnis enthalten sein.",
            "Testeintrag_2": "Sollte auch nicht im Ergebnis enthalten sein, da nicht in exampleGfiList."
        }],
        exampleGfiList = {
            "schulname": "Name",
            "schulform": "Schulform",
            "schultyp": "Schulstandort",
            "schwerpunktschule": "Schwerpunktschule Inklusion",
            "adresse_strasse_hausnr": "Straße",
            "adresse_ort": "Ort",
            "stadtteil": "Stadtteil"
        },
        expectedResult = [{
            Name: "Beispielname",
            Schulform: "Grundschule",
            Schulstandort: "Hauptstandort",
            Straße: "Schulstraße 123",
            Ort: "21147 Hamburg",
            Stadtteil: "Neugraben-Fischbek"
        }],
        testString = "TestString_1234_!?",
        expectedTestString = "TestString 1234_!?";

    describe("translateGFI", function () {
        model = new Model();

        it("should return the correct entries with modified keys for the entered school", function () {
            expect(model.translateGFI(exampleSchool, exampleGfiList, undefined)).to.deep.equal(expectedResult);
        });
        it("should not be equal", function () {
            delete exampleGfiList.schultyp;
            expect(model.translateGFI(exampleSchool, exampleGfiList, undefined)).to.not.deep.equal(expectedResult);
        });
        it("should be equal", function () {
            delete exampleGfiList.schultyp;
            delete expectedResult[0].Schulstandort;
            expect(model.translateGFI(exampleSchool, exampleGfiList, undefined)).to.deep.equal(expectedResult);
        });
        it("should be an empty Array for empty GfiList", function () {
            expect(model.translateGFI(exampleSchool, {}, undefined)).to.deep.equal([]);
        });
        it("should be an empty Array for empty school", function () {
            expect(model.translateGFI([], exampleGfiList, undefined)).to.deep.equal([]);
        });
    });
    describe("beautifyString", function () {
        model = new Model();

        it("should be equal with the expected string", function () {
            expect(model.beautifyString(testString)).to.be.equal(expectedTestString);
        });
        it("should return an empty string", function () {
            expect(model.beautifyString("")).to.be.equal("");
        });
        it("should return an error for a number", function () {
            expect(() => model.beautifyString(1234)).to.throw(Error);
        });
        it("should return an error for undefined", function () {
            expect(() => model.beautifyString(undefined)).to.throw(Error);
        });
        it("should return an error for NaN", function () {
            expect(() => model.beautifyString(NaN)).to.throw(Error);
        });
        it("should return an error for null", function () {
            expect(() => model.beautifyString(null)).to.throw(Error);
        });
        it("should return an error for array", function () {
            expect(() => model.beautifyString([])).to.throw(Error);
        });
        it("should return an error for object", function () {
            expect(() => model.beautifyString({})).to.throw(Error);
        });
    });
    describe("isValidKey", function () {
        model = new Model();

        it("should return true for a valid key", function () {
            expect(model.isValidKey("TestKey")).to.be.true;
        });
        it("should return true for an empty key", function () {
            expect(model.isValidKey("")).to.be.true;
        });
        it("should return false for a key which is listed under the ignoredKeys in the config", function () {
            Config.ignoredKeys.push("TESTKEY");
            expect(model.isValidKey("TESTKEY")).to.be.false;
        });
        it("should return an error for a number", function () {
            expect(() => model.isValidKey(1234)).to.throw(Error);
        });
        it("should return an error for undefined", function () {
            expect(() => model.isValidKey(undefined)).to.throw(Error);
        });
        it("should return  an error for NaN", function () {
            expect(() => model.isValidKey(NaN)).to.throw(Error);
        });
        it("should return  an error for null", function () {
            expect(() => model.isValidKey(null)).to.throw(Error);
        });
        it("should return  an error for an array", function () {
            expect(() => model.isValidKey([])).to.throw(Error);
        });
        it("should return  an error for an object", function () {
            expect(() => model.isValidKey({})).to.throw(Error);
        });
    });
    describe("isValidValue", function () {
        model = new Model();

        it("should return true for a valid value", function () {
            expect(model.isValidValue("TestValue")).to.be.true;
        });
        it("should return false for an empty string", function () {
            expect(model.isValidValue("")).to.be.false;
        });
        it("should return false for undefined", function () {
            expect(model.isValidValue("NULL")).to.be.false;
        });
        it("should return false for a number", function () {
            expect(model.isValidValue(1234)).to.be.false;
        });
        it("should return false for undefined", function () {
            expect(model.isValidValue(undefined)).to.be.false;
        });
        it("should return false for undefined", function () {
            expect(model.isValidValue(null)).to.be.false;
        });
        it("should return false for undefined", function () {
            expect(model.isValidValue(NaN)).to.be.false;
        });
    });
});
