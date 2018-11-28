import {expect} from "chai";
import Model from "@modules/snippets/multicheckbox/model.js";

describe("Multicheckbox Model", function () {
    var icons = [
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-oeffentlicher-raum.png",
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-sport.png"],
        valueArray = [
            "Freiraum und Grün",
            "Freizeit"],
        model;

    before(function () {
        model = new Model();
    });

    describe("getIconPath", function () {
        it("should return right Icon Path", function () {
            expect(model.getIconPath(icons, valueArray, "Freiraum und Grün")).to.deep.equal("http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-oeffentlicher-raum.png");
            expect(model.getIconPath(icons, valueArray, "Freizeit")).to.deep.equal("http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-sport.png");
        });

        it("should return undefined for undefined value", function () {
            expect(model.getIconPath(icons, valueArray, undefined)).to.deep.equal(undefined);
        });
        it("should return undefined for not found value", function () {
            expect(model.getIconPath(icons, valueArray, "*42+")).to.deep.equal(undefined);
        });
    });
});
