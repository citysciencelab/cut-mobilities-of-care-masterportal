import {expect} from "chai";
import Model from "./testModel.js";


describe("test/unittests/ExampleTest/testModel.js", () => {
    describe("getEmployeesByName", () => {
        let model;

        before(() => {
            /* runs before the first it() is executed */
            console.warn("before getEmployeesByName");
            model = new Model();
            model.setEmployees([{name: "Robin", coffeeCount: 0}, {name: "Jonas", coffeeCount: 1}]);
        });
        // type test using expect
        it("getEmployeesByName('Jonas') should return an array of length one", () => {
            expect(model.getEmployeesByName("Jonas")).to.be.a("array").with.lengthOf(1);
        });
        it("getEmployeesByName return an array containing ", () => {
            expect(model.getEmployeesByName("Jonas")).to.deep.include({name: "Jonas", coffeeCount: 1});
        });
        // type test using expect
        it("getEmployeesByName('') should return an array of length zero", () => {
            expect(model.getEmployeesByName("")).to.be.a("array").with.lengthOf(0);
        });
        // type test using expect
        it("getEmployeesByName(undefined) should return an array of length zero", () => {
            expect(model.getEmployeesByName()).to.be.a("array").with.lengthOf(0);
        });
    });
    describe("giveCoffee", () => {
        let model;

        before(() => {
            /* runs before the first it() is executed */
            console.warn("before givecoffee");
            model = new Model();
        });
        beforeEach(() => {
            /* runs before each it() is executed */
            console.warn("beforeEach giveCoffee");
            // reset Employees before each test
            model.setEmployees([{name: "Robin", coffeeCount: 0}, {name: "Jonas", coffeeCount: 1}]);
        });

        // type test using expect
        it("giveCoffee should increase coffeeCount", () => {
            model.giveCoffee(model.getEmployeesByName("Robin")[0]);
            expect(model.getEmployeesByName("Robin")[0]).to.deep.equal({name: "Robin", coffeeCount: 1});
        });
    });
    describe("getIsAwake", () => {
        let model;

        before(() => {
            /* runs before the first it() is executed */
            console.warn("before getAlertness");
            model = new Model();
        });
        // Lieber zwei kleine Test schnell...
        it("getIsAwake should return fale when coffeeCount = 0", () => {
            expect(model.getIsAwake({name: "Robin", coffeeCount: 0})).to.be.false;
        });
        // ... runter schreiben als mit komplizierten konstrukten Werte bereiche testen
        it("getIsAwake should return false when coffeeCount = 0", () => {
            expect(model.getIsAwake({name: "Robin", coffeeCount: 1})).to.be.false;
        });
        // type test using expect
        it("getIsAwake should return true when coffeeCount = 2", () => {
            expect(model.getIsAwake({name: "Robin", coffeeCount: 2})).to.be.true;
        });
    });
    describe("getSleepingEmployeeNames", () => {
        let model;

        before(() => {
            /* runs before the first it() is executed */
            console.warn("before getAlertness");
            model = new Model();
        });
        beforeEach(() => {
            /* runs before each it() is executed */
            console.warn("beforeEach getSleepingEmployeeNames");
            model.setEmployees([{name: "Robin", coffeeCount: 0}, {name: "Jonas", coffeeCount: 1}, {name: "Sebastian", coffeeCount: 2}, {name: "Michael", coffeeCount: 3}]);
        });
        // positiv test
        it("getSleepingEmployeeNames should return employee with coffecounts below 2", () => {
            expect(model.getSleepingEmployeeNames()).to.deep.equal(["Robin", "Jonas"]);
        });
        // negativ test
        it("getSleepingEmployeeNames should not return employee with coffecounts > 2", () => {
            expect(model.getSleepingEmployeeNames()).to.not.include("Sebastian").and.to.not.include("Michael");
        });
    });
});
