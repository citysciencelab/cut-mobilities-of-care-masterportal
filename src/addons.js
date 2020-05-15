import store from "./app-store";
import Vue from "vue";

/* eslint-disable no-undef */
const allAddons = ADDONS || {};

/**
 * Adds all addons based on config.js and addonsConf.json to the Vue Instance and store
 * @param {string[]} config The array of addonKeys specified in config.js
 * @returns {void}
 */
export default async function (config) {
    if (config) {
        Vue.prototype.$addons = [];

        const addons = config.map(async addonKey => {
            try {
                const entryPoint = allAddons[addonKey].replace(/\.js$/, ""),
                    storeModule = await import(/* webpackChunkName: "[request]" */ "../addons/" + entryPoint + ".js"),
                    component = await import(/* webpackChunkName: "[request]" */ "../addons/" + entryPoint + ".vue");

                // Add the component to vue instance globally
                Vue.component(component.default.name, component.default);

                // Add the addonKey to a global array on vue instance
                Vue.prototype.$addons.push(component.default.name);

                // register the vuex store module
                store.registerModule(["Tools", component.default.name], storeModule.default);
            }
            catch (e) {
                console.warn(`The module ${addonKey} does not include a Vue-component and/or vuex-store-module. Please make sure the folder contains a ${addonKey}.vue and ${addonKey}.js file.`);
            }
        });

        await Promise.all(addons);
    }
}

