import {generateSimpleMutations} from "../../../app-store/utils/generators";

import initialState from "./state";
import getters from "./gettersMap";

const mutations = {
    ...generateSimpleMutations(initialState),
    /**
     * Sets the visibility of a layer.
     * @param {object} state state object
     * @param {object} payload parameter object
     * @param {string} payload.layerId id of layer to set visibility of
     * @param {boolean} payload.visibility isVisible
     * @returns {void}
     */
    setLayerVisibility (state, {layerId, visibility}) {
        getters.layers(state)[layerId].visibility = visibility;
    },
    /**
     * Sets the opacity of a layer.
     * @param {object} state state object
     * @param {object} payload parameter object
     * @param {string} payload.layerId id of layer to change opacity of
     * @param {number} payload.opacity opacity value in range (0, 1)
     * @returns {void}
     */
    setLayerOpacity (state, {layerId, opacity}) {
        getters.layers(state)[layerId].opacity = opacity;
    },
    /**
     * Sets the scales for the map.
     * @param {object} state state object
     * @param {object} payload parameter object
     * @param {string} payload.scales list of scales
     * @returns {void}
     */
    setScales (state, {scales}) {
        state.scales = scales;
    }
};

export default mutations;
