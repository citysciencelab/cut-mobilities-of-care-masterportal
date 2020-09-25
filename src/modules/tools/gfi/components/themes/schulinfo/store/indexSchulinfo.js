import getters from "./gettersSchulinfo";
import mutations from "./mutationsSchulinfo";
import actions from "./actionsSchulinfo";
import state from "./stateSchulinfo";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
