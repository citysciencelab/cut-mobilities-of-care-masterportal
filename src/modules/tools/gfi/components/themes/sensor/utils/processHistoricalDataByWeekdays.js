import * as moment from "moment";

/**
 * Creates a zero time observations for a given observation.
 * The value will be set to the value of given observation.
 * @param {Object} observation Observation for which a 0 o'clock observation should be created.
 * @returns {Object} The Observations with startDate.
 */
export function createZeroTimeObservation (observation) {
    const zeroTime = moment(moment(observation.phenomenonTime).format("YYYY-MM-DD")).format("YYYY-MM-DDTHH:mm:ss"),
        zeroResult = observation.result;

    return {phenomenonTime: zeroTime, result: zeroResult};
}

/**
 * Add an index to the historicalData.
 * @param {Object[]} historicalData Data from feature.
 * @returns {Object[]} The data with index.
 */
export function addIndex (historicalData) {
    const data = historicalData === undefined ? [] : historicalData;

    data.forEach(loadingPointData => {
        const loading = loadingPointData.hasOwnProperty("Observations") ? loadingPointData.Observations : [];

        loading.forEach((obs, index) => {
            obs.index = index;
        });
    });

    return data;
}

/**
 * Process the historical data.
 * Divides the day into 7 days of the week and generate an observation for every day at 0 o'clock.
 * @param {Object} historicalObservations The historical observations from SensorThings-API
 * @param {String} startDate Until this date the data will be used.
 * @returns {Object} The processed data.
 */
export function processHistoricalDataByWeekdays (historicalObservations, startDate) {
    const today = moment().format("YYYY-MM-DD"),
        weekArray = [
            [], [], [], [], [], [], []
        ],
        historicalDataWithIndex = addIndex(historicalObservations);

    historicalDataWithIndex.forEach(historicalData => {
        const observations = historicalData.hasOwnProperty("Observations") ? historicalData.Observations : [],
            lastObservation = observations[observations.length - 1];
        let booleanLoop = true,
            actualDay = today,
            arrayIndex = 0;

        if (observations.length !== 0) {
            weekArray[arrayIndex].push([]);

            // add start time with 0 o'clock if no observations are available before the start date.
            if (moment(lastObservation?.phenomenonTime).format("YYYY-MM-DD") > moment(startDate).format("YYYY-MM-DD")) {
                observations.push(createZeroTimeObservation(lastObservation));
            }
        }

        observations.forEach(data => {
            const phenomenonDay = moment(data.phenomenonTime).format("YYYY-MM-DD");
            let zeroTime,
                zeroResult,
                weekArrayIndexLength;

            // until data has been processed
            while (booleanLoop) {
                weekArrayIndexLength = weekArray[arrayIndex].length - 1;

                // when the last date is reached, the loop is no longer needed
                if (moment(actualDay) < moment(startDate)) {
                    booleanLoop = false;
                    weekArray[arrayIndex].pop();
                    break;
                }
                else if (phenomenonDay === actualDay) {
                    weekArray[arrayIndex][weekArrayIndexLength].push(data);
                    break;
                }
                // dd object with 0 o'clock and the status of the current day
                else {
                    zeroTime = moment(actualDay).format("YYYY-MM-DDTHH:mm:ss");
                    zeroResult = data.result;
                    weekArray[arrayIndex][weekArrayIndexLength].push({phenomenonTime: zeroTime, result: zeroResult});

                    // Then set current tag to previous tag and ArrayIndex to next array
                    actualDay = moment(actualDay).subtract(1, "days").format("YYYY-MM-DD");

                    if (arrayIndex >= 6) {
                        arrayIndex = 0;
                    }
                    else {
                        arrayIndex++;
                    }

                    weekArray[arrayIndex].push([]);
                }
            }
        });
    });

    return weekArray;
}

export default {createZeroTimeObservation, addIndex, processHistoricalDataByWeekdays};
