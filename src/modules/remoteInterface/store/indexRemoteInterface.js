import state from "./stateRemoteInterface";
import getters from "./gettersRemoteInterface";
import actions from "./actionsRemoteInterface";

export default {
    namespaced: true,
    state,
    actions,
    getters
};
