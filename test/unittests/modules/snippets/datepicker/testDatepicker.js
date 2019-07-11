import {expect} from "chai";
import Model from "@modules/snippets/datepicker/model.js";

describe("snippets/slider/model", function () {
    let model;

    beforeEach(function () {
        const today = new Date("2019, 06, 15"),
            startDate = new Date("2019, 01, 01"),
            endDate = new Date("2019, 12, 31");

        model = new Model({
            displayName: "irgendwas",
            preselectedValue: today,
            startDate: startDate,
            endDate: endDate,
            type: "datepicker"
        });
    });

    describe("check input values", function () {
        it("input values are set like they should", function () {
            const values = model.getSelectedValues();

            expect(values).to.be.an("object").to.include({type: "datepicker"});
            expect(values.values).to.be.an("array");
            expect(values.values[0].toString()).to.equal("Sat Jun 15 2019 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)");
        });
    });

    describe("update values works correctly", function () {
        it("input values are set like they should", function () {
            const today = new Date("2019, 06, 16");
            var values;

            model.updateValues(today);
            values = model.getSelectedValues();
            expect(values).to.be.an("object").to.include({type: "datepicker"});
            expect(values.values).to.be.an("array");
            expect(values.values[0].toString()).to.equal("Sun Jun 16 2019 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)");
        });
    });

    describe("update values silently works also", function () {
        it("input values are set like they should", function () {
            const today = new Date("2019, 06, 17");
            var values;

            model.updateValuesSilently(today);
            values = model.getSelectedValues();
            expect(values).to.be.an("object").to.include({type: "datepicker"});
            expect(values.values).to.be.an("array");
            expect(values.values[0].toString()).to.equal("Mon Jun 17 2019 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)");
        });
    });
});
