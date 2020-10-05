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

/**
 * Validate an email address.
 * @param {string} value The eMail address to validate.
 * @see {@link https://www.ietf.org/rfc/rfc5322.txt} For Internet Message Format
 * @see {@link https://emailregex.com/} For this regex
 * @returns {boolean} true if the input is an email address
 */
export function isEmailAddress (value) {
    const regExp = new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i);

    return regExp.test(value);
}

export default {isUrl, isWebLink, isEmailAddress};
