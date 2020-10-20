
import * as moment from "moment";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import {getDataAttributes, getLegendAttributes, createxAxisTickValues} from "./helper.js";

/**
         * splitLastSevenDaysDataset creates a json for the graphic module with the lastSevenDaysLine data.
         * @param  {String} lastSevenDaysLine contains the lastSevenDays data of gfi content
         * @fires Util#event:RadioRequestUtilPunctuate
         * @return {Array} tempArr array with prepared objects of the data
         */
export function splitWeekData (lastSevenDaysLine) {
    const dataSplit = lastSevenDaysLine ? lastSevenDaysLine.split("|") : [],
        tempArr = [];

    dataSplit.forEach(data => {
        const splitted = data.split(","),
            // weeknumber = splitted[0],
            day = splitted[1].split(".")[0],
            month = splitted[1].split(".")[1] - 1,
            year = splitted[1].split(".")[2],
            total = parseFloat(splitted[2]),
            r_in = splitted[3] ? parseFloat(splitted[3]) : null,
            r_out = splitted[4] ? parseFloat(splitted[4]) : null;

        tempArr.push({
            class: "dot",
            style: "circle",
            timestamp: new Date(year, month, day, 0, 0, 0, 0),
            total: total,
            tableData: thousandsSeparator(total),
            r_in: r_in,
            r_out: r_out
        });
    });

    return tempArr.sort((valueA, valueB) => valueA.timestamp - valueB.timestamp);
}
/**
         * prepareLastSevenDaysDataset creates an object for the lastSevenDaysDataset
         * @param {Array} data array of objects from lastSevenDaysLineData
         * @returns {Object} charts data
         */
export function getWeekData (data) {
    const useData = data && data[0],
        startDate = useData ? moment(data[0].timestamp).format("DD.MM.YYYY") : "",
        endDate = useData ? moment(data.slice(-1).timestamp).format("DD.MM.YYYY") : "",
        graphArray = useData ? getDataAttributes(data[0]) : "",
        newData = useData ? data.map(val => {
            val.timestamp = moment(val.timestamp).format("DD.MM.YYYY");
            return val;
        }) : "",
        legendArray = useData ? getLegendAttributes(data[0]) : "";

    return {
        data: newData,
        xLabel: i18next.t("common:modules.tools.gfi.themes.continuousCountingBike.weekScheduleFromToDate", {startDate: startDate, endDate: endDate}),
        yLabel: {
            label: i18next.t("common:modules.tools.gfi.themes.continuousCountingBike.amountBikesPerDay"),
            offset: 60
        },
        graphArray: graphArray,
        xAxisTicks: {
            values: createxAxisTickValues(data, 1)
        },
        legendArray: legendArray
    };
}

/**
 * Creates the data for the week chart.
 * @param {String} data contains the weekLine data of gfi content
 * @returns {Object} charts data
 */
export default function collectWeekData (data) {
    return getWeekData(splitWeekData(data));
}
