import {expect} from "chai";
import {
    addMissingDataDay,
    addMissingDataWeek,
    addMissingDataYear
} from "../../library/addMissingData.js";

describe("src/modules/tools/gfi/components/themes/trafficCount/library/addMissingData.js", () => {
    describe("addMissingDataDay", () => {
        it("should set the seconds of timeData to zero", () => {
            const from = "2020-09-15 00:00:01",
                timeData = {
                    "2020-09-15 00:00:42": 0
                },
                result = addMissingDataDay(from, timeData),
                keys = Object.keys(result);

            expect(result).to.be.an("object").and.not.to.be.empty;
            expect(keys).to.be.an("array").to.not.have.lengthOf(0);
            expect(keys[0]).to.equal("2020-09-15 00:00:00");
        });
        it("should add missing entries with value null", () => {
            const from = "2020-09-15 00:00:01",
                timeData = {
                    "2020-09-15 00:00:42": 0,
                    "2020-09-15 00:15:42": 1,
                    "2020-09-15 00:30:42": 2
                },
                result = addMissingDataDay(from, timeData),
                keys = Object.keys(result);

            expect(result).to.be.an("object").and.not.to.be.empty;
            expect(keys).to.be.an("array").to.have.lengthOf(24 * 4);
            expect(result[keys[0]]).to.equal(0);
            expect(result[keys[1]]).to.equal(1);
            expect(result[keys[2]]).to.equal(2);

            keys.forEach((key, idx) => {
                if (idx > 2) {
                    expect(result[key]).to.be.null;
                }
            });
        });
    });
    describe("addMissingDataWeek", () => {
        it("should set the seconds of timeData to zero", () => {
            const from = "2020-09-15 00:00:01",
                timeData = {
                    "2020-09-14 00:00:42": 0
                },
                result = addMissingDataWeek(from, timeData),
                keys = Object.keys(result);

            expect(result).to.be.an("object").and.not.to.be.empty;
            expect(keys).to.be.an("array").to.not.have.lengthOf(0);
            expect(keys[0]).to.equal("2020-09-14 00:00:00");
        });
        it("should add missing entries with value null", () => {
            const from = "2020-09-14 00:00:01",
                timeData = {
                    "2020-09-14 00:00:42": 0,
                    "2020-09-15 00:00:42": 1,
                    "2020-09-16 00:00:42": 2
                },
                result = addMissingDataWeek(from, timeData),
                keys = Object.keys(result);

            expect(result).to.be.an("object").and.not.to.be.empty;
            expect(keys).to.be.an("array").to.have.lengthOf(7);
            expect(result[keys[0]]).to.equal(0);
            expect(result[keys[1]]).to.equal(1);
            expect(result[keys[2]]).to.equal(2);

            keys.forEach((key, idx) => {
                if (idx > 2) {
                    expect(result[key]).to.be.null;
                }
            });
        });
    });
    describe("addMissingDataYear", () => {
        it("should set the seconds of timeData to zero", () => {
            const from = "2020",
                timeData = {
                    "2019-12-30 00:00:42": 0
                },
                result = addMissingDataYear(from, timeData),
                keys = Object.keys(result);

            expect(result).to.be.an("object").and.not.to.be.empty;
            expect(keys).to.be.an("array").to.not.have.lengthOf(0);
            expect(keys[0]).to.equal("2019-12-30 00:00:00");
        });
        it("should add missing entries with value null", () => {
            const from = "2020",
                timeData = {
                    "2019-12-30 00:00:42": 0,
                    "2020-01-06 00:00:42": 1,
                    "2020-01-13 00:00:42": 2
                },
                result = addMissingDataYear(from, timeData),
                keys = Object.keys(result);

            expect(result).to.be.an("object").and.not.to.be.empty;
            expect(keys).to.be.an("array").to.have.lengthOf(53);
            expect(result[keys[0]]).to.equal(0);
            expect(result[keys[1]]).to.equal(1);
            expect(result[keys[2]]).to.equal(2);

            keys.forEach((key, idx) => {
                if (idx > 2) {
                    expect(result[key]).to.be.null;
                }
            });
        });
    });
});

