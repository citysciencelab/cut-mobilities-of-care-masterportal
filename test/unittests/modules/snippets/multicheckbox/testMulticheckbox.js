import {expect} from "chai";
import Model from "@modules/snippets/multicheckbox/model.js";

describe("getIconPath", function () {
    var icons = [
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-oeffentlicher-raum.png",
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-sport.png",
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-gewerbe.png",
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-soziales.png",
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-verkehr.png",
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-soziales.png",
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-soziales.png",
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wirtschaft.png",
            "http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png"],
        valueArray = [
            "Freiraum und Grün",
            "Freizeit",
            "Gewerbe",
            "Kultur",
            "Mobilität und Infrastruktur",
            "Sonstiges",
            "Soziales",
            "Wirtschaft",
            "Wohnen"],
        model;

    before(function () {
        model = new Model();
    });

    describe("getIconPath", function () {
        it("Freiraum und Grün with icon 40px-oeffentlicher-raum.png", function () {
            expect(model.getIconPath(icons, valueArray, "Freiraum und Grün")).to.deep.equal("http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-oeffentlicher-raum.png");
        });
        it("Freizeit with icon 40px-sport.png", function () {
            expect(model.getIconPath(icons, valueArray, "Freizeit")).to.deep.equal("http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-sport.png");
        });
        it("Wirtschaft with icon 40px-wirtschaft.png", function () {
            expect(model.getIconPath(icons, valueArray, "Wirtschaft")).to.deep.equal("http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wirtschaft.png");
        });
        it("Wohnen with icon 40px-wohnen.png", function () {
            expect(model.getIconPath(icons, valueArray, "Wohnen")).to.deep.equal("http://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png");
        });
        it("Undefined value returns undefined", function () {
            expect(model.getIconPath(icons, valueArray, undefined)).to.deep.equal(undefined);
        });
        it("Value is random string is undefined", function () {
            expect(model.getIconPath(icons, valueArray, "*42+")).to.deep.equal(undefined);
        });
    });
});
