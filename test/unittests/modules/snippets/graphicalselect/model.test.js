import {expect} from "chai";
import Model from "@modules/snippets/graphicalselect/model.js";

describe("snippets/graphicalselect/model", function () {
    var model;

    before(function () {
        model = new Model({
            id: "test_graphicalselection"
        });
    });

    describe("updateValues", function () {
        var updatedValue;

        it("should update values", function () {
            model.setStatus(true);
            expect(model.get("drawInteraction").isActive === true);
            model.setStatus(false);
            expect(model.get("drawInteraction").isActive === false);
        });
    });
});
