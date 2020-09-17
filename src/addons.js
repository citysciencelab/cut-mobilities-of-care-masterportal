import store from "./app-store";
import Vue from "vue";

/* eslint-disable no-undef */
const allAddons = VUE_ADDONS || {};

/**
 * Adds all addons based on config.js and addonsConf.json to the Vue Instance and store
 * @param {string[]} config The array of addonKeys specified in config.js
 * @returns {void}
 */
export default async function (config) {
    Vue.prototype.$addons = []; // add .$addons in any case to make sure it's always defined
    if (config) {
        const addons = config.map(async addonKey => {
            if (typeof allAddons[addonKey] !== "undefined") {
                try {
                    const addonModule = await import(
                        /* webpackChunkName: "[request]" */
                        /* webpackInclude: /addons\/**\/index.js/ */
                        /* webpackExclude: /(node_modules)|(.+unittests.)+/ */
                        `../addons/${allAddons[addonKey]}`
                    ),
                        addon = addonModule.default;

                    // Add the locale
                    for (const localeKey in addon.locales) {
                        i18next.addResourceBundle(localeKey, "additional", addon.locales[localeKey], true);
                    }


                    // Add the component to vue instance globally
                    Vue.component(addon.component.name, addon.component);

                    // Add the addonKey to a global array on vue instance
                    Vue.prototype.$addons.push(addon.component.name);

                    // register the vuex store module
                    store.registerModule(["Tools", addon.component.name], addon.store);
                    store.dispatch("Tools/addTool", addon.component);
                }
                catch (e) {
                    console.warn(`The module ${addonKey} does not include a Vue-component and/or vuex-store-module. Please make sure the folder contains a ${addonKey}.vue and ${addonKey}.js file. Maybe it is an backbone-addon.`, e);
                }
            }
        });

        await Promise.all(addons);
    }
}

