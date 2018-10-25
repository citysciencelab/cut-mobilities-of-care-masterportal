import {assert} from "chai";
import Model from "@modules/tools/download/model.js";

describe("downloadModel", function () {
    var model;

    before(function () {
        model = new Model();
    });
    describe("validateFilename", function () {
        it("validation should succeed when filename valid", function () {
            assert.isTrue(model.validateFilename("name.jpg"), "validation should succeed when filename valid");
        });
        it("validation should fail when filename starts with \".\"", function () {
            assert.isFalse(model.validateFilename(".name.jpg"), "filenames beginning with '.' should not be valid'");
        });
        it("validation should fail when filename ends with \".\"", function () {
            assert.isFalse(model.validateFilename("name."), "filenames ending with '.' should not be valid'");
        });
        it("validation should fail when filename contains \"?\"", function () {
            assert.isFalse(model.validateFilename("nam?e.jpg"), "filenames containing '?' should not be valid'");
        });
        it("validation should fail when filename isEmpty", function () {
            assert.isFalse(model.validateFilename(""), "empty filenames should not be valid'");
        });
        it("validation should fail when filename undefined", function () {
            assert.isFalse(model.validateFilename(), "undefined filenames should not be valid'");
        });
        it("validation should fail when filename contains blank", function () {
            assert.isFalse(model.validateFilename(" "), "filenames containing with ' ' should not be valid'");
        });
    });
});
