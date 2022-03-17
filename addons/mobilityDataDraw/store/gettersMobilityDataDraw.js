import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import mobilityDataDrawState from "./stateMobilityDataDraw";

const getters = {
    ...generateSimpleGetters(mobilityDataDrawState)
};

export default getters;
