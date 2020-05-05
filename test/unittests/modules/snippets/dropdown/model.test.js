import {expect} from "chai";
import Model from "@modules/snippets/dropdown/model.js";

describe("snippets/dropdown/model", function () {
    let model;

    before(function () {
        model = new Model({
            values: ["m²", "km²"]
        });
    });

    describe("updateValues", function () {
        let updatedValue;

        it("should update values", function () {
            model.updateValues(["m²", "km²"]);
            updatedValue = model.get("valuesCollection").models[0].get("value");
            expect(updatedValue).to.equal("m²");
            updatedValue = model.get("valuesCollection").models[0].get("displayName");
            expect(updatedValue).to.equal("m²");
        });
    });
});
