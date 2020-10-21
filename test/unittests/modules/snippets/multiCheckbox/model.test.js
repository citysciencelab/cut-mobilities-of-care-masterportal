import Model from "@modules/snippets/multiCheckbox/model.js";
import Style from "@modules/vectorStyle/model.js";
import {expect} from "chai";

describe("Multicheckbox Model", function () {
    let model;

    before(function () {
        model = new Model({
            values: ["Freizeit", "Freiraum und Grün"]
        });
    });


    describe("updateSelectedValues", function () {
        let initialValue, updatedValue;

        before(function () {
            initialValue = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            })[0].get("isSelected");
        });

        it("should update Value", function () {

            model.updateSelectedValues("Freizeit", true);
            updatedValue = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            })[0].get("isSelected");

            expect(initialValue).to.be.false;
            expect(updatedValue).to.be.true;
        });
    });

    describe("resetValues", function () {
        let initialValue, updatedValue;

        before(function () {
            const valueModel = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            });

            valueModel[0].set("isSelectable", false);
            initialValue = valueModel[0].get("isSelectable");
        });

        it("should reset Value", function () {
            model.resetValues();
            updatedValue = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            })[0].get("isSelectable");

            expect(initialValue).to.be.false;
            expect(updatedValue).to.be.true;
        });
    });

    describe("addValueModels", function () {
        let initialValue, updatedValue;

        before(function () {

            const countTest1 = model.get("valuesCollection").models.filter(function (value) {
                    return value.get("value") === "Test1";
                }).length,
                countTest2 = model.get("valuesCollection").models.filter(function (value) {
                    return value.get("value") === "Test2";
                }).length;

            initialValue = countTest1 + countTest2;
        });

        it("should add Value Models", function () {

            model.addValueModels(["Test1", "Test2"]);

            const countTest1 = model.get("valuesCollection").models.filter(function (value) {
                    return value.get("value") === "Test1";
                }).length,
                countTest2 = model.get("valuesCollection").models.filter(function (value) {
                    return value.get("value") === "Test2";
                }).length;

            updatedValue = countTest1 + countTest2;

            expect(initialValue).to.equal(0);
            expect(updatedValue).to.equal(2);
        });
    });

    describe("updateSelectableValues", function () {
        let initialValue, updatedValue;

        before(function () {
            const valueModel = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            });

            valueModel[0].set("isSelected", false);

            initialValue = valueModel[0].get("isSelectable");
        });

        it("should update Selectable Values", function () {

            model.updateSelectableValues("Freizeit");

            const valueModel = model.get("valuesCollection").models.filter(function (value) {
                return value.get("value") === "Freizeit";
            });

            updatedValue = valueModel[0].get("isSelectable");

            expect(initialValue).to.be.true;
            expect(updatedValue).to.be.false;
        });
    });

    describe("SVG Functions", function () {
        const style = new Style();

        it("createPolygonSVG should return an SVG", function () {
            expect(model.createPolygonSVG(style)).to.be.an("string").to.equal("<svg height='25' width='25'><polygon points='5,5 20,5 20,20 5,20' style='fill:rgb(255,255,255);fill-opacity:1;stroke:rgb(0,0,0);stroke-opacity:1;stroke-width:2;'/></svg>");
        });
        it("createLineSVG should return an SVG", function () {
            expect(model.createLineSVG(style)).to.be.an("string").to.equal("<svg height='25' width='25'><path d='M 05 20 L 20 05' stroke='rgb(0,0,0)' stroke-opacity='1' stroke-width='2' fill='none'/></svg>");
        });
        it("createCircleSVG should return an SVG", function () {
            expect(model.createCircleSVG(style)).to.be.an("string").to.equal("<svg height='25' width='25'><circle cx='12.5' cy='12.5' r='10' stroke='rgb(0,0,0)' stroke-opacity='1' stroke-width='2' fill='rgb(0,153,255)' fill-opacity='1'/></svg>");
        });
    });
});
