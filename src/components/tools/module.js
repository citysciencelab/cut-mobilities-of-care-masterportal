/**
 * tools-Module is required to be able to nest tools
 * in the store as ["tools", toolName].
 * Holds information about which tools are openend.
 * TODO needs additional info to close tools that are
 * not to be kept open.
 */
export default {
    namespaced: true,
    state: {
        openedTools: new Set()
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
        }
    },
    getters: {
        openedTools: state => state.openedTools
    }
};
