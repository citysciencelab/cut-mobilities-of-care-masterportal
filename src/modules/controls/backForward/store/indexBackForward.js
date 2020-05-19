import getters from "./gettersBackForward";
import mutations from "./mutationsBackForward";

export default {
    namespaced: true,
    state: {
        position: null,
        memory: []
    },
    mutations,
    getters
};
