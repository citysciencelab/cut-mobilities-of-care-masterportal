import packageJson from "../../package.json";

/**
 * @returns {boolean} true if screen is considered mobile device
 */
export function isMobile () {
    return window.innerWidth < 768;
}

/**
 * @returns {string} version string as defined in package.json
 */
export function getMasterPortalVersionNumber () {
    return packageJson.version;
}
