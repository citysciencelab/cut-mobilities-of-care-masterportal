import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import gsState from "./stateGraphicalSelect";

const getters = {
    ...generateSimpleGetters(gsState)
};

export default getters;
