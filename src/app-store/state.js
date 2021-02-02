import isMobile from "../utils/isMobile";
import getDpi from "../utils/getDpi";
import getQueryParams from "../utils/getQueryParams";
import isDevMode from "../utils/isDevMode";
import masterPortalVersionNumber from "../utils/masterPortalVersionNumber";

const state = {
    _store: null,
    configJson: null,
    configJs: null,
    mobile: isMobile(), // resize update in ./index.js
    dpi: getDpi(),
    queryParams: getQueryParams(),
    masterPortalVersionNumber,
    isDevMode,
    i18NextInitialized: false,
    idCounter: 1
};

export default state;
