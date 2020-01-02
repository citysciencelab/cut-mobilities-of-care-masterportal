import Vue from "vue";
import Vuex from "vuex";
import User from "./User";
import Alerting from "./Alerting";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        User: User,
        Alerting: Alerting
    },
    mutations: {
        /**
         * Adds the data from config.js to the vuex store.
         * For objects, the first level is traversed and the values are added to the store.
         * For all other values such as strings and arrays, the values are added directly to the store.
         * @param {onject} state - vuex store
         * @param {object} [Config={}] - data from config.js
         * @returns {void}
         */
        addConfigToStore (state, Config = {}) {
            Object.keys(Config).forEach(configModule => {
                const vuexModule = configModule.charAt(0).toUpperCase() + configModule.slice(1);

                if (state.hasOwnProperty(vuexModule)) {
                    if (typeof Config[configModule] === "object") {
                        Object.keys(Config[configModule]).forEach(value => {
                            if (state[vuexModule].hasOwnProperty(value)) {
                                state[vuexModule][value] = Config[configModule][value];
                            }
                        });
                    }
                    else {
                        state[vuexModule][configModule] = Config[configModule];
                    }
                }
            });
        }
    }
});
