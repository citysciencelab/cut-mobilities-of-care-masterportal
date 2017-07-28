
define(function(require) {

    var assert = require("chai").assert,
        expect = require("chai").expect,
        Model = require("../../modules/tools/download/model.js");

    describe("downloadModel", function () {
        describe("validateFilename", function () {
            it("validation should ... when filename ...", function () {
                expect(Model.validateFilename("...")).to.be.a('...');
            });
            it("validation should ... when filename ...", function () {
                assert.isTrue(Model.validateFilename("..."), "validation should ... when filename ...");
            });

        });
    });
});
