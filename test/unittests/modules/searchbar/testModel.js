define(function (require) {
    var expect = require("chai").expect,
        Radio = require("backbone.radio"),
        Model = require("../../../../modules/searchbar/model.js");

    describe("modules/searchbar", function () {
        var model = {};

        before(function () {
            model = new Model();
        });
        describe("changeFileExtension", function () {
            it("should correctly change extension to extension with shorter length ", function () {
                expect(model.changeFileExtension("test.svg", ".js")).to.be.an("string").that.equals("test.js");
            });
            it("should  correctly change extension to extension with longer length ", function () {
                expect(model.changeFileExtension("test.js", ".svg")).to.be.an("string").that.equals("test.svg");
            });
            it("should return undefined if source is undefined", function () {
                expect(model.changeFileExtension("test.js", ".svg")).to.be.an("string").that.equals("test.svg");
            });
        });
        describe("shortenNames", function () {
            it("should return name if name is shorter then length", function () {
                expect(model.shortenString("test", 5)).to.be.an("string").that.equals("test");
            });
            it("should return name if name length is euqal to length", function () {
                expect(model.shortenString("test", 4)).to.be.an("string").that.equals("test");
            });
            it("should return name croped to length extended with '...' if name is longer then length", function () {
                expect(model.shortenString("test", 3)).to.be.an("string").that.equals("tes..");
            });
            it("should return undefined if name is undefined", function () {
                expect(model.shortenString(undefined, 1)).to.be.undefined;
            });
        });
    });
});
