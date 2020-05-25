export default {
    /**
     * Sets the parameter "active" to the given parameter for the tool with the given id.
     * Note: The toolId specified in the global state is not the same as tool.id.
     *
     * @param {Object} context context object
     * @param {Object} state state object; in this case rootState = state
     * @param {Function} commit store commit function
     * @param {Object} payload The given parameters
     * @param {String} payload.id The id of the Tool to be (de-)activated
     * @param {String} active Value for (de-)activation
     * @returns {void}
     */
    setToolActive ({state, commit, dispatch}, {id, active}) {
        Object.keys(state.Tools).forEach(toolId => {
            const tool = state.Tools[toolId];

            if (tool && tool.id === id) {
                // NOTE: Extra case for the SupplyCoord Tool as it is not refactored in this PR.
                if (id === "coord") {
                    commit("Tools/" + toolId + "/active", active);
                }
                else {
                    dispatch("Tools/" + toolId + "/setActive", active);
                }
            }
        });
    },
    /**
     * Recursively sets the initial values for each tool from the config.json
     * !!!!!>>>> NOT USED -> Tool configs are fetched based on paths specified inside the individual tool store modules <<<<!!!!!
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
