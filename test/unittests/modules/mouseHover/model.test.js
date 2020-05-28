import Model from "@modules/mouseHover/model.js";
import {expect} from "chai";

describe("mouseHover", function () {
    let model;

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
            const array1 = ["Teststring"],
                array2 = ["Teststring"];

            expect(model.isTextEqual(array1, array2)).to.be.equal;
        });
        it("should return false", function () {
            const array1 = ["Teststring"],
                array2 = ["Teststring2"];

            expect(model.isTextEqual(array1, array2)).not.to.be.equal;
        });
    });
    describe("picks correct value", function () {
        it("should return string of value", function () {
            const mouseHoverField = "kategorie",
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
            const mouseHoverField = ["kategorie", "nummer"],
                featureProperties = {
                    adresse: "Finksweg 82, 21129 Hamburg",
                    kategorie: "Schwimmbäder",
                    link: "http://www.baederland.de/bad/finkenwerder.html",
                    name: "Finkenwerder / Schwimmen und Wasserspaß mit Elbblick",
                    nummer: "10"
                };

            expect(model.pickValue(mouseHoverField, featureProperties)).to.equal("<span class='title'>Schwimmbäder</span></br><span class=''>10</span></br>");
        });
    });
    describe("reduces array to numFeaturesToShow", function () {
        it("should return simple text", function () {
            const textArray = ["text1", "text2", "text3", "text4"];

            expect(model.checkMaxFeaturesToShow(textArray, 4)).to.have.lengthOf(4);
        });
        it("should return infoText if length of textArray outnumbers given max length", function () {
            const textArray = ["text1", "text2", "text3", "text4"],
                content = model.checkMaxFeaturesToShow(textArray, 2, "foo");

            expect(content).to.have.lengthOf(3);
            expect(content[2]).to.equal("foo");
        });
    });
    describe("adds break", function () {
        it("should insert <br> into array", function () {
            const textArray = ["text1", "text2"];

            expect(model.addBreak(textArray)).to.have.lengthOf(3);
            expect(model.addBreak(textArray)[1]).to.equal("<br>");
        });
    });
});
