import {generateSimpleGetters} from "../../../app-store/utils/generators";
import footerState from "./stateFooter";

const getters = {
    ...generateSimpleGetters(footerState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
