import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import OrientationState from "./stateOrientation";

const getters = {
    ...generateSimpleGetters(OrientationState)
};

export default getters;
