
import * as moment from "moment";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import {getDataAttributes, getLegendAttributes, createxAxisTickValues} from "./helper.js";

/**
         * Creates a json for the graphic module with the dayLine data.
         * @param  {String} dayLine contains the dayLine data of gfi content
         * @return {Array} array with prepared objects of the data
         */
export function splitDayData (dayLine) {
    const dataSplit = dayLine ? dayLine.split("|") : [],
        tempArr = [];

    dataSplit.forEach(data => {
        const splitted = data.split(","),
            day = splitted[0].split(".")[0],
            month = splitted[0].split(".")[1] - 1,
            year = splitted[0].split(".")[2],
            hours = splitted[1].split(":")[0],
            minutes = splitted[1].split(":")[1],
            seconds = splitted[1].split(":")[2],
            total = parseFloat(splitted[2]),
            r_in = splitted[3] ? parseFloat(splitted[3]) : null,
            r_out = splitted[4] ? parseFloat(splitted[4]) : null;

        tempArr.push({
            class: "dot",
            style: "circle",
            date: splitted[0],
            timestamp: new Date(year, month, day, hours, minutes, seconds, 0),
            total: total,
            tableData: thousandsSeparator(total),
            r_in: r_in,
            r_out: r_out
        });
    });
    return tempArr.sort((valueA, valueB) => valueA.timestamp - valueB.timestamp);
}
/**
         * Creates an object for  the dayDataset
         * @param {Array} data array of objects from dayLineData
         * @returns {Object} charts data
         */
export function getDayData (data) {
    const useData = data && data[0],
        date = useData ? moment(data[0].timestamp).format("DD.MM.YYYY") : "",
        graphArray = useData ? getDataAttributes(data[0]) : "",
        newData = useData ? data.map(val => {
            val.timestamp = moment(val.timestamp).format("HH:mm");
            return val;
        }) : "",
        legendArray = useData ? getLegendAttributes(data[0]) : "";

    return {
        data: newData,
        xLabel: i18next.t("common:modules.tools.gfi.themes.continuousCountingBike.dayScheduleAtDate", {date: date}),
        yLabel: {
            label: i18next.t("common:modules.tools.gfi.themes.continuousCountingBike.amountBikesPerHour"),
            offset: 60
        },
        graphArray: graphArray,
        xAxisTicks: {
            unit: "Uhr",
            values: createxAxisTickValues(data, 6)
        },
        legendArray: legendArray
    };
}

/**
 * Creates the data for the day chart.
 * @param {String} data contains the dayLine data of gfi content
 * @returns {Object} charts data
 */
export default function collectDayData (data) {
    return getDayData(splitDayData(data));
}
