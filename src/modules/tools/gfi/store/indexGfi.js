import state from "./stateGfi";
import getters from "./gettersGfi";
import mutations from "./mutationsGfi";
import Schulinfo from "../components/themes/schulinfo/store/indexSchulinfo";

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    modules: {
        Schulinfo
    }
};
