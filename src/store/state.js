import isMobile from "./utils/isMobile";
import getDpi from "./utils/getDpi";
import isDevMode from "../utils/isDevMode";

const state = {
    configJson: null,
    mobile: isMobile(), // resize update in ./index.js
    dpi: getDpi(),
    isDevMode
};

export default state;
