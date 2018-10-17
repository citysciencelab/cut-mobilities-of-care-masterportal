import {expect} from "chai";
import Model from "@modules/tools/filter/model.js";

describe("modules/tools/filter/model", function () {
    var model;

    before(function () {
        model = new Model();
    });
    describe("collectFilteredIds", function () {
        it("should return empty array for undefined input", function () {
            expect(model.collectFilteredIds(undefined))
                .to.be.an("array")
                .to.be.empty;
        });
    });
});
