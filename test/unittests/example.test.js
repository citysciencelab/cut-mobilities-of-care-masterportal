import {expect} from "chai";

describe("Examples", function () {
    describe("Types", function () {
        it("Null", function () {
            expect(null).to.be.null;
        });
        it("Undefined", function () {
            expect(undefined).to.be.undefined;
        });
        it("Boolean", function () {
            expect(true).to.be.a("boolean");
        });
        it("Number", function () {
            expect(1).to.be.a("number");
        });
        it("Number", function () {
            expect(0.5).to.be.a("number");
        });

        it("String", function () {
            expect("FooBar").to.be.a("string");
        });
        it("Object", function () {
            expect({}).to.be.an("object");
        });
        it("Array", function () {
            expect([]).to.be.an("array");
        });
    });
    describe("Boolean", function () {
        it("True", function () {
            expect(true).to.be.true;
        });
        it("False", function () {
            expect(false).to.be.false;
        });
    });
    describe("Number", function () {
        it("1 equals 1", function () {
            expect(1).to.equal(1);
        });
        it("0.5 equals 0.5", function () {
            expect(0.5).to.equal(0.5);
        });
        it("1 greater than 0.5", function () {
            expect(1).to.be.above(0.5);
        });
        it("1 < 2", function () {
            expect(1).to.be.below(2);
        });
    });
    describe("String", function () {
        it("equals", function () {
            expect("myEqualString").to.equal("myEqualString");
        });
        it("contain", function () {
            expect("myEqualString").to.contain("qua");
        });
    });
    describe("Array", function () {
        it("length", function () {
            expect(["myEqualString"]).to.have.lengthOf(1);
        });
        it("deepEqual", function () {
            expect(["myString1", "myString2", "myString3", "myString4"]).to.deep.equal(["myString1", "myString2", "myString3", "myString4"]);
        });
    });
    describe("Object", function () {
        it("have property", function () {
            expect({key: "val"}).to.have.property("key");
        });
        it("property \"key1\" has value \"val1\"", function () {
            expect({key1: "val1", key2: "val2"}).to.own.include({key1: "val1"});
        });
        it("object is exactly the same", function () {
            expect({key1: "val1", key2: "val2"}).to.deep.own.include({key1: "val1", key2: "val2"});
        });
    });
});
