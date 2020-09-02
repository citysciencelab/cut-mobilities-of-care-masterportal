import {fetchFirstModuleConfig} from "../../utils/fetchFirstModuleConfig";

const actions = {
    /**
     * Sets the parameter "active" to the given parameter for the tool with the given id.
     * Note: The toolId specified in the global state is not the same as tool.id.
     *
     * @param {Object} context context object
     * @param {Object} state state object; in this case rootState = state
     * @param {Function} commit store commit function
     * @param {Object} payload The given parameters
     * @param {String} payload.id The id of the Tool to be (de-)activated
     * @param {String} payload.active Value for (de-)activation
     * @returns {void}
     */
    setToolActive ({state, commit}, {id, active}) {
        const toolId = Object.keys(state).find(tool => state[tool]?.id?.toLowerCase() === id?.toLowerCase());

        if (toolId !== undefined) {
            commit(toolId + "/setActive", active);
        }
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
        const toolId = Object.keys(state).find(tool => state[tool]?.id?.toLowerCase() === id?.toLowerCase());

        if (toolId !== undefined) {
            commit(toolId + "/setName", name);
        }
    },

    /**
     * Sets the config-params for every configured tool into state from that tool.
     * @param {object} context the context Vue instance
     * @param {object} configuredTool the tool component
     * @returns {boolean} false, if config does not contain the tool
     */
    pushAttributesToStoreElements: (context, configuredTool) => {
        return fetchFirstModuleConfig(context, [configuredTool.configPath], configuredTool.component.name);
    },

    /**
     * Adds a tool dynamically to componentMap.
     * @param {Object} state state object; in this case rootState = state
     * @param {object} tool tool to be added dynamically
     * @returns {void}
     */
    addTool: ({state, commit}, tool) => {
        commit("setComponentMap", Object.assign(state.componentMap, {[tool.default.name]: tool.default}));
    },

    /**
     * Checks if a tool should be open initially controlled by the url param "isinitopen".
     * @param {string} toolName - Name from the toolComponent
     * @returns {void}
     */
    activateByUrlParam: ({rootState, state, commit, dispatch}, toolName) => {
        if (rootState.queryParams instanceof Object && toolName?.toLowerCase() === rootState?.queryParams?.isinitopen?.toLowerCase()) {
            const isActiveTools = Object.keys(state).filter(tool => state[tool]?.active === true);

            isActiveTools.forEach(tool => commit(tool + "/setActive", false));
            commit(toolName + "/setActive", true);
            dispatch("activateToolInModelList", toolName);
        }
    },

    /**
    * Sets the active property of the state form tool which has the parameter isActive: true
    * Also starts processes if the tool is be activated (active === true).
    * @param {Object} state state object; in this case rootState = state
    * @param {Function} commit store commit function
    * @returns {void}
    */
    setToolActiveByConfig ({state, commit, dispatch}) {
        const isActiveTools = Object.keys(state).filter(tool => state[tool]?.active === true);

        commit(isActiveTools[0] + "/setActive", true);
        dispatch("activateToolInModelList", isActiveTools[0]);

        if (isActiveTools.length > 1) {
            isActiveTools.shift();
            isActiveTools.forEach(tool => commit(tool + "/setActive", false));
            console.warn("More than one tool has the configuration parameter 'isActive': true. Only the first entry is considered. Therefore the tool: " + isActiveTools[0] + " is activated");
        }
    },

    /**
     * Activates an tool in the ModelList
     * @param {Object} state state object; in this case rootState = state
     * @param {string} activeTool The tool to activate.
     * @returns {void}
     */
    activateToolInModelList ({state}, activeTool) {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: state[activeTool]?.id});

        if (model) {
            model.set("isActive", true);
        }
    }
};

export default actions;
