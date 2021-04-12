import Vue from "vue";
import Vuex from "vuex";

import Alerting from "../modules/alerting/store/indexAlerting";
import ConfirmAction from "../modules/confirmAction/store/indexConfirmAction";
import Footer from "../modules/footer/store/indexFooter";
import GraphicalSelect from "../share-components/graphicalSelect/store/indexGraphicalSelect";
import Language from "../modules/language/store/indexLanguage";
import Title from "../modules/title/store/indexTitle";
import Map from "../modules/map/store/indexMap";
import MapMarker from "../modules/mapMarker/store/indexMapMarker";
import Legend from "../modules/legend/store/indexLegend";

import getters from "./getters";
import mutations from "./mutations";
import state from "./state";
import actions from "./actions";

import controlsModule from "../modules/controls/indexControls";
import toolsModule from "../modules/tools/indexTools";

import isMobile from "../utils/isMobile";

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        ConfirmAction,
        Alerting,
        Footer,
        GraphicalSelect,
        Language,
        Legend,
        Map,
        MapMarker,
        Title,
        controls: {
            ...controlsModule
        },
        Tools: {
            ...toolsModule
        }
    },
    state,
    mutations,
    getters,
    actions
});

store.commit("setStore", store);

export default store;

/**
 * Debounce function
 * @param {Function} callback - The callback form debounce function.
 * @param {Number} wait - Wait before the callback function is called.
 * @returns {void}
 */
function debounce (callback, wait) {
    let timeout;

    return (...args) => {
        const that = this;

        clearTimeout(timeout);
        timeout = setTimeout(() => callback.apply(that, args), wait);
    };
}


// resize update
window.addEventListener("resize", debounce(() => {
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
