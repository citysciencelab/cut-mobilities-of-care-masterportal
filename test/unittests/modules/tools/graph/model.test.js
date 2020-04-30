import Model from "@modules/tools/graph/model.js";
import {expect} from "chai";

let model;

before(function () {
    model = new Model();
});

describe("tools/graph", function () {

    describe("createMinValue", function () {
        it("should return 0 for undefined input", function () {
            expect(model.createMinValue(undefined, undefined)).to.equal(0);
        });
        it("should return 0 for empty input", function () {
            expect(model.createMinValue([], [])).to.equal(0);
        });
        it("should return 0 for inccorect input", function () {
            expect(model.createMinValue(["abc"], [321])).to.equal(0);
        });
        it("should return -0.5 for a minimum bar value of -0.5", function () {
            const data = [{
                foo: -1,
                bar: -0.5
            }, {
                foo: 0,
                bar: -0.5
            }];

            expect(model.createMinValue(data, ["bar"])).to.equal(-0.5);
        });
        it("should return 0 for only positive input", function () {
            const data = [{
                foo: 1,
                bar: 1
            }, {
                foo: 2,
                bar: 2
            }];

            expect(model.createMinValue(data, ["bar"])).to.equal(0);
        });
    });

    describe("createMaxValue", function () {
        it("should return 0 for undefined input", function () {
            expect(model.createMaxValue(undefined, undefined)).to.equal(0);
        });
        it("should return 0 for empty input", function () {
            expect(model.createMaxValue([], [])).to.equal(0);
        });
        it("should return 0 for inccorect input", function () {
            expect(model.createMaxValue(["abc"], [321])).to.equal(0);
        });
        it("should return bar value for correct input", function () {
            const data = [{
                foo: 0,
                bar: 0.5
            }, {
                foo: 1,
                bar: 0.5
            }];

            expect(model.createMaxValue(data, ["bar"])).to.equal(0.5);
        });
        it("should return 0 for negative input only", function () {
            const data = [{
                foo: -1,
                bar: -1
            }, {
                foo: -2,
                bar: -2
            }];

            expect(model.createMaxValue(data, ["bar"])).to.equal(0);
        });
    });

    describe("createPeakValues", function () {
        it("should return an object with min 0 and max 0 for undefined input", function () {
            expect(model.createPeakValues(undefined, undefined, undefined)).to.be.an("object").to.deep.include({
                min: 0,
                max: 0
            });
        });
        it("should return an object with min 0 and max 0 for empty input", function () {
            expect(model.createPeakValues([], [], {})).to.be.an("object").to.deep.include({
                min: 0,
                max: 0
            });
        });
        it("should return an object with min 0 and max 0 for incorrect input", function () {
            expect(model.createPeakValues(["abc"], ["def"], {test: 123})).to.be.an("object").to.deep.include({
                min: 0,
                max: 0
            });
        });
        it("should return an object with min 0 and max 2 for correct input with automatic peak detection", function () {
            const data = [{
                foo: -1,
                bar: 1
            }, {
                foo: 1,
                bar: 2
            }];

            expect(model.createPeakValues(data, ["bar"])).to.be.an("object").to.deep.include({
                min: 0,
                max: 2
            });
        });
        it("should return an object with min -2 and max 0 for correct input with automatic peak detection", function () {
            const data = [{
                foo: -1,
                bar: -1
            }, {
                foo: 1,
                bar: -2
            }];

            expect(model.createPeakValues(data, ["bar"])).to.be.an("object").to.deep.include({
                min: -2,
                max: 0
            });
        });
        it("should return an object with min -2 and max +2 for correct input with automatic peak detection", function () {
            const data = [{
                foo: -1,
                bar: -2
            }, {
                foo: 1,
                bar: 2
            }];

            expect(model.createPeakValues(data, ["bar"])).to.be.an("object").to.deep.include({
                min: -2,
                max: 2
            });
        });
        it("should return an object with min 0 and max 1 for correct input with manuel peaks from -2 to +2", function () {
            const data = [{
                    foo: 0,
                    bar: 0.5
                }, {
                    foo: 1,
                    bar: 0.5
                }],
                axisTicks = {
                    start: -2,
                    end: 2,
                    ticks: 12,
                    unit: "foobar"
                };

            expect(model.createPeakValues(data, ["bar"], axisTicks)).to.be.an("object").to.deep.include({
                min: -2,
                max: 2
            });
        });
    });

    describe("createLinearScale", function () {
        it("should return a function in any case", function () {
            expect(model.createLinearScale(-1, 1, [100, 0])).to.be.a("function");
            expect(model.createLinearScale(undefined, undefined, undefined)).to.be.a("function");
        });

        it("should return a scale function not processing incorrect ranges, shall return undefined if done", function () {
            let scale;

            scale = model.createLinearScale(-1, 1, [100, undefined]);
            expect(scale(2)).to.equal(undefined);

            scale = model.createLinearScale(-1, 1, [undefined, undefined]);
            expect(scale(2)).to.equal(undefined);

            scale = model.createLinearScale(-1, 1, undefined);
            expect(scale(2)).to.equal(undefined);

            scale = model.createLinearScale(undefined, undefined, undefined);
            expect(scale(2)).to.equal(undefined);
        });
        it("should return a scale function not processing incorrect min/max-values, shall return number NaN if so", function () {
            let scale;

            scale = model.createLinearScale(undefined, undefined, [100, 0]);
            expect(isNaN(scale(2))).to.equal(true);

            scale = model.createLinearScale(-1, undefined, [100, 0]);
            expect(isNaN(scale(2))).to.equal(true);

            scale = model.createLinearScale(undefined, 1, [100, 0]);
            expect(isNaN(scale(2))).to.equal(true);
        });

        it("should return a scale function returning a linear scale for given value and range", function () {
            const scale = model.createLinearScale(-1, 1, [100, 0]);

            expect(scale(2)).to.equal(-50);
            expect(scale(1)).to.equal(0);
            expect(scale(0)).to.equal(50);
            expect(scale(-1)).to.equal(100);
            expect(scale(-2)).to.equal(150);
        });
        it("should return a scale function returning an inverted linear scale for given value and inverted range", function () {
            const scale = model.createLinearScale(-1, 1, [0, 100]);

            expect(scale(2)).to.equal(150);
            expect(scale(1)).to.equal(100);
            expect(scale(0)).to.equal(50);
            expect(scale(-1)).to.equal(0);
            expect(scale(-2)).to.equal(-50);
        });
        it("should return a scale function being able to shift a linear scale for given value and a shifted range", function () {
            const scale = model.createLinearScale(-1, 1, [200, 100]);

            expect(scale(2)).to.equal(50);
            expect(scale(1)).to.equal(100);
            expect(scale(0)).to.equal(150);
            expect(scale(-1)).to.equal(200);
            expect(scale(-2)).to.equal(250);
        });
    });

    describe("createOrdinalScale", function () {
        const wellFormedData = [
            {foo: 1, bar: "low"},
            {foo: 2, bar: "mid"},
            {foo: 3, bar: "high"}
        ];

        it("should return a function in any case possible", function () {
            expect(model.createOrdinalScale(wellFormedData, [0, 99], ["bar"])).to.be.a("function");
            expect(model.createOrdinalScale(undefined, undefined, undefined)).to.be.a("function");
        });

        it("should return a scale function returning undefined if filter key is unknown or undefined", function () {
            let scale;

            scale = model.createOrdinalScale(wellFormedData, [99, 0], ["foobar"]);
            expect(scale("high")).to.equal(undefined);
            expect(scale("mid")).to.equal(undefined);
            expect(scale("low")).to.equal(undefined);
            expect(scale("foobar")).to.equal(undefined);

            scale = model.createOrdinalScale(wellFormedData, [99, 0], undefined);
            expect(scale("high")).to.equal(undefined);
            expect(scale("mid")).to.equal(undefined);
            expect(scale("low")).to.equal(undefined);
        });
        it("should return a scale function returning numeric NaN if range is missleading, unknown or undefined", function () {
            let scale;

            scale = model.createOrdinalScale(wellFormedData, undefined, ["bar"]);
            expect(isNaN(scale("high"))).to.equal(true);
            expect(isNaN(scale("mid"))).to.equal(true);
            expect(isNaN(scale("low"))).to.equal(true);
            expect(scale("foobar")).to.equal(undefined);

            scale = model.createOrdinalScale(wellFormedData, ["foo", "bar"], ["bar"]);
            expect(isNaN(scale("high"))).to.equal(true);
            expect(isNaN(scale("mid"))).to.equal(true);
            expect(isNaN(scale("low"))).to.equal(true);
            expect(scale("foobar")).to.equal(undefined);
        });
        it("should return a scale function returning undefined if dataset is missleading, unknown or undefined", function () {
            let scale;

            scale = model.createOrdinalScale(undefined, [99, 0], ["bar"]);
            expect(scale("high")).to.equal(undefined);
            expect(scale("mid")).to.equal(undefined);
            expect(scale("low")).to.equal(undefined);

            scale = model.createOrdinalScale(123, [99, 0], ["bar"]);
            expect(scale("high")).to.equal(undefined);
            expect(scale("mid")).to.equal(undefined);
            expect(scale("low")).to.equal(undefined);

            scale = model.createOrdinalScale([undefined], [99, 0], ["bar"]);
            expect(scale("high")).to.equal(undefined);
            expect(scale("mid")).to.equal(undefined);
            expect(scale("low")).to.equal(undefined);

            scale = model.createOrdinalScale([123], [99, 0], ["bar"]);
            expect(scale("high")).to.equal(undefined);
            expect(scale("mid")).to.equal(undefined);
            expect(scale("low")).to.equal(undefined);

            scale = model.createOrdinalScale([{"foo": "bar"}], [99, 0], ["bar"]);
            expect(scale("high")).to.equal(undefined);
            expect(scale("mid")).to.equal(undefined);
            expect(scale("low")).to.equal(undefined);
        });

        it("should return a scale function returning an ordinal scale for given dataset, range and filter", function () {
            const scale = model.createOrdinalScale(wellFormedData, [99, 0], ["bar"]);

            expect(scale("high")).to.equal(0);
            expect(scale("mid")).to.equal(33);
            expect(scale("low")).to.equal(66);
        });
        it("should return a scale function returning an inverted ordinal scale for given dataset, inverted range and filter", function () {
            const scale = model.createOrdinalScale(wellFormedData, [0, 99], ["bar"]);

            expect(scale("high")).to.equal(66);
            expect(scale("mid")).to.equal(33);
            expect(scale("low")).to.equal(0);
        });
    });
});
