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
    Vue.prototype.$addons = []; // add .$addons in any case to make sure it's always defined
    if (config) {
        const addons = config.map(async addonKey => {
            try {
                const entryPoint = allAddons[addonKey].replace(/\.js$/, ""),
                    entryPointParts = entryPoint.split("/"),
                    storeModule = await import(/* webpackChunkName: "[request]" */ "../addons/" + entryPointParts[0] + "/store/" + entryPointParts[1] + ".js"),
                    component = await import(/* webpackChunkName: "[request]" */ "../addons/" + entryPointParts[0] + "/components/" + entryPointParts[1] + ".vue");

                // Add the addonKey to a global array on vue instance
                Vue.prototype.$addons.push(component.default.name);

                // register the vuex store module
                store.registerModule(["Tools", component.default.name], storeModule.default);
                store.dispatch("Tools/addTool", component);
            }
            catch (e) {
                console.warn(`The module ${addonKey} does not include a Vue-component and/or vuex-store-module. Please make sure the folder contains a ${addonKey}.vue and ${addonKey}.js file. Maybe it is an backbone-addon.`);
            }
        });

        await Promise.all(addons);
    }
}

