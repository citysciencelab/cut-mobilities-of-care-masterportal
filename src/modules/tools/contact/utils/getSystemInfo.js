/**
 * @typedef {ContactSystemInfo}
 * @property {String} portalTitle Title of either portal or document
 * @property {String} referrer referrer link active during contact tool use
 * @property {String} platform user platform
 * @property {Boolean} cookieEnabled whether user has cookies active
 * @property {String} userAgent information on user's browser
 */

/**
 * Retrieves information about the system of the user.
 *
 * @param {string} title will be used if given; else, document.title will be used
 * @returns {ContactSystemInfo} information object
 */
function getSystemInfo (title) {
    const {platform, cookieEnabled, userAgent} = navigator;

    return {
        portalTitle: title || document.title,
        referrer: window.location.href,
        platform,
        cookieEnabled,
        userAgent
    };
}

export default getSystemInfo;
