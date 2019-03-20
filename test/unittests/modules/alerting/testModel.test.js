import {expect} from "chai";
import Model from "@modules/alerting/model.js";

describe("alerting/model", function () {
    var model,
        val = {
            id: 1000,
            text: "Test",
            kategorie: "alert-warning",
            dismissable: false
        };

    before(function () {
        model = new Model();
    });

    describe("setParams", function () {
        it("should set Params as expected", function () {
            model.setParams(val);
            expect(model.get("id")).to.be.an("string").that.equals("1000");
            expect(model.get("message")).to.be.an("string").that.equals("Test");
            expect(model.get("category")).to.be.an("string").that.equals("alert-warning");
            expect(model.get("isDismissable")).to.be.an("boolean").that.equals(false);
        });
    });
});
