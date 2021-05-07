import {expect} from "chai";
import deepAssign from "../../deepAssign.js";

describe("src/utils/deepAssign.js", () => {
    describe("deepAssign", () => {
        it("should alter the given target and return it", () => {
            const target = {a: 1},
                source = {b: 2},
                expected = {a: 1, b: 2},
                result = deepAssign(target, source);

            expect(target).to.deep.equal(expected);
            expect(result).to.deep.equal(expected);
        });
        it("should return null if anything but an object is given as target", () => {
            expect(deepAssign(undefined)).to.be.null;
            expect(deepAssign(null)).to.be.null;
            expect(deepAssign(1)).to.be.null;
            expect(deepAssign("string")).to.be.null;
            expect(deepAssign(true)).to.be.null;
            expect(deepAssign(false)).to.be.null;
        });
        it("should ignore sources that are no objects", () => {
            const target = {a: 1},
                source_1 = "test",
                source_2 = {b: 1},
                expected = {a: 1, b: 1};

            expect(deepAssign(target, source_1, source_2)).to.deep.equal(expected);
        });
        it("should work with arrays as with objects", () => {
            const target = [{a: 1}],
                source = [{b: 2}],
                expected = [{a: 1, b: 2}];

            expect(deepAssign(target, source)).to.deep.equal(expected);
        });
        it("should have a depth barrier of 200", () => {
            const target = {},
                deepSource = {},
                depthToExpect = 200,
                depthToTest = 201;
            let deepRef = deepSource,
                measuredDepth = 0;

            for (let i = 0; i < depthToTest; i++) {
                deepRef.a = {};
                deepRef = deepRef.a;
            }
            deepAssign(target, deepSource);

            deepRef = target;
            while (deepRef.a) {
                deepRef = deepRef.a;
                measuredDepth++;
            }

            expect(measuredDepth).to.equal(depthToExpect);
        });
        it("should soft assign the given source objects to the given target object", () => {
            const target = {
                    m: {a: 1, b: 2},
                    n: {c: 3, d: 4}
                },
                source_1 = {
                    m: {a: 5},
                    o: {e: 6}
                },
                source_2 = {
                    n: {c: 7, f: 8},
                    o: {g: 9}
                },
                expected = {
                    m: {a: 5, b: 2},
                    n: {c: 7, d: 4, f: 8},
                    o: {e: 6, g: 9}
                };

            expect(deepAssign(target, source_1, source_2)).to.deep.equal(expected);
        });
    });
});
