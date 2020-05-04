export default {
    /**
     * Recursively sets the initial values for each tool from the config.json
     * @param {*} context the vuex store
     * @param {*} [module=context.getters.portalConfig?.menu] the nested object used for recursion
     * @returns {void}
     */
    setToolsConfig (context, module = context.getters.portalConfig?.menu) {
        for (const key in module) {
            if (module[key].children) {
                context.dispatch("setToolsConfig", module[key].children);
            }
            context.commit("setToolConfig", module[key]);
        }
    }
};
