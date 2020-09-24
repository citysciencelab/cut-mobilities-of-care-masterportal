
/**
 * checks if the given string is a phone number with a leading country dial-in code (e.g. +49 for germany)
 * @see dial-in-codes https://en.wikipedia.org/wiki/List_of_country_calling_codes
 * @example +49 40-123 456
 * @param {String} phonenumber the phone number to check
 * @returns {Boolean}  true if this is a phone number with a country dial-in code, false if not
 */
export function isPhoneNumber (phonenumber) {
    const regExp = new RegExp(/^\+[0-9]{2,4}[^a-zA-Z]*$/);

    return regExp.test(phonenumber);
}

/**
 * checks if the given string is a phone number in general
 * @example 040/123 456 | +4940 123-456 | 12.34.55
 * @param {String} phonenumber the phone number to check
 * @returns {Boolean}  true if this is a phone number, false if not
 */
export function isPhoneNumberBasic (phonenumber) {
    const regExp = new RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/g);

    return regExp.test(phonenumber);
}

/**
 * returns a phone number to be used in href attributes
 * @param {String} phonenumber a phone number, make sure to check with "isPhoneNumber" first before using this function
 * @param {Boolean} [prefix="tel:"] prefixes the phone number with the given string (e.g. "skype:", "tel:")
 * @returns {String}  the phone number to use in href attributes
 */
export function getPhoneNumberAsWebLink (phonenumber, prefix = "tel:") {
    let result = String(phonenumber);

    // remove the following signs
    [" ", "-", "(", ")", ".", "/"].forEach(sign => {
        result = result.split(sign).join("");
    });

    return prefix + result;
}

export default {isPhoneNumber, getPhoneNumberAsWebLink, isPhoneNumberBasic};
