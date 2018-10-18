import {expect} from "chai";
import Model from "./testModel.js";


describe("testModul", function () {
    describe("getEmployeesByName", function () {
        var model;

        before(function () {
            /* runs before the first it() is executed */
            console.log("before getEmployeesByName");
            model = new Model();
            model.setEmployees([{name: "Robin", coffeeCount: 0}, {name: "Jonas", coffeeCount: 1}]);
        });
        // type test using expect
        it("getEmployeesByName('Jonas') should return an array of length one", function () {
            expect(model.getEmployeesByName("Jonas")).to.be.a("array").with.lengthOf(1);
        });
        it("getEmployeesByName return an array containing ", function () {
            expect(model.getEmployeesByName("Jonas")).to.deep.include({name: "Jonas", coffeeCount: 1});
        });
        // type test using expect
        it("getEmployeesByName('') should return an array of length zero", function () {
            expect(model.getEmployeesByName("")).to.be.a("array").with.lengthOf(0);
        });
        // type test using expect
        it("getEmployeesByName(undefined) should return an array of length zero", function () {
            expect(model.getEmployeesByName()).to.be.a("array").with.lengthOf(0);
        });
    });
    describe("giveCoffee", function () {
        var model;

        before(function () {
            /* runs before the first it() is executed */
            console.log("before givecoffee");
            model = new Model();
        });
        beforeEach(function () {
            /* runs before each it() is executed */
            console.log("beforeEach giveCoffee");
            // reset Employees before each test
            model.setEmployees([{name: "Robin", coffeeCount: 0}, {name: "Jonas", coffeeCount: 1}]);
        });

        // type test using expect
        it("giveCoffee should increase coffeeCount", function () {
            model.giveCoffee(model.getEmployeesByName("Robin")[0]);
            expect(model.getEmployeesByName("Robin")[0]).to.deep.equal({name: "Robin", coffeeCount: 1});
        });
    });
    describe("getIsAwake", function () {
        var model;

        before(function () {
            /* runs before the first it() is executed */
            console.log("before getAlertness");
            model = new Model();
        });
        // Lieber zwei kleine Test schnell...
        it("getIsAwake should return fale when coffeeCount = 0", function () {
            expect(model.getIsAwake({name: "Robin", coffeeCount: 0})).to.be.false;
        });
        // ... runter schreiben als mit komplizierten konstrukten Werte bereiche testen
        it("getIsAwake should return false when coffeeCount = 0", function () {
            expect(model.getIsAwake({name: "Robin", coffeeCount: 1})).to.be.false;
        });
        // type test using expect
        it("getIsAwake should return true when coffeeCount = 2", function () {
            expect(model.getIsAwake({name: "Robin", coffeeCount: 2})).to.be.true;
        });
    });
    describe("getSleepingEmployeeNames", function () {
        var model;

        before(function () {
            /* runs before the first it() is executed */
            console.log("before getAlertness");
            model = new Model();
        });
        beforeEach(function () {
            /* runs before each it() is executed */
            console.log("beforeEach getSleepingEmployeeNames");
            model.setEmployees([{name: "Robin", coffeeCount: 0}, {name: "Jonas", coffeeCount: 1}, {name: "Sebastian", coffeeCount: 2}, {name: "Michael", coffeeCount: 3}]);
        });
        // positiv test
        it("getSleepingEmployeeNames should return employee with coffecounts below 2", function () {
            expect(model.getSleepingEmployeeNames()).to.deep.equal(["Robin", "Jonas"]);
        });
        // negativ test
        it("getSleepingEmployeeNames should not return employee with coffecounts > 2", function () {
            expect(model.getSleepingEmployeeNames()).to.not.include("Sebastian").and.to.not.include("Michael");
        });
    });
});
