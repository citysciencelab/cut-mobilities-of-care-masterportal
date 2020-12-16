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
    },
    /**
     * Remembers the projection and shows mapmarker at the given position.
     * @param {Event} event - pointerdown-event, to get the position from
     * @returns {void}
     */
    setMarker: function ({dispatch}, event) {
        const position = event;

        dispatch("MapMarker/placingPointMarker", position, {root: true});
    },
    setCenter: function ({dispatch}, coordinates, zoomLevel) {
        console.log(coordinates);

        dispatch("MapView/setCenter", coordinates, zoomLevel, {root: true});
    }
};
