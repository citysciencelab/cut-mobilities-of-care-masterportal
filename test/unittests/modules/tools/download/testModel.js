define(function (require) {
    var assert = require("chai").assert,
        Model = require("../../../../../modules/tools/download/model.js");

    describe("downloadModel", function () {
        describe("validateFilename", function () {
            it("validation should succeed when filename valid", function () {
                assert.isTrue(Model.validateFilename("name.jpg"), "validation should succeed when filename valid");
            });
            it("validation should fail when filename starts with \".\"", function () {
                assert.isFalse(Model.validateFilename(".name.jpg"), "filenames beginning with '.' should not be valid'");
            });
            it("validation should fail when filename ends with \".\"", function () {
                assert.isFalse(Model.validateFilename("name."), "filenames ending with '.' should not be valid'");
            });
            it("validation should fail when filename contains \"?\"", function () {
                assert.isFalse(Model.validateFilename("nam?e.jpg"), "filenames containing '?' should not be valid'");
            });
            it("validation should fail when filename isEmpty", function () {
                assert.isFalse(Model.validateFilename(""), "empty filenames should not be valid'");
            });
            it("validation should fail when filename undefined", function () {
                assert.isFalse(Model.validateFilename(), "undefined filenames should not be valid'");
            });
            it("validation should fail when filename contains blank", function () {
                assert.isFalse(Model.validateFilename(" "), "filenames containing with ' ' should not be valid'");
            });
        });
    });
});
