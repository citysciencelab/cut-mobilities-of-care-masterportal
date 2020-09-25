import {expect} from "chai";
import Model from "@modules/vectorStyle/cesiumStyle";

describe("cesiumStyleModel", function () {
    let styleModel;
    const dummy = {
        rule: {},
        style: {}
    };

    before(function () {
        styleModel = new Model(dummy);
    });

    describe("createCondition", function () {
        it("Should create condition for different kinds of rules", function () {
            const condition = {
                    attr3: [15, 17],
                    attr4: "abc"
                },
                style = {
                    type: "cesium",
                    color: "rgba(0, 0, 255, 0.5)"
                };

            expect(styleModel.createCondition(condition, style)).to.deep.equal([
                "((${attr3} > 15 && ${attr3} <= 17) && (${attr4} === 'abc'))",
                "rgba(0, 0, 255, 0.5)"
            ]);
        });
        it("Should create condition for different kinds of rules", function () {
            const condition = {
                    attr2: [0, 10]
                },
                style = {
                    type: "cesium",
                    color: "rgba(0, 255, 0, 0.5)"
                };

            expect(styleModel.createCondition(condition, style)).to.deep.equal([
                "((${attr2} > 0 && ${attr2} <= 10))",
                "rgba(0, 255, 0, 0.5)"
            ]);
        });
        it("Should create condition for different kinds of rules", function () {
            const condition = {
                    attr1: 50.5
                },
                style = {
                    type: "cesium",
                    color: "rgb(255, 0, 0)"
                };

            expect(styleModel.createCondition(condition, style)).to.deep.equal([
                "((${attr1} === 50.5))",
                "rgb(255, 0, 0)"
            ]);
        });
        it("Should create condition for different kinds of rules", function () {
            const condition = {},
                style = {
                    type: "cesium",
                    color: "rgba(150, 150, 150, 0.5)"
                };

            expect(styleModel.createCondition(condition, style)).to.deep.equal([
                "true",
                "rgba(150, 150, 150, 0.5)"
            ]);
        });

    });
});
