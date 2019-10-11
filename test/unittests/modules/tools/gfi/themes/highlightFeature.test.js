import Model from "@modules/tools/gfi/highlightFeature.js";
import {expect} from "chai";
import {Fill, Image, Text, Stroke} from "ol/style";

var model;

before(function () {
    model = new Model();
});

describe("highlightFill", function () {
    it("should return overwritten fill", function () {
        const fill = new Fill();

        expect(model.highlightFill(fill, {"color": [215, 102, 41, 0.9]}).getColor()).to.be.an("array").that.includes(215, 102, 41, 0.9);
    });
});

describe("highlightImage", function () {
    it("should return overwritten image", function () {
        const image = new Image(1, false, 1, 1);

        expect(model.highlightImage(image, {"scale": 20}).getScale()).to.equal(20);
    });
});

describe("highlightStroke", function () {
    it("should return overwritten stroke", function () {
        const stroke = new Stroke();

        expect(model.highlightStroke(stroke, {"width": 4}).getWidth()).to.equal(4);
    });
});

describe("highlightText", function () {
    it("should return overwritten text", function () {
        const text = new Text();

        expect(model.highlightText(text, {"scale": 20}).getScale()).to.equal(20);
    });
});
