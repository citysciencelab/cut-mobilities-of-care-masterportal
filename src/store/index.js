import Vue from "vue";
import Vuex from "vuex";
import User from "./User";
import Alert from "./Alert";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        User: User,
        Alert: Alert
    }
});
