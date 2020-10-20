import {expect} from "chai";
import collectYearData from "../../../library/collectYearData";


describe("src/modules/tools/gfi/components/themes/continuousCountingBike/library/collectYearData.js", () => {

    const yearLine = "2018,5,22200|2018,6,24896|2018,4,27518|2018,3,19464|2018,2,27534|2018,1,17096|2018,7,3103";

    before(function () {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });


    describe("collectYearData", function () {
        it("should return object that have all keys", function () {
            expect(collectYearData(yearLine)).to.be.an("object").that.have.all.keys(["data", "xLabel", "yLabel", "graphArray", "xAxisTicks", "legendArray"]);
        });
        it("should return object that has empty keys", function () {
            expect(collectYearData(undefined)).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "modules.tools.gfi.themes.continuousCountingBike.yearScheduleInYear",
                graphArray: "",
                xAxisTicks: {
                    unit: "Kw",
                    values: []
                },
                legendArray: ""
            });
        });
        it("should return object that has empty keys", function () {
            expect(collectYearData()).to.be.an("object").to.deep.include({
                data: "",
                xLabel: "modules.tools.gfi.themes.continuousCountingBike.yearScheduleInYear",
                graphArray: "",
                xAxisTicks: {
                    unit: "Kw",
                    values: []
                },
                legendArray: ""
            });
        });
    });

});
