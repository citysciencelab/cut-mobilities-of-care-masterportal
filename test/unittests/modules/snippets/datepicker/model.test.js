import {expect} from "chai";
import Model from "@modules/snippets/datepicker/model.js";
import moment from "moment";

describe("snippets/datepicker/model", function () {
    let model;

    beforeEach(function () {
        const today = moment("2019, 06, 15").format("YYYY-MM-DD"),
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
            expect(values.values).to.be.a("string");
            expect(values.values).to.equal("2019-06-15");
        });
    });

    describe("update values works correctly", function () {
        it("input values are set like they should", function () {
            const today = moment("2019, 06, 16").format("YYYY-MM-DD");

            model.updateValues(today);

            /* eslint-disable-next-line one-var */
            const values = model.getSelectedValues();

            expect(values).to.be.an("object").to.include({type: "datepicker"});
            expect(values.values).to.be.a("string");
            expect(values.values).to.equal("2019-06-16");
        });
    });

    describe("update values silently works also", function () {
        it("input values are set like they should", function () {
            const today = moment("2019, 06, 17").format("YYYY-MM-DD");

            model.updateValuesSilently(today);

            /* eslint-disable-next-line one-var */
            const values = model.getSelectedValues();

            expect(values).to.be.an("object").to.include({type: "datepicker"});
            expect(values.values).to.be.a("string");
            expect(values.values).to.equal("2019-06-17");
        });
    });

    describe("getDatesForWeekPicker", function () {
        it("should return an empty array because both dates are in the same week", function () {
            const dates = model.getDatesForWeekPicker(["Tue Jun 09 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)", "Mon Jun 08 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)"]);

            expect(dates).to.be.an("array");
            expect(dates).to.be.empty;
        });

        it("should return an array with two dates because both dates are not in the same week", function () {
            const dates = model.getDatesForWeekPicker(["Tue Jun 16 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)", "Mon Jun 08 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)"]);

            expect(dates).to.be.an("array");
            expect(dates).to.have.lengthOf(2);
            expect(dates).to.deep.equal(["Tue Jun 16 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)", "Mon Jun 08 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)"]);
        });

        it("should return an array with one date", function () {
            const dates = model.getDatesForWeekPicker([
                "Tue Jun 09 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)",
                "Tue Jun 16 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)",
                "Mon Jun 08 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)"
            ]);

            expect(dates).to.be.an("array");
            expect(dates).to.have.lengthOf(1);
            expect(dates).to.deep.equal(["Tue Jun 16 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)"]);
        });

        it("should return an array with one date", function () {
            const dates = model.getDatesForWeekPicker([
                "Tue Jun 09 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)",
                "Fri Jun 26 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)",
                "Tue Jun 16 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)",
                "Mon Jun 08 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)",
                "Wed Jun 17 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)"
            ]);

            expect(dates).to.be.an("array");
            expect(dates).to.have.lengthOf(1);
            expect(dates).to.deep.equal(["Fri Jun 26 2020 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)"]);
        });
    });
});
