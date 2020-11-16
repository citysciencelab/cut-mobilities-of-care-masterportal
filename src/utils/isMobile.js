
/**
 * checks if the current window size indicates a mobile device
 * @returns {Boolean}  true if screen is considered mobile device
 */
function isMobile () {
    return window.innerWidth < 768;
}

export default isMobile;
