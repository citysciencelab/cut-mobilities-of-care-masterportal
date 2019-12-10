import Model from "@modules/tools/download/model.js";
import {expect} from "chai";

describe("downloadModel", function () {
    var model;

    before(function () {
        model = new Model();
    });
    describe("validateFileNameAndExtension", function () {
        it("should return undefined for unset fileName and unset selectedFormat", function () {
            expect(model.validateFileNameAndExtension()).to.be.undefined;
        });
        it("should return filename with format", function () {
            model.setFileName("Foo");
            model.setSelectedFormat("bar");
            expect(model.validateFileNameAndExtension()).to.equal("Foo.bar");
        });
        it("should return filename with format on user input with fileextension", function () {
            model.setFileName("Foo.bar");
            model.setSelectedFormat("bar");
            expect(model.validateFileNameAndExtension()).to.equal("Foo.bar");
        });
        it("should return undefined for empty filename", function () {
            model.setFileName("");
            model.setSelectedFormat("bar");
            expect(model.validateFileNameAndExtension()).to.be.undefined;
        });
        it("should return undefined for empty format", function () {
            model.setFileName("foo");
            model.setSelectedFormat("");
            expect(model.validateFileNameAndExtension()).to.be.undefined;
        });
    });
});
