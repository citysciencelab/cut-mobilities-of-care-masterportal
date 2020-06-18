import {expect} from "chai";
import Model from "@modules/vectorStyle/cesiumStyle";

describe("cesiumStyleModel", function () {
    let styleModel;

    before(function () {
        styleModel = new Model();
    });

    describe("createConditions", function () {
        it("Should create conditions for different kinds of rules", function () {
            const rules = [
                {
                    conditions: {
                        attr3: [15, 17],
                        attr4: "abc"
                    },
                    style: {
                        type: "cesium",
                        color: "rgba(0, 0, 255, 0.5)"
                    }
                },
                {
                    conditions: {
                        attr2: [0, 10]
                    },
                    style: {
                        type: "cesium",
                        color: "rgba(0, 255, 0, 0.5)"
                    }
                },
                {
                    conditions: {
                        attr1: 50.5
                    },
                    style: {
                        type: "cesium",
                        color: "rgb(255, 0, 0)"
                    }
                },
                {
                    style: {
                        type: "cesium",
                        color: "rgba(150, 150, 150, 0.5)"
                    }
                }
            ];

            expect(styleModel.createConditions(rules)).to.deep.equal([
                ["((${attr3} > 15 && ${attr3} <= 17) && (${attr4} === 'abc'))", "rgba(0, 0, 255, 0.5)"],
                ["((${attr2} > 0 && ${attr2} <= 10))", "rgba(0, 255, 0, 0.5)"],
                ["((${attr1} === 50.5))", "rgb(255, 0, 0)"],
                ["true", "rgba(150, 150, 150, 0.5)"]
            ]);
        });

    });
});
