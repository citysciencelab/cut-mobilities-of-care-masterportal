import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import state from "./stateDraw";

const getters = {
    ...generateSimpleGetters(state)
    // All additional getters will override already existing ones
    // First parameter of a methods is the state object, second one the preexisting getters object
};

export default getters;
