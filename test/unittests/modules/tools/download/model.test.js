import Model from "@modules/tools/download/model.js";
import {expect} from "chai";

describe("downloadModel", function () {
    var model;

    before(function () {
        model = new Model();
    });
    describe("validateFilename", function () {
        it("validation should succeed when filename valid", function () {
            expect(model.validateFilename("name.jpg")).to.be.true;
        });
        it("validation should fail when filename starts with \".\"", function () {
            expect(model.validateFilename(".name.jpg")).to.be.false;
        });
        it("validation should fail when filename ends with \".\"", function () {
            expect(model.validateFilename("name.")).to.be.false;
        });
        it("validation should fail when filename contains \"?\"", function () {
            expect(model.validateFilename("nam?e.jpg")).to.be.false;
        });
        it("validation should fail when filename isEmpty", function () {
            expect(model.validateFilename("")).to.be.false;
        });
        it("validation should fail when filename undefined", function () {
            expect(model.validateFilename()).to.be.false;
        });
        it("validation should fail when filename contains blank", function () {
            expect(model.validateFilename(" ")).to.be.false;
        });
    });
});
