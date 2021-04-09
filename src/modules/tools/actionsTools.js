import {fetchFirstModuleConfig} from "../../utils/fetchFirstModuleConfig";
import getComponent from "../../utils/getComponent";

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
            if (toolId !== "Gfi") {
                commit("Gfi/setActive", !state[toolId].deactivateGFI);
            }
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
     * @param {Object} context the context Vue instance
     * @param {Object} configuredTool the tool component
     * @returns {Boolean} false, if config does not contain the tool
     */
    pushAttributesToStoreElements: (context, configuredTool) => {
        return fetchFirstModuleConfig(context, [configuredTool.configPath], configuredTool.component.name);
    },

    /**
     * Adds a tool dynamically to componentMap.
     * @param {Object} state state object; in this case rootState = state
     * @param {Object} tool tool to be added dynamically
     * @returns {void}
     */
    addTool: ({state, commit}, tool) => {
        const toolName = tool.name !== undefined ? tool.name.charAt(0).toLowerCase() + tool.name.slice(1) : tool.name;

        commit("setComponentMap", Object.assign(state.componentMap, {[toolName]: tool}));
    },

    /**
     * Control the activation of the tools.
     * Deactivate all activated tools and then activate the given tool if it is available.
     * @param {String} activeToolName - Name of the tool to be activated.
     * @returns {void}
     */
    controlActivationOfTools: ({getters, commit, dispatch}, activeToolName) => {
        getters.getActiveToolNames.forEach(tool => commit(tool + "/setActive", false));

        if (getters.getConfiguredToolNames.includes(activeToolName)) {
            commit(activeToolName + "/setActive", true);
            dispatch("activateToolInModelList", activeToolName);
        }
    },

    /**
     * Checks if a tool should be open initially controlled by the url param "isinitopen".
     * @param {String} toolName - Name from the toolComponent
     * @returns {void}
     */
    activateByUrlParam: ({rootState, dispatch}, toolName) => {
        if (rootState.queryParams instanceof Object && toolName?.toLowerCase() === rootState?.queryParams?.isinitopen?.toLowerCase()) {
            dispatch("controlActivationOfTools", toolName);
        }
    },

    /**
    * Sets the active property of the state form tool which has the parameter isActive: true
    * Also starts processes if the tool is activated (active === true).
    * @returns {void}
    */
    setToolActiveByConfig ({getters, dispatch}) {
        const activeTools = getters.getActiveToolNames;

        dispatch("controlActivationOfTools", activeTools[0]);

        if (activeTools.length > 1) {
            console.error("More than one tool has the configuration parameter 'active': true."
                + " Only one entry is considered. Therefore the tool(s): "
                + activeTools.slice(1)
                + " is/are not activated!");
        }
    },

    /**
     * Activates a tool in the ModelList.
     * @param {Object} state state object; in this case rootState = state
     * @param {String} activeTool The tool to activate.
     * @returns {void}
     */
    activateToolInModelList ({state}, activeTool) {
        const model = getComponent(state[activeTool]?.id);

        if (model) {
            model.set("isActive", true);
        }
    },

    /**
     * Adds the name and glyphicon of a tool to the ModelList, because they are used by the menu.
     * @param {Object} state state object; in this case rootState = state
     * @param {String} activeTool The tool to set name.
     * @returns {void}
     */
    addToolNameAndGlyphiconToModelList ({state}, activeTool) {
        const activeToolState = state[activeTool],
            model = getComponent(activeToolState?.id);

        if (model) {
            model.set("name", i18next.t(activeToolState?.name));
            model.set("glyphicon", activeToolState?.glyphicon);
        }
    }
};

export default actions;
