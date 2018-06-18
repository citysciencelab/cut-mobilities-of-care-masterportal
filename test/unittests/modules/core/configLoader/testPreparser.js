define(function (require) {
    var expect = require("chai").expect,
        Preparser = require("../../../../modules/core/configLoader/preparser");

    describe("core/configLoader/preparser", function () {
        var preparser;

        before(function () {
            preparser = new Preparser();
        });

        describe("global isFolderSelectable", function () {
            it("should be true if set to true in config", function () {
                expect(preparser.parseIsFolderSelectable(true)).to.be.true;
            });
            it("should be false if set to false in config", function () {
                expect(preparser.parseIsFolderSelectable(false)).to.be.false;
            });
            it("should be true if not set in config (default value)", function () {
                expect(preparser.parseIsFolderSelectable(undefined)).to.be.true;
            });
        });
    });
});
