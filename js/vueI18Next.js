import VueI18Next from "@panter/vue-i18next";
import Vue from "vue";

const exportContainer = {
    instance: null
};

export default exportContainer;

/**
 * Initialization. Wrapped in a function to avoid calling it initially
 * in a mochapack run.
 * @returns {object} VueI18Next instance
 */
export function initiateVueI18Next () {
    Vue.use(VueI18Next);
    exportContainer.instance = new VueI18Next(i18next, {namespaces: ["additional", "common"]});
    return exportContainer.instance;
}
