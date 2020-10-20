import {expect} from "chai";
import collectWeekData from "../../../library/collectWeekData";


describe("src/modules/tools/gfi/components/themes/continuousCountingBike/library/collectWeekData.js", () => {

    const lastSevenDaysLine = "7,12.02.2018,3103|7,13.02.2018,3778";

    before(function () {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });


    describe("getWeekData", function () {
        it("should return object that have all keys", function () {
            expect(collectWeekData(lastSevenDaysLine)).to.be.an("object").that.have.all.keys(["data", "xLabel", "yLabel", "graphArray", "xAxisTicks", "legendArray"]);
        });
        it("should return object that has empty keys", function () {
            expect(collectWeekData(undefined)).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "modules.tools.gfi.themes.continuousCountingBike.weekScheduleFromToDate",
                graphArray: "",
                xAxisTicks: {
                    values: []
                },
                legendArray: ""
            });
        });
        it("should return object that has empty keys", function () {
            expect(collectWeekData()).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "modules.tools.gfi.themes.continuousCountingBike.weekScheduleFromToDate",
                graphArray: "",
                xAxisTicks: {
                    values: []
                },
                legendArray: ""
            });
        });
    });

});
