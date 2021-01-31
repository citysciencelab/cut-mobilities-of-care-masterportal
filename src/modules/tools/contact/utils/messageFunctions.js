/**
 * Sends the given data to the mail service behind the given url.
 *
 * @param {String} url The url of the mail service.
 * @param {Object} data The data to be sent; includes the sender, the recipient, the message and the subject of the e-mail.
 * @param {Function} onSuccess Function to call if the request was successful.
 * @param {Function} onError Function to call if an error occurred during the request.
 * @returns {void}
 */
function httpClient (url, data, onSuccess, onError) {
    /*
    // TOREMOVE: For tests of the functionality of the tool the following part can be uncommented - the dispatch of an email will only be simulated
    console.log("defaultHttpClient", url, data);
    setTimeout(() => {
        onSuccess({success: true, message: "ok"});
        onSendComplete();
    }, 1500);
    return;
    */
    $.ajax({
        url,
        data,
        async: true,
        type: "POST",
        cache: false,
        dataType: "json",
        context: this,
        success: response => onSuccess(response),
        error: error => onError(error),
        complete: () => onSendComplete()
    });
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

export {
    httpClient,
    onSendComplete
};
