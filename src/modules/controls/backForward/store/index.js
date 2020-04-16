import getters from "./getters";
import mutations from "./mutations";

export default {
    namespaced: true,
    state: {
        position: null,
        memory: []
    },
    mutations,
    getters
};
