import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateStyleVT";

const getters = {
    ...generateSimpleGetters(initialState)
};

export default getters;
