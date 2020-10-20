
/**
         * Returns an array of key values.
         * @param  {Object} inspectData contains the first row of the dataset
         * @return {String[]} showData array with key values
         */
export function getDataAttributes (inspectData) {
    const showData = ["total"];

    if (inspectData && inspectData.r_in !== null) {
        showData.push("r_in");
    }
    if (inspectData && inspectData.r_out !== null) {
        showData.push("r_out");
    }

    return showData;
}

/**
         * createxAxisTickValues returns an array of the tick values for the graph module
         * @param  {Array} data array of objects from dayLineData
         * @param  {Integer} xThinning number for the distance between the ticks
         * @return {Array} tickValuesArray array of the tick values
         */
export function createxAxisTickValues (data = [], xThinning) {
    let tickValuesArray = [],
        startsWith = 0,
        xThinningVal = xThinning;

    data.forEach(ele => {
        tickValuesArray.push(ele.timestamp);
    });

    tickValuesArray = tickValuesArray.filter((d, i) => {
        let val;

        if (d === "1") {
            startsWith = 1;
            val = i;
        }
        else if (i + 1 === tickValuesArray.length) {
            val = 0;
        }
        else if (tickValuesArray.length < 10) {
            val = 0;
        }
        else if (i === (xThinningVal - startsWith)) {
            val = 0;
            xThinningVal = xThinningVal + xThinning;
        }
        else {
            val = i % xThinningVal;
        }
        return !val;
    });

    return tickValuesArray;
}
/**
         * Returns an array for the graphic legend
         * @param  {Object} inspectData contains the first row of the dataset
         * @return {Array} legendData contains an array of objecs for the graphic legend
         */
export function getLegendAttributes (inspectData) {
    const legendData = [{
        class: "dot",
        text: i18next.t("common:modules.tools.gfi.themes.continuousCountingBike.bikesSummedUp"),
        style: "circle"
    }];

    if (inspectData && inspectData.r_in !== null) {
        legendData.push({
            key: "r_in",
            value: i18next.t("common:modules.tools.gfi.themes.continuousCountingBike.bikesIntoTown")
        });
    }

    if (inspectData && inspectData.r_out !== null) {
        legendData.push({
            key: "r_out",
            value: i18next.t("common:modules.tools.gfi.themes.continuousCountingBike.bikesOutOfTown")
        });
    }

    return legendData;
}

export default {getDataAttributes, createxAxisTickValues, getLegendAttributes};


