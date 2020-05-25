import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateDraw";

const getters = {
    ...generateSimpleGetters(initialState)
};

export default getters;
