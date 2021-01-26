import actions from "./actionsScaleSwitcher";
import mutations from "./mutationsScaleSwitcher";
import getters from "./gettersScaleSwitcher";
import state from "./stateScaleSwitcher";


export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
