/**
 * Tests if the given Parameter is an URL.
 * @param {string} str Incoming string to test against RegExp.
 * @returns {boolean} True if incoming string matches RegExp for website links or html files.
 */
function isURL (str) {
    return (/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/i).test(str) || (/[^/]+(?:\.html)$/i).test(str);
}

export default isURL;
