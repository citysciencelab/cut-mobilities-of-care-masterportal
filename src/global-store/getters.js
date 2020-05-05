export default {
    masterPortalVersionNumber: state => state?.masterPortalVersionNumber,
    mobile: state => state.mobile,
    dpi: state => state.dpi,
    // configJS destructuring
    footerConfig: state => state?.configJs?.footer || null,
    // configJSON desctructuring
    controlsConfig: state => state?.configJson?.Portalconfig?.controls || null,

    /**
     * recursively read out the menu config for tools
     * Is used to determine whether a component should be loaded
     * Does not assign Config Attributes to the module
     * @param {Object} state the store state
     * @param {Object} getters the store getters
     * @param {Object} [module=state?.configJson?.Portalconfig?.menu] the nested object used for recursion
     * @returns {Object} all tools as key: value pairs
     */
    toolsConfig: (state, getters) => (module = state?.configJson?.Portalconfig?.menu) => {
        let tools = {};

        for (const key in module) {
            let tool;

            if (module[key].type === "tool") {
                tool = {[key]: module[key]};
            }
            else if (module[key].children) {
                tool = getters.toolsConfig(module[key].children);
            }
            tools = {
                ...tools,
                ...tool
            };
        }

        return tools;
    },

    /**
     * recursively returns one tool's config by ID
     * @param {Object} state the store state
     * @param {Object} getters the store getters
     * @param {Object} [module=state?.configJson?.Portalconfig?.menu] the nested object used for recursion
     * @returns {Object} the tool config object
     */
    toolConfig: (state, getters) => (id, module = state?.configJson?.Portalconfig?.menu) => {
        let tool = module?.[id];

        for (const key in module) {
            if (tool) {
                return tool;
            }
            else if (module[key].children) {
                tool = getters.toolConfig(id, module[key].children);
            }
        }
        return tool;
    }
};

