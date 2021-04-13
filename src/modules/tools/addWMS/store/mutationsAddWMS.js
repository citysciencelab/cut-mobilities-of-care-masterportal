import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import AddWMSState from "./stateAddWMS";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(AddWMSState)
};

export default mutations;
