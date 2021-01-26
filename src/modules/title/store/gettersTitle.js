import titleState from "./stateTitle";
import {generateSimpleGetters} from "../../../app-store/utils/generators";

const getters = {
    ...generateSimpleGetters(titleState)
};

export default getters;
