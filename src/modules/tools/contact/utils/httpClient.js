import axios from "axios";

/**
 * Notes parameters recursively to meet the format expected by the php backend script.
 * @param {Array} entry First entry to start with
 * @param {string[]} keys keys to use to get up to current point
 * @param {String[]} entries entries produced by recursive function
 * @returns {Array} an array of parameters with constructed keys
 */
function recursiveParamWriter ([key, value], keys, entries) {
    if (typeof value === "object" || Array.isArray(value)) {
        Object.entries(value).forEach(([nextKey, nextValue]) => recursiveParamWriter(
            [nextKey, nextValue],
            keys.length
                ? [...keys, `[${nextKey}]`]
                : [key, `[${nextKey}]`],
            entries
        ));
        return entries;
    }

    entries.push([
        `${encodeURIComponent(keys.length
            ? `${keys.join("")}`
            : key
        )}=${encodeURIComponent(value)}`
    ]);

    return entries;
}

/**
 * Show the loader after the dispatch of an e-mail has been started.
 *
 * @fires Util#RadioTriggerUtilShowLoader
 * @return {void}
 */
function onSendStart () {
    Radio.trigger("Util", "showLoader");
}

/**
 * Hide the loader after the dispatch of an e-mail has been completed.
 * The loader is also hidden if an error occurred during the dispatch.
 *
 * @fires Util#RadioTriggerUtilHideLoader
 * @return {void}
 */
function onSendComplete () {
    Radio.trigger("Util", "hideLoader");
}

/**
 * Sends the given data to the mail service behind the given url.
 *
 * @param {String} url The url of the mail service.
 * @param {Object} data The data to be sent; includes the sender, the recipient, the message and the subject of the e-mail.
 * @param {Function} onSuccess Function call to trigger further dispatchments on success.
 * @param {Function} onError Function call to trigger further dispatchments on error.
 * @returns {void}
 */
function httpClient (url, data, onSuccess, onError) {
    onSendStart();

    const preparedData = Object.entries(data)
        .map(entry => recursiveParamWriter(entry, [], []))
        .flat(2)
        .join("&");

    axios.post(url, preparedData)
        .then(response => {
            if (response.status === 200 && response.data.success) {
                onSuccess();
            }
            else {
                console.error(`An error occurred sending an email. Server response: ${response.data.message}`);
                console.error(response);
                onError();
            }
        })
        .catch(err => {
            console.error("An error occurred sending an email.");
            console.error(err);
            onError();
        })
        .finally(onSendComplete);
}

export default httpClient;
