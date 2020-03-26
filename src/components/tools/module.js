import Measure from "./Measure/Measure.vue";
import SupplyCoord from "./SupplyCoord/SupplyCoord.vue";

/**
 * tools-Module is required to be able to nest tools
 * in the store as ["tools", toolName].
 * Holds information about which tools are openend.
 * Needs additional info to close tools that are not to be kept open
 * if this becomes the actual implementation.
 */
export default {
    namespaced: true,
    state: {
        openedTools: new Set(),
        componentMap: {
            measure: Measure,
            coord: SupplyCoord
        }
    },
    mutations: {
        openTool (state, key) {
            state.openedTools = new Set([
                key,
                ...state.openedTools
            ]);
        },
        closeTool (state, key) {
            state.openedTools = new Set(
                [...state.openedTools].filter(s => s !== key)
            );
        },
        toggleTool (state, key) {
            if (state.openedTools.has(key)) {
                this.commit("tools/closeTool", key);
            }
            else {
                this.commit("tools/openTool", key);
            }
        },
        /**
         * Registers a new tool element.
         * Can be called e.g. by an addon, if Store is globally accessible.
         * @param {object} state current state
         * @param {string} name name of tool in config.json
         * @param {object} tool Vue Component
         * @param {boolean} [hiddenMobile=false] whether component is visible in mobile resolution
         * @returns {void}
         */
        registerModule (state, name, tool) {
            state.componentMap = {
                ...state.componentMap,
                [name]: tool
            };
        },
        /**
         * Removes a tool element.
         * @param {object} state current state
         * @param {string} name name of tool to remove from state
         * @returns {void}
         */
        unregisterModule (state, name) {
            const nextMap = {...state.componentMap};

            delete nextMap[name];

            state.componentMap = nextMap;
        }
    },
    getters: {
        componentMap: state => state.componentMap,
        openedTools: state => state.openedTools
    }
};
