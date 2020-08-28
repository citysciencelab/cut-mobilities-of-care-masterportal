import state from "./stateFileImport";
import actions from "./actionsFileImport";
import {generateSimpleGetters, generateSimpleMutations} from "../../../../app-store/utils/generators";

export default {
    namespaced: true,
    state,
    getters: {...generateSimpleGetters(state)},
    mutations: {...generateSimpleMutations(state)},
    actions
};
