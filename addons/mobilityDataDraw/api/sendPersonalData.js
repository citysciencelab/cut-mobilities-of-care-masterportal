import config from "../config";

/**
 * Sends personal data to backend
 *
 * @param {Object[]} personalData the personal data to send to the api.
 * @returns {Promise} api response.
 */
async function sendPersonalData (personalData) {
    return fetch(config.API_BASE_URL + "/person", {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(personalData)
    }).then(async response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }

        const json = await response.json();

        return json;
    });
}

export default {sendPersonalData};
