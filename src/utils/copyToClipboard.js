import store from "../app-store";

/**
 * Copies the the content of the given element to the clipboard if the browser accepts the command.
 * Solution for the weird behaviour on iOS from:
 * https://stackoverflow.com/questions/34045777/copy-to-clipboard-using-javascript-in-ios
 *
 * @param {Element} el element to copy,
 * @returns {void}
 */
function copyToClipboard (el) {
    const oldReadOnly = el.readOnly,
        oldContentEditable = el.contentEditable,
        range = document.createRange(),
        selection = window.getSelection();

    el.readOnly = false;
    el.contentEditable = true;

    range.selectNodeContents(el);
    selection.removeAllRanges();
    if (!Radio.request("Util", "isInternetExplorer")) {
        selection.addRange(range);
    }
    // Seems to be required for mobile devices
    el.setSelectionRange(0, 999999);

    el.readOnly = oldReadOnly;
    el.contentEditable = oldContentEditable;

    try {
        document.execCommand("copy");
        store.dispatch("Alerting/addSingleAlert", {
            content: i18next.t("common:modules.util.copyToClipboard.contentSaved"),
            kategorie: "alert-info",
            position: "top-center",
            fadeOut: 5000
        }, {root: true});
    }
    catch (err) {
        store.dispatch("Alerting/addSingleAlert", {
            content: i18next.t("common:modules.util.copyToClipboard.contentNotSaved"),
            kategorie: "alert-info",
            position: "top-center"
        }, {root: true});
        console.error(`CopyToClipboard: ${err}`);
    }
}

export default copyToClipboard;
