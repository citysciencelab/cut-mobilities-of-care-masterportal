import state from "./stateKmlImport";
import actions from "./actionsKmlImport";
import {generateSimpleGetters, generateSimpleMutations} from "../../../../app-store/utils/generators";

export default {
    namespaced: true,
    state,
    getters: {...generateSimpleGetters(state)},
    mutations: {...generateSimpleMutations(state)},
    actions
};
