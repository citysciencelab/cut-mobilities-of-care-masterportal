import {expect} from "chai";
import Model from "@modules/controls/orientation/poi/model.js";
import Style from "@modules/vectorStyle/model.js";
import Feature from "ol/Feature.js";

describe("POI (In meiner Nähe)", function () {
    var model,
        distances = [500, 1000, 2000];

    before(function () {
        model = Model;
        model.setPoiDistances(distances);
    });

    describe("getFeatureTitle", function () {
        var feature = new Feature();

        it("should return featureId when other info is unset", function () {
            feature.setId("123");
            expect(model.getFeatureTitle(feature)).to.be.an("string").to.equal("123");
        });
        it("should return layerName when name is unset", function () {
            feature = _.extend(feature, {
                layerName: "LayerName"
            });
            expect(model.getFeatureTitle(feature)).to.be.an("string").to.equal("LayerName");
        });
        it("should return name when set", function () {
            feature.set("name", "Name");
            expect(model.getFeatureTitle(feature)).to.be.an("string").to.equal("Name");
        });
    });

    describe("SVG Functions", function () {
        var style = new Style();

        it("createPolygonSVG should return an SVG", function () {
            expect(model.createPolygonSVG(style)).to.be.an("string").to.equal("<svg height=\'35\' width=\'35\'><polygon points=\'5,5 30,5 30,30 5,30\' style=\'fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-opacity:1;stroke-width:2;\'/></svg>");
        });
        it("createLineSVG should return an SVG", function () {
            expect(model.createLineSVG(style)).to.be.an("string").to.equal("<svg height=\'35\' width=\'35\'><path d=\'M 05 30 L 30 05\' stroke=\'#000000\' stroke-opacity=\'1\' stroke-width=\'2\' fill=\'none\'/></svg>");
        });
        it("createCircleSVG should return an SVG", function () {
            expect(model.createCircleSVG(style)).to.be.an("string").to.equal("<svg height=\'35\' width=\'35\'><circle cx=\'17.5\' cy=\'17.5\' r=\'15\' stroke=\'#000000\' stroke-opacity=\'1\' stroke-width=\'2\' fill=\'#0099ff\' fill-opacity=\'1\'/></svg>");
        });
    });

    describe("Imagenamen bei StyleFieldAngaben", function () {
        var feature = new Feature(),
            style = new Style();

        feature.set("kategorie", "Test");
        style.set("styleField", "kategorie");
        style.set("styleFieldValues", [
            {
                styleFieldValue: "Test",
                imageName: "Test.png"
            }
        ]);
        it("createStyleFieldImageName should return an SVG", function () {
            expect(model.createStyleFieldImageName(feature, style)).to.be.an("string").to.equal("Test.png");
        });
    });
});
