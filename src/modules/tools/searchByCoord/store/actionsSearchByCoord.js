import proj4 from "proj4";

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
     * Resets the values of the coordinates.
     * @param {Array} coordinates from the validated coordinates
     * @returns {void}
     */
    resetValues ({commit}) {
        commit("resetValues");
    },
    /**
     * Resets the error messages of the coordinates.
     * @param {Array} coordinates from the validated coordinates
     * @returns {void}
     */
    resetErrorMessages ({commit}) {
        commit("resetErrorMessages");
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
     * Sets the zoom level to the map.
     * @param {Number} zoomLevel - Zoomlevel to zoom to
     * @returns {void}
     */
    // TODO: direkt in Component?
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
                if (coord.value === "") {
                    if (coord.id === "easting") {
                        commit("setEastingErrorNoCoord");
                    }
                    else if (coord.id === "northing") {
                        commit("setNorthingErrorNoCoord");
                    }
                }
                else if (!coord.value.match(validETRS89)) {
                    if (coord.id === "easting") {
                        commit("setEastingErrorNoMatch");
                    }
                    else if (coord.id === "northing") {
                        commit("setNorthingErrorNoMatch");
                    }
                }
                else {
                    commit("resetErrorMessages");
                    commit("pushCoordinates", coord.value);
                }
            }
        }
        if (state.currentSelection === "WGS84") {
            for (const coord of coordinates) {

                if (coord.value === "") {
                    if (coord.id === "easting") {
                        commit("setEastingErrorNoCoord");
                    }
                    else if (coord.id === "northing") {
                        commit("setNorthingErrorNoCoord");
                    }
                }
                else if (!coord.value.match(validWGS84)) {
                    if (coord.id === "easting") {
                        commit("setEastingErrorNoMatch");
                    }
                    else if (coord.id === "northing") {
                        commit("setNorthingErrorNoMatch");
                    }
                }
                else {
                    commit("resetErrorMessages");
                    commit("pushCoordinates", coord.value.split(/[\s°′″'"´`]+/));
                }
            }
        }
        if (state.currentSelection === "WGS84(Dezimalgrad)") {
            for (const coord of coordinates) {

                if (coord.value === "") {
                    if (coord.id === "easting") {
                        commit("setEastingErrorNoCoord");
                    }
                    else if (coord.id === "northing") {
                        commit("setNorthingErrorNoCoord");
                    }
                }
                else if (!coord.value.match(validWGS84_dez)) {
                    if (coord.id === "easting") {
                        commit("setEastingErrorNoMatch");
                    }
                    else if (coord.id === "northing") {
                        commit("setNorthingErrorNoMatch");
                    }
                }
                else {
                    commit("resetErrorMessages");
                    commit("pushCoordinates", coord.value.split(/[\s°]+/));
                }
            }
        }
    },
    /**
     * Transforms the selected and validated coordinates to their given coordinate system and calls the moveToCoordinates function.
     * @returns {void}
     */
    transformCoordinates ({state, dispatch}) {
        if (state.selectedCoordinates.length === 2) {
            dispatch("setZoom", state.zoomLevel);
            if (state.currentSelection !== "ETRS89") {
                const latitude = state.selectedCoordinates[0],
                    newLatitude = Number(latitude[0]) +
            (Number(latitude[1] ? latitude[1] : 0) / 60) +
            (Number(latitude[2] ? latitude[2] : 0) / 60 / 60),
                    longitude = state.selectedCoordinates[1],
                    newLongitude = Number(longitude[0]) +
            (Number(longitude[1] ? longitude[1] : 0) / 60) +
            (Number(longitude[2] ? longitude[2] : 0) / 60 / 60);

                state.transformedCoordinates = proj4(proj4("EPSG:4326"), proj4("EPSG:25832"), [newLongitude, newLatitude]); // turning the coordinates around to make it work for WGS84
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else {
                dispatch("moveToCoordinates", state.selectedCoordinates);
            }
        }
    },
    /**
     * Transforms the selected and validated coordinates to their given coordinate system and calls the moveToCoordinates function.
     * @param {Array} coordinates from the validated coordinates
     * @returns {void}
     */
    moveToCoordinates ({dispatch}, coordinates) {
        dispatch("setMarker", coordinates);
        dispatch("setCenter", coordinates);
    }
};
