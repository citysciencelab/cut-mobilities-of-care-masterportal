import ToolsState from "./stateTools";
import {generateSimpleGetters} from "../../app-store/utils/generators";

const getters = {
    ...generateSimpleGetters(ToolsState),

    /**
     * Gets the names of the tools with the parameter active = true.
     * @param {object} state state of the tools
     * @returns {object[]} The tools active tools.
     */
    getActiveToolNames: state => {
        return Object.keys(state).filter(tool => state[tool]?.active === true);
    },

    /**
     * Gets the names of all configured tools.
     * @param {object} state state of the tools.
     * @returns {string[]} All names of configured tools
     */
    getConfiguredToolNames: state => {
        return state.configuredTools.map(tool => tool.component.name);
    }
};

export default getters;
