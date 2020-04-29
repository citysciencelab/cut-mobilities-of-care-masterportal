import Vue from "vue";
import Vuex from "vuex";

import Alerting from "../modules/alerting/store/indexAlerting";
import SupplyCoord from "../modules/tools/supplyCoord/store/indexSupplyCoord";
import ScaleLine from "../modules/scaleLine/store/indexScaleLine";
import Title from "../modules/title/store/indexTitle";
import Map from "../modules/map/store/indexMap";

import getters from "./getters";
import mutations from "./mutations";
import state from "./state";

import controlsModule from "../modules/controls/indexControls";

import isMobile from "../utils/isMobile";

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        Map,
        Alerting,
        Tools: {
            namespaced: true,
            modules: {
                SupplyCoord // hier die stores von weiteren Tools eintragen
            }
        },
        controls: {
            ...controlsModule
        },
        ScaleLine,
        Title: Title
    },
    state,
    mutations,
    getters
});

export default store;

// resize update
window.addEventListener("resize", _.debounce(function () {
    const nextIsMobile = isMobile();

    if (nextIsMobile !== store.state.mobile) {
        store.commit("setMobile", nextIsMobile);
    }
}, 250));

// TODO supposed to allow hot reloading vuex getters/mutations without reloading MP - doesn't work for some reason
// copied without thought from admintool, so maybe I'm missing a parameter somewhere
/* istanbul ignore next */
if (module.hot) {
    module.hot.accept([
        "./getters",
        "./mutations"
    ], () => {
        // see https://vuex.vuejs.org/guide/hot-reload.html - need to do disable rule here
        /* eslint-disable global-require */
        const newGetters = require("./getters").default,
            newMutations = require("./mutations").default;
        /* eslint-enable global-require */

        store.hotUpdate({
            getters: newGetters,
            mutations: newMutations
        });
    });
}
