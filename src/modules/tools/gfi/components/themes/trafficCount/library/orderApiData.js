
/**
 * brings all dataObj (keys and datasets) in the given order
 * @param {Object[]} apiData an array of data as received by the api, e.g. [{bikes: {date: valueBike}, cars: {date: valueCar}}]
 * @param {String[]} orderOfKeys the order of keys, e.g. ["cars", "bikes"]
 * @returns {Object[]}  the sorted array of data, e.g. [{cars: {date: valueCar}, bikes: {date: valueBike}}]
 */
export default function orderApiData (apiData, orderOfKeys) {
    if (!Array.isArray(apiData) || !Array.isArray(orderOfKeys)) {
        return [];
    }

    const result = [];

    apiData.forEach(dataObj => {
        result.push({});
        orderOfKeys.forEach(key => {
            if (!dataObj.hasOwnProperty(key)) {
                return;
            }

            result[result.length - 1][key] = dataObj[key];
        });
    });

    return result;
}
