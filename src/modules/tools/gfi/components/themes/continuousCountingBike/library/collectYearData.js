
import * as moment from "moment";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import {getDataAttributes, getLegendAttributes, createxAxisTickValues} from "./helper.js";

/**
         * splitYearDataset creates a json for the graphic module with the yearLine data.
         * @param  {String} yearLine contains the year data of gfi content
         * @fires Util#event:RadioRequestUtilPunctuate
         * @return {Array} tempArr array with prepared objects of the data
         */
export function splitYearData (yearLine) {
    const dataSplit = yearLine ? yearLine.split("|") : [],
        tempArr = [];

    dataSplit.forEach(data => {
        const splitted = data.split(","),
            weeknumber = splitted[1],
            year = splitted[0],
            total = parseFloat(splitted[2]),
            r_in = splitted[3] ? parseFloat(splitted[3]) : null,
            r_out = splitted[4] ? parseFloat(splitted[4]) : null;

        tempArr.push({
            class: "dot",
            style: "circle",
            timestamp: moment().day("Monday").year(year).week(weeknumber).toDate(),
            year: year,
            total: total,
            tableData: thousandsSeparator(total),
            r_in: r_in,
            r_out: r_out
        });
    });

    return tempArr.sort((valueA, valueB) => valueA.timestamp - valueB.timestamp);
}


/**
 * prepareYearDataset creates an object for the yearDataset
 * @param {Array} data array of objects from yearLineData
 * @returns {Object} charts data
 */
export function getYearData (data) {
    const useData = data && data[0],
        graphArray = useData ? getDataAttributes(data[0]) : "",
        newData = useData ? [] : "",
        legendArray = useData ? getLegendAttributes(data[0]) : "",
        year = useData ? data[0].year : "";

    if (useData) {
        data.forEach(val => {
            val.timestamp = moment(val.timestamp).format("w");
            newData.push(val);
        });
    }

    return {
        data: newData,
        xLabel: i18next.t("common:modules.tools.gfi.themes.continuousCountingBike.yearScheduleInYear", {year: year}),
        yLabel: {
            label: i18next.t("common:modules.tools.gfi.themes.continuousCountingBike.amountBikesPerWeek"),
            offset: 60
        },
        graphArray: graphArray,
        xAxisTicks: {
            unit: "Kw",
            values: createxAxisTickValues(data, 5)
        },
        legendArray: legendArray
    };
}
/**
 * Creates the data for the year chart.
 * @param {String} data contains the yearLine data of gfi content
 * @returns {Object} charts data
 */
export default function collectYearData (data) {
    return getYearData(splitYearData(data));
}
