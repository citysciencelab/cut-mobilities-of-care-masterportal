import {expect} from "chai";
import {omit} from "../../objectHelpers";

describe("src/utils/objectHelpers.js", () => {

    describe("omit", () => {
        const obj = {a: "foo", b: "bar", c: "baz"},
            objectBoolean = {true: {x: "foo", y: "bar"}},
            objectNumber = {1: "foo", 2: "bar", 3: "baz"};

        it("should return the 3. entry", function () {
            expect(omit(obj, ["a", "b"])).to.deep.equal({c: "baz"});
        });
        it("should return obj", function () {
            expect(omit(obj, [])).to.deep.equal(obj);
        });
        it("should return {}", function () {
            expect(omit(obj, ["a", "b", "c"])).to.deep.equal({});
        });
        it("should return obj", function () {
            expect(omit(obj, [undefined])).to.deep.equal(obj);
        });
        it("should return {}", function () {
            expect(omit(undefined, [undefined])).to.deep.equal({});
        });
        it("should return {}", function () {
            expect(omit(undefined, ["a"])).to.deep.equal({});
        });
        it("should return an empty array", function () {
            expect(omit(objectBoolean, [true])).to.be.an("object").that.is.empty;
        });
        it("should return the 3. entry by number array input", function () {
            expect(omit(objectNumber, [1, 2])).to.deep.equal({3: "baz"});
        });
        it("should return obj, because ignoreCase is false", function () {
            expect(omit(obj, ["A", "B"])).to.deep.equal(obj);
        });
        it("should return the 3. entry, because ignoreCase is true", function () {
            expect(omit(obj, ["A", "B"], true)).to.deep.equal({c: "baz"});
        });
    });
});
