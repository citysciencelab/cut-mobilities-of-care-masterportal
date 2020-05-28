import GenericTool from "../../indexTools";
import composeModules from "../../../../app-store/utils/composeModules";
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import state from "./stateContact.js";

export default composeModules([GenericTool, {
    namespaced: true,
    state: state,
    getters: {
        ...generateSimpleGetters(state)
    },
    mutations: {
        ...generateSimpleMutations(state)
    },
    actions: {
        setActive ({commit}, value) {
            commit("setActive", value);
        }
    }
}]);
