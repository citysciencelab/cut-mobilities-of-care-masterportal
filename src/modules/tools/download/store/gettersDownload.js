import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateDownload";

const getters = {
    ...generateSimpleGetters(initialState)
};

export default getters;
