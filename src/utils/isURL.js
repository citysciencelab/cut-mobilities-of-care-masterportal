/**
 * @returns {boolean} true if screen is considered mobile device
 * @param {string} str incoming string to test against regex
 */
function isURL (str) {
    if ((/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/i).test(str) || new RegExp(/[^/]+(?:\.html)$/i).test(str)) {
        return true;
    }
    return false;
}

export default isURL;
