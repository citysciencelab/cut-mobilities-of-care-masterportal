import isMobile from "./utils/isMobile";
import getDpi from "./utils/getDpi";

const state = {
    configJson: null,
    mobile: isMobile(), // resize update in ./index.js
    dpi: getDpi()
};

export default state;
