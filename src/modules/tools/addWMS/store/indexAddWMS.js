import getters from "./gettersAddWMS";
import mutations from "./mutationsAddWMS";
import state from "./stateAddWMS";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
