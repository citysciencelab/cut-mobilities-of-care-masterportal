import {expect} from "chai";

describe("pathTo/Examples", () => {
    describe("Types", () => {
        it("Null", () => {
            expect(null).to.be.null;
        });
        it("Undefined", () => {
            expect(undefined).to.be.undefined;
        });
        it("Boolean", () => {
            expect(true).to.be.a("boolean");
        });
        it("Number", () => {
            expect(1).to.be.a("number");
        });
        it("Number", () => {
            expect(0.5).to.be.a("number");
        });

        it("String", () => {
            expect("FooBar").to.be.a("string");
        });
        it("Object", () => {
            expect({}).to.be.an("object");
        });
        it("Array", () => {
            expect([]).to.be.an("array");
        });
    });
    describe("Boolean", () => {
        it("True", () => {
            expect(true).to.be.true;
        });
        it("False", () => {
            expect(false).to.be.false;
        });
    });
    describe("Number", () => {
        it("1 equals 1", () => {
            expect(1).to.equal(1);
        });
        it("0.5 equals 0.5", () => {
            expect(0.5).to.equal(0.5);
        });
        it("1 greater than 0.5", () => {
            expect(1).to.be.above(0.5);
        });
        it("1 < 2", () => {
            expect(1).to.be.below(2);
        });
    });
    describe("String", () => {
        it("equals", () => {
            expect("myEqualString").to.equal("myEqualString");
        });
        it("contain", () => {
            expect("myEqualString").to.contain("qua");
        });
    });
    describe("Array", () => {
        it("length", () => {
            expect(["myEqualString"]).to.have.lengthOf(1);
        });
        it("deepEqual", () => {
            expect(["myString1", "myString2", "myString3", "myString4"]).to.deep.equal(["myString1", "myString2", "myString3", "myString4"]);
        });
    });
    describe("Object", () => {
        it("have property", () => {
            expect({key: "val"}).to.have.property("key");
        });
        it("property \"key1\" has value \"val1\"", () => {
            expect({key1: "val1", key2: "val2"}).to.own.include({key1: "val1"});
        });
        it("object is exactly the same", () => {
            expect({key1: "val1", key2: "val2"}).to.deep.own.include({key1: "val1", key2: "val2"});
        });
    });
});
