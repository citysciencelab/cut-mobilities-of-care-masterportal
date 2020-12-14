export default {
    /**
     * Sets the current projection and its name to state.
     * @returns {void}
     */
    newProjectionSelected ({commit, state, getters}) {
        const targetProjectionName = state.currentSelection,
            targetProjection = getters.getProjectionByName(targetProjectionName);

        commit("setCurrentProjectionName", targetProjectionName);
        commit("setCurrentProjection", targetProjection);
    }
};
