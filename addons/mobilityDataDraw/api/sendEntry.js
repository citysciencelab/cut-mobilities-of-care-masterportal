import config from "../config";
import GeoJSON from "ol/format/GeoJSON";

/**
 * Sends mobility dataset to backend
 *
 * @param {Object} data the data to send to the api.
 * @param {Number} data.personId the id of the person to send to the api.
 * @param {String} data.description the description to send to the api.
 * @param {String} data.weekdays the weekdays for the entry to send to the api.
 * @param {Object[]} data.mobilityFeatures the mobility data to send to the api.
 * @param {Object[]} data.annotationFeatures the annotations data to send to the api.
 * @returns {Promise} api response.
 */
async function sendEntry (data) {
    if (!data.personId) {
        throw Error("`personId` is missing");
    }
    if (!data.mobilityFeatures.length && !data.annotationFeatures.length) {
        throw Error("`mobilityFeatures` oder `annotationFeatures` are missing");
    }

    const writer = new GeoJSON();

    data.mobilityFeatures = data.mobilityFeatures.map(
        ({feature, ...mobilityFeature}) => {
            const featureGeometry = writer.writeFeatureObject(feature).geometry;

            return {
                ...mobilityFeature,
                featureGeometry
            };
        }
    );
    data.annotationFeatures = data.annotationFeatures.map(
        ({feature, ...annotationFeature}) => {
            const featureGeometry = writer.writeFeatureObject(feature).geometry;

            return {
                ...annotationFeature,
                featureGeometry
            };
        }
    );

    return fetch(config.API_BASE_URL + "/entry", {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data)
    }).then(async response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }

        const json = await response.json();

        return json;
    });
}

export default {sendEntry};
