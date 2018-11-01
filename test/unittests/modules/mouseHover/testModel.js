import {expect} from "chai";
import Model from "@modules/mouseHover/model.js";

describe("mouseHover", function () {
    var model;

    before(function () {
        model = new Model();
    });

    describe("fillFeatureArray", function () {
        it("should return empty Array when featureAtPixel undefined", function () {
            expect(model.fillFeatureArray(undefined)).to.be.an("array").that.is.empty;
        });
    });
    describe("Array compare", function () {
        it("should return true", function () {
            var array1 = ["Teststring"],
                array2 = ["Teststring"];

            expect(model.isTextEqual(array1, array2)).to.be.equal;
        });
        it("should return false", function () {
            var array1 = ["Teststring"],
                array2 = ["Teststring2"];

            expect(model.isTextEqual(array1, array2)).not.to.be.equal;
        });
    });
    describe("picks correct value", function () {
        it("should return string of value", function () {
            var mouseHoverField = "kategorie",
                featureProperties = {
                    adresse: "Finksweg 82, 21129 Hamburg",
                    kategorie: "Schwimmbäder",
                    link: "http://www.baederland.de/bad/finkenwerder.html",
                    name: "Finkenwerder / Schwimmen und Wasserspaß mit Elbblick",
                    nummer: "10"
                };

            expect(model.pickValue(mouseHoverField, featureProperties)).to.equal("Schwimmbäder");
        });
        it("should return <span> Element", function () {
            var mouseHoverField = ["kategorie", "nummer"],
                featureProperties = {
                    adresse: "Finksweg 82, 21129 Hamburg",
                    kategorie: "Schwimmbäder",
                    link: "http://www.baederland.de/bad/finkenwerder.html",
                    name: "Finkenwerder / Schwimmen und Wasserspaß mit Elbblick",
                    nummer: "10"
                };

            expect(model.pickValue(mouseHoverField, featureProperties)).to.equal("<span class=\'title\'>Schwimmbäder</span></br><span class=\'\'>10</span></br>");
        });
    });
    describe("reduces array to numFeaturesToShow", function () {
        it("should return simple text", function () {
            var textArray = ["text1", "text2", "text3", "text4"];

            model.set("numFeaturesToShow", 4);
            expect(model.checkMaxFeaturesToShow(textArray)).to.have.lengthOf(4);
        });
        it("should return breakes text", function () {
            var textArray = ["text1", "text2", "text3", "text4"];

            model.set("numFeaturesToShow", 2);
            expect(model.checkMaxFeaturesToShow(textArray)).to.have.lengthOf(3);
            expect(model.checkMaxFeaturesToShow(textArray)[2]).to.equal("<span class=\'info\'>(weitere Objekte. Bitte zoomen.)</span>");
        });
    });
    describe("adds break", function () {
        it("should insert <br> into array", function () {
            var textArray = ["text1", "text2"];

            expect(model.addBreak(textArray)).to.have.lengthOf(3);
            expect(model.addBreak(textArray)[1]).to.equal("<br>");
        });
    });
});
