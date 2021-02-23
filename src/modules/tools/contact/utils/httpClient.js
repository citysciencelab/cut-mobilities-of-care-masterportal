import axios from "axios";
import convertJsonToPost from "../../../../utils/convertJsonToPost.js";

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

    axios.post(url, convertJsonToPost(data))
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
