import {expect} from "chai";
import Model from "@modules/tools/gfi/themes/schulinfo/model.js";
import Util from "@testUtil";

describe("tools/gfi/themes/schulinfo", function () {
    var model,
        utilModel,
        testFeatures,
        gfiContent = {
            Name: "Katharinenschule in der HafenCity",
            Schulform: "Vorschulklasse|Grundschule",
            Bezirk: "Hamburg-Mitte"
        },
        featureInfos;

    before(function () {
        utilModel = new Util();
        testFeatures = utilModel.createTestFeatures("resources/testFeatures.xml");
        model = new Model({feature: testFeatures[0]});
    });
    beforeEach(function () {
        featureInfos = [{
            name: "Grundätzliche Informationen",
            attributes: [],
            isSelected: true
        },
        {
            name: "Schulgröße",
            attributes: [],
            isSelected: false
        }];
    });
    describe("createFeatureInfos", function () {
        it("should return empty array when themeConfig undefined", function () {
            expect(model.createFeatureInfos(gfiContent, undefined)).to.be.an("array").that.is.empty;
        });
    });
    describe("checkForAttribute", function () {
        it("should find attribute \"Name\" in gfiContent", function () {
            expect(model.checkForAttribute(gfiContent, "Name")).to.be.true;
        });
        it("should not find attribute \"Schulleiter\" in gfiContent", function () {
            expect(model.checkForAttribute(gfiContent, "Schulleiter")).to.be.false;
        });
    });
    describe("setIsSelected", function () {
        it("sets object.isSelected true, when object.name matches \"Schulgröße\"", function () {
            expect(model.setIsSelected("Schulgröße", featureInfos)).to.be.an("array").to.deep.include({
                name: "Schulgröße",
                attributes: [],
                isSelected: true
            });
        });
        it("return unchanged featureInfos, when no object.name matches \"Ganztag\"", function () {
            expect(model.setIsSelected("Ganztag", featureInfos)).to.be.an("array").to.deep.include({
                name: "Grundätzliche Informationen",
                attributes: [],
                isSelected: true
            });
        });
    });
    describe("isNewNameInFeatureInfos", function () {
        it("finds \"Schulgröße\" in featureInfos", function () {
            expect(model.isNewNameInFeatureInfos("Schulgröße", featureInfos)).to.be.true;
        });
        it("does not find \"Ganztag\" in featureInfos", function () {
            expect(model.isNewNameInFeatureInfos("Ganztag", featureInfos)).to.be.false;
        });
        it("returns false if newName is empty String", function () {
            expect(model.isNewNameInFeatureInfos("", featureInfos)).to.be.false;
        });
        it("returns false if newName is undefined", function () {
            expect(model.isNewNameInFeatureInfos(undefined, featureInfos)).to.be.false;
        });
    });
});
