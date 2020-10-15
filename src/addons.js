import store from "./app-store";
import Vue from "vue";

/* eslint-disable no-undef */
const allAddons = VUE_ADDONS || {};

/**
 * Adds all addons based on config.js and addonsConf.json to the Vue Instance and store
 * @param {String[]} config The array of addonKeys specified in config.js
 * @returns {Void}  -
 */
export default async function (config) {
    Vue.prototype.$toolAddons = []; // add .$toolAddons to store tools in
    Vue.prototype.$themeAddons = []; // add .$themeAddons to store themes in
    if (config) {
        const addons = config.map(async addonKey => {
            try {
                const addonConf = allAddons[addonKey];

                if (addonConf && addonConf.hasOwnProperty("type")) {
                    if (addonConf.type === "tool") {
                        await loadToolAddons(addonKey);
                    }
                    else if (addonConf.type === "gfiTheme") {
                        await loadThemes(addonKey);
                    }
                }
            }
            catch (e) {
                console.warn(e);
                console.warn(`The module ${addonKey} does not include a Vue-component and/or vuex-store-module. Please make sure the folder contains a ${addonKey}.vue and ${addonKey}.js file. Maybe it is an backbone-addon.`, e);
            }
        });

        await Promise.all(addons);
    }
}

/**
 * Loads the themes and creates the Vue component and adds it to Vue instance globally
 * @param {String} addonKey specified in config.js
 * @returns {Void} -
 */
async function loadThemes (addonKey) {
    const addonModule = await import(
        /* webpackChunkName: "[request]" */
        /* webpackInclude: /addons[\\\/].*[\\\/]index.js$/ */
        /* webpackExclude: /(node_modules)|(.+unittests.)+/ */
        `../addons/${allAddons[addonKey].entry}`
    ),
        addon = addonModule.default;

    Vue.component(addon.component.name, addon.component);
    // Add the componentName to a global array on vue instance called $themeAddons
    Vue.prototype.$themeAddons.push(addon.component.name);
}
/**
 * Loads the tool addon, creates the Vue component and adds it to Vue instance globally.
 * Registeres the store at module "Tools" and adds the local-files.
 * @param {String} addonKey specified in config.js
 * @returns {Void} -
 */
async function loadToolAddons (addonKey) {
    const addonModule = await import(
        /* webpackChunkName: "[request]" */
        /* webpackInclude: /addons[\\\/].*[\\\/]index.js$/ */
        /* webpackExclude: /(node_modules)|(.+unittests.)+/ */
        `../addons/${allAddons[addonKey].entry}`
    ),
        addon = addonModule.default;

    // Add the locale
    for (const localeKey in addon.locales) {
        i18next.addResourceBundle(localeKey, "additional", addon.locales[localeKey], true);
    }

    // Add the addonKey to a global array on vue instance
    Vue.prototype.$toolAddons.push(addon.component.name);

    // register the vuex store module
    store.registerModule(["Tools", addon.component.name], addon.store);
    store.dispatch("Tools/addTool", addon.component);
}

