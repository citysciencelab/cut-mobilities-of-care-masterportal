export default {
    /**
     * Sets the current coordinate System to state.
     * @param {String} value - currently selected coordinate System
     * @returns {void}
     */
    newCoordSystemSelected ({commit}, value) {
        commit("setCoordinateSystem", value);
    },
    /**
     * Sets the example messages according to the selected coordinate system.
     * @param {Array} coordinates from the validated coordinates
     * @returns {void}
     */
    setExample ({commit}) {
        commit("setExample");
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
