const mutations = {
    /**
     * Sets config.json.
     * @param {object} state store state
     * @param {object} config config.json
     * @returns {void}
     */
    setConfigJson (state, config) {
        state.configJson = config;
    },
    /**
     * Sets config.js.
     * @param {object} state store state
     * @param {object} config config.js
     * @returns {void}
     */
    setConfigJs (state, config) {
        state.configJs = config;
    },
    /**
     * Sets mobile flag.
     * @param {object} state store state
     * @param {boolean} mobile whether browser resolution indicates mobile device
     * @returns {void}
     */
    setMobile (state, mobile) {
        state.mobile = mobile;
    },
    setToolConfig (state, payload) {
        Object.keys(state.Tools).forEach(toolId => {
            const tool = state.Tools[toolId];

            if (tool && tool.id === payload.id) {
                if (payload.name) {
                    // special handling of attribute name, is a reserved keyword in vue -> use title
                    tool.title = payload.name;
                }
                Object.assign(tool, payload);
            }
        });
    },
    setToolActive (state, payload) {
        Object.keys(state.Tools).forEach(toolId => {
            const tool = state.Tools[toolId];

            if (tool && tool.id === payload.id) {
                tool.active = payload.active;
            }
        });
    }
};

export default mutations;
