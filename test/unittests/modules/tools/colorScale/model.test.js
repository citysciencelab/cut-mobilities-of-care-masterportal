import {expect} from "chai";
import Model from "@modules/tools/colorScale/model.js";

describe("tools/colorScale", function () {
    let model;

    before(function () {
        model = new Model();
    });

    describe("generateColorScale", function () {
        it("should return an object1", function () {
            expect(model.generateColorScale()).to.be.an("object");
        });

        it("should return an object with the keys legend and scale", function () {
            expect(model.generateColorScale()).to.have.all.keys("legend", "scale");
        });

        it("should return an array with the length of 5", function () {
            expect(model.generateColorScale().legend.colors).to.be.an("array");
            expect(model.generateColorScale().legend.colors).to.have.lengthOf(5);
        });

        it("should return a rgb string equal to rgb(109, 174, 213)", function () {
            expect(model.generateColorScale().scale("0.5")).to.be.a("string").to.equal("rgb(109, 174, 213)");
        });

        it("should return a rgb string equal to rgb(227, 238, 248)", function () {
            expect(model.generateColorScale(["853.0", "1312.0", "1133.0"], "interpolateBlues").scale("900")).to.equal("rgb(227, 238, 248)");
        });


        it("should return a rgb string equal to rgb(247, 251, 255)", function () {
            expect(model.generateColorScale([undefined, "1312.0", "1133.0"], undefined).scale("900")).to.equal("rgb(247, 251, 255)");
        });
    });

    describe("interpolateValues", function () {
        it("should return an array with the length of 5", function () {
            expect(model.interpolateValues(1652, 2552)).to.be.an("array");
            expect(model.interpolateValues(1652, 2552)).to.have.lengthOf(5);
        });

        it("should return 2327 in 4th place", function () {
            expect(model.interpolateValues(1652, 2552)[3]).to.equal(2327);
        });

        it("should return an array with the length of 7", function () {
            expect(model.interpolateValues(1652, 2552, 7)).to.have.lengthOf(7);
        });
    });
});
