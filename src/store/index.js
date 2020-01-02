import Vue from "vue";
import Vuex from "vuex";
import User from "./User";
import Alerting from "./Alerting";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        User: User,
        Alerting: Alerting
    }
});
