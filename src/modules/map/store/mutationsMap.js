import {generateSimpleMutations} from "../../../app-store/utils/generators";

import initialState from "./stateMap";
import getters from "./gettersMap";

const mutations = {
    ...generateSimpleMutations(initialState),
    /**
     * Set the center of the current view.
     * @param {Object} state - the map state
     * @param {Number[]} coord - an array of numbers representing an xy coordinate
     * @returns {void}
     */
    setCenter (state, coord) {
        if (Array.isArray(coord) && coord.length === 2 && typeof coord[0] === "number" && typeof coord[1] === "number") {
            state.center = coord;
            state.map.getView().setCenter(coord);
        }
        else {
            console.warn("Center was not set. Probably there is a data type error. The format of the coordinate must be an array with two numbers.");
        }
    },
    /**
     * Sets the visibility of a layer.
     * @param {Object} state state object
     * @param {Object} payload parameter object
     * @param {String} payload.layerId id of layer to set visibility of
     * @param {Boolean} payload.visibility isVisible
     * @returns {void}
     */
    setLayerVisibility (state, {layerId, visibility}) {
        getters.layers(state)[layerId].visibility = visibility;
    },
    /**
     * Sets the opacity of a layer.
     * @param {Object} state state object
     * @param {Object} payload parameter object
     * @param {String} payload.layerId id of layer to change opacity of
     * @param {Number} payload.opacity opacity value in range (0, 1)
     * @returns {void}
     */
    setLayerOpacity (state, {layerId, opacity}) {
        getters.layers(state)[layerId].opacity = opacity;
    },
    /**
     * Sets the scales for the map.
     * @param {Object} state state object
     * @param {Object} payload parameter object
     * @param {String} payload.scales list of scales
     * @returns {void}
     */
    setScales (state, {scales}) {
        state.scales = scales;
    },

    /**
     * Adds a layer to the map.
     * @param {Object} state The state object.
     * @param {ol/layer} layer The layer to be added to the map.
     * @returns {void}
     */
    addLayerToMap (state, layer) {
        state.map.addLayer(layer);
    },

    /**
     * Removes a layer from the map.
     * @param {Object} state The state object.
     * @param {ol/layer} layer The layer to be removed from the map
     * @returns {void}
     */
    removeLayerFromMap (state, layer) {
        if (state.map) {
            state.map.removeLayer(layer);
        }
    }
};

export default mutations;
