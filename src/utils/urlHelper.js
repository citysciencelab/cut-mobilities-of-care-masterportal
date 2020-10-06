/**
 * Tests if the given Parameter is an URL.
 * @param {String} str Incoming string to test against RegExp.
 * @returns {Boolean}  true if incoming string matches RegExp for website links or html files.
 */
export function isUrl (str) {
    return (/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/i).test(str) || (/[^/]+(?:\.html)$/i).test(str);
}

/**
 * checks if the string is a link
 * for the MP a link starts with "http://", "https://", "ftp://", "sftp://", "file://" or "//" (hint: "//" is a wildcard set to use the same protocol as the parent document)
 * @param {String} value the string to check
 * @returns {Boolean}  true if the input is recognized as link, false otherwise
 */
export function isWebLink (value) {
    const regExp = new RegExp(/^(https?:\/\/|s?ftp:\/\/|file:\/\/|\/\/)/i);

    return regExp.test(value);
}

export default {isUrl, isWebLink};
