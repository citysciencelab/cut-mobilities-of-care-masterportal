import {expect} from "chai";
import {getDataAttributes, getLegendAttributes, createxAxisTickValues} from "../../../library/helper.js";

describe("src/modules/tools/gfi/components/themes/continuousCountingBike/library/helpers.js", () => {

    const inspectData = {
            r_in: null,
            r_out: null
        },
        data = [{
            class: "dot",
            date: "11.03.2019",
            r_in: null,
            r_out: null,
            style: "circle",
            tableData: "8",
            timestamp: "00:00 Uhr",
            total: 8
        }],
        xThinning = 1;

    describe("getDataAttributes", function () {
        it("should return array that is not empty", function () {
            expect(getDataAttributes(inspectData)).to.be.an("array").to.not.be.empty;
        });
        it("should return array that has length of 1", function () {
            expect(getDataAttributes(undefined)).to.be.an("array").to.have.lengthOf(1);
        });
        it("should return array that has length of 1", function () {
            expect(getDataAttributes()).to.be.an("array").to.have.lengthOf(1);
        });
    });

    describe("getLegendAttributes", function () {
        it("should return array that is not empty", function () {
            expect(getLegendAttributes(inspectData)).to.be.an("array").to.not.be.empty;
        });
        it("should return array that has length of 1", function () {
            expect(getLegendAttributes(undefined)).to.be.an("array").to.have.lengthOf(1);
        });
        it("should return array that has length of 1", function () {
            expect(getLegendAttributes()).to.be.an("array").to.have.lengthOf(1);
        });
    });

    describe("createxAxisTickValues", function () {
        it("should return object that is empty", function () {
            expect(createxAxisTickValues(data, xThinning)).to.be.an("array").that.have.lengthOf(1);
        });
        it("should return array that is empty", function () {
            expect(createxAxisTickValues(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return array that is empty", function () {
            expect(createxAxisTickValues()).to.be.an("array").that.is.empty;
        });
    });

});
