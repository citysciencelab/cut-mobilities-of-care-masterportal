import {expect} from "chai";

describe("Examples", function () {
    describe("Types", function () {
        describe("Boolean", function () {
            it("True", function () {
                expect(true).to.be.true;
            });
            it("False", function () {
                expect(false).to.be.false;
            });
        });
        describe("Number", function () {
            it("1", function () {
                expect(1).to.be.a("number");
            });
        });
        describe("String", function () {
            it("FooBar", function () {
                expect("FooBar").to.be.a("string");
            });
        });
        describe("Object", function () {
            it("Object", function () {
                expect({}).to.be.an("object");
            });
        });
        describe("Array", function () {
            it("Array", function () {
                expect([]).to.be.an("array");
            });
        });
    });
});
