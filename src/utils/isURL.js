/**
 * @returns {boolean} true if incoming string matches RegExp for website links or html files
 * @param {string} str incoming string to test against regex
 */
function isURL (str) {
    return (/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/i).test(str) || (/[^/]+(?:\.html)$/i).test(str);
}

export default isURL;
