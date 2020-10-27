import Model from "@modules/tools/addWMS/model.js";
import {expect} from "chai";

describe("addWMS/model", function () {
    let model;

    before(function () {
        model = new Model();
    });

    describe("getParsedTitle", function () {
        it("should return parsed title without space and be replaced with minus", function () {
            expect(model.getParsedTitle("test title")).to.equal("test-title");
        });
        it("should return parsed title without slash and be replaced with minus", function () {
            expect(model.getParsedTitle("test/title")).to.equal("test-title");
        });
        it("should return parsed title as original title", function () {
            expect(model.getParsedTitle(undefined)).to.equal("undefined");
            expect(model.getParsedTitle("test")).to.equal("test");
            expect(model.getParsedTitle(1234)).to.equal("1234");
        });
    });
});
