import {generateSimpleMutations} from "../../../../global-store/utils/generators";
import state from "./stateDraw";

const mutations = {
    ...generateSimpleMutations(state)
    // All additional setters will override already existing ones (set + Key, where key is a value of the state)
    // First argument would be the state object, second one the payload to be set / the argument given to the function when called
};

export default mutations;
