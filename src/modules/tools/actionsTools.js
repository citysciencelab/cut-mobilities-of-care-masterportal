const actions = {
    /**
     * Sets the parameter "active" to the given parameter for the tool with the given id.
     * Note: The toolId specified in the global state is not the same as tool.id.
     *
     * @param {Object} context context object
     * @param {Object} state state object; in this case rootState = state
     * @param {Object} payload The given parameters
     * @param {String} payload.id The id of the Tool to be (de-)activated
     * @param {String} active Value for (de-)activation
     * @returns {void}
     */
    setToolActive ({state, dispatch}, {id, active}) {
        Object.keys(state).forEach(toolId => {
            const tool = state[toolId];

            if (tool && tool.id === id) {
                dispatch(toolId + "/setActive", active);
            }
        });
    },
    /**
     * Sets the translated name of the tool to the given parameter for the tool with the given id.
     *
     * @param {Object} state state object; in this case rootState = state
     * @param {Function} commit store commit function
     * @param {Object} payload The given parameters
     * @param {String} payload.id The id of the Tool
     * @param {String} payload.name The translated name of the Tool
     * @returns {void}
     */
    languageChanged ({state, commit}, {id, name}) {
        Object.keys(state).forEach(toolId => {
            const tool = state[toolId];

            if (tool && tool.id === id) {
                commit(toolId + "/setName", name);
            }
        });
    }
};

export default actions;
