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
    /**
     * Removes the marker from selected position.
     * @returns {void}
     */
    removeMarker: function ({dispatch}) {
        dispatch("MapMarker/removePointMarker", null, {root: true});
    },
    /**
     * Removes the marker from selected position.
     * @param {Number} zoomLevel - Zoomlevel to zoom to
     * @returns {void}
     */
    setZoom: function ({dispatch}, zoomLevel) {
        dispatch("Map/setZoomLevel", zoomLevel, {root: true});
    },
    /**
     * Takes the selected coordinates and centers the map to the new position.
     * @param {Array} coordinates - coordinates for new center position
     * @returns {void}
     */
    setCenter: function ({commit}, coordinates) {
        // coordinates come as string and have to be changed to numbers for setCenter from mutations to work.
        const newCoords = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];

        commit("Map/setCenter", newCoords, {root: true});
    }
};
