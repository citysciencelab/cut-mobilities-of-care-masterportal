import {isMobile, getMasterPortalVersionNumber} from "./lib";

export default {
    masterPortalVersionNumber: getMasterPortalVersionNumber(),
    configJson: null,
    configJs: null,
    mobile: isMobile()
};
