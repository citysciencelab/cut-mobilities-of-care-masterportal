import {expect} from "chai";
import Model from "@modules/tools/graph/model.js";

var model;

before(function () {
    model = new Model();
});

describe("tools/graph", function () {

    describe("createMaxValue", function () {
        it("should return 1 for undefined input", function () {
            expect(model.createMaxValue(undefined, undefined)).to.equal(1);
        });
        it("should return 1 for empty input", function () {
            expect(model.createMaxValue([], [])).to.equal(1);
        });
        it("should return 1 for inccorect input", function () {
            expect(model.createMaxValue(["abc"], [321])).to.equal(1);
        });
        it("should return meanvalue for correct input", function () {
            var data = [{
                hour: 0,
                mean: 0.5
            },
            {
                hour: 1,
                mean: 0.5
            }];

            expect(model.createMaxValue(data, ["mean"])).to.equal(0.5);
        });
    });
    describe("createValues", function () {
        it("should return an object with minValue 0 and maxValue 1 for undefined input", function () {
            expect(model.createValues(undefined, undefined, undefined)).to.be.an("object").to.deep.include({
                minValue: 0,
                maxValue: 1
            });
        });
        it("should return an object with minValue 0 and maxValue 1 for empty input", function () {
            expect(model.createValues([], [], {})).to.be.an("object").to.deep.include({
                minValue: 0,
                maxValue: 1
            });
        });
        it("should return an object with minValue 0 and maxValue 1 for incorrect input", function () {
            expect(model.createValues(["abc"], ["def"], {test: 123})).to.be.an("object").to.deep.include({
                minValue: 0,
                maxValue: 1
            });
        });
        it("should return an object with minValue 0 and maxValue 1 for incorrect input", function () {
            var data = [{
                    hour: 0,
                    mean: 0.5
                },
                {
                    hour: 1,
                    mean: 0.5
                }],
                axisTicks = {
                    start: 0,
                    end: 24,
                    ticks: 12,
                    unit: "Uhr"
                };

            expect(model.createValues(data, ["mean"], axisTicks)).to.be.an("object").to.deep.include({
                minValue: 0,
                maxValue: 24
            });
        });
    });
});
