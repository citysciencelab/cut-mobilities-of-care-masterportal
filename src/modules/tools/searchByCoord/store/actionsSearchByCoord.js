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
    },
    /**
     * Validates the user-input depending on the selected projection and sets the error messages.
     * If valid, the coordinates will be pushed in the selectedCoordinates array.
     * @param {Array} coords the coordinates the user entered
     * @returns {void}
     */
    validateInput ({state, commit}, coords) {
        const validETRS89 = /^[0-9]{6,7}[.,]{0,1}[0-9]{0,3}\s*$/,
            validWGS84 = /^\d[0-9]{0,2}[°]{0,1}\s*[0-9]{0,2}['`´′]{0,1}\s*[0-9]{0,2}['`´′]{0,2}["]{0,2}\s*$/,
            validWGS84_dez = /[0-9]{1,3}[.,]{0,1}[0-9]{0,5}[\s]{0,1}[°]{0,1}\s*$/,
            coordinates = coords;

        commit("resetSelectedCoordinates");

        if (state.currentSelection === "ETRS89") {
            for (const coord of coordinates) {
                if (coord.value === "" || coord.value.length < 1) {
                    coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: coord.name});
                }
                else if (!coord.value.match(validETRS89)) {
                    const noMatch = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: coord.name});

                    coord.errorMessage = coord.id === "easting" ? noMatch + state.coordinatesEastingExample : noMatch + state.coordinatesNorthingExample;
                }
                else {
                    commit("resetErrorMessages");
                    commit("pushCoordinates", coord.value);
                }
            }
        }
        if (state.currentSelection === "WGS84") {
            for (const coord of coordinates) {

                if (coord.value === "" || coord.value.length < 1) {
                    coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.hdmsNoCoord", {valueKey: coord.name});
                }
                else if (!coord.value.match(validWGS84)) {
                    const noMatch = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: coord.name});

                    coord.errorMessage = coord.id === "easting" ? noMatch + state.coordinatesEastingExample : noMatch + state.coordinatesNorthingExample;
                }
                else {
                    commit("resetErrorMessages");
                    commit("pushCoordinates", coord.value.split(/[\s°′″'"´`]+/));
                }
            }
        }
        if (state.currentSelection === "WGS84(Dezimalgrad)") {
            for (const coord of coordinates) {

                if (coord.value === "" || coord.value.length < 1) {
                    coord.errorMessage = i18next.t("common:modules.tools.searchByCoord.errorMsg.hdmsNoCoord", {valueKey: coord.name});
                }
                else if (!coord.value.match(validWGS84_dez)) {
                    const noMatch = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: coord.name});

                    coord.errorMessage = coord.id === "easting" ? noMatch + state.coordinatesEastingExample : noMatch + state.coordinatesNorthingExample;
                }
                else {
                    commit("resetErrorMessages");
                    commit("pushCoordinates", coord.value.split(/[\s°]+/));
                }
            }
        }
    }
};
