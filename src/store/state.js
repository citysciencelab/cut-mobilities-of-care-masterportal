import isMobile from "../utils/isMobile";
import getDpi from "../utils/getDpi";
import isDevMode from "../utils/isDevMode";
import masterPortalVersionNumber from "../utils/masterPortalVersionNumber";

const state = {
    configJson: null,
    configJs: null,
    mobile: isMobile(), // resize update in ./index.js
    dpi: getDpi(),
    masterPortalVersionNumber,
    isDevMode
};

export default state;
