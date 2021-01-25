import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateSaveSelection";

const getters = {
    ...generateSimpleGetters(initialState),
    /**
     * @param {Object} _ saveSelection store state.
     * @param {Object} __ saveSelection store getters.
     * @param {Object} ___ root state.
     * @param {Object} rootGetters root getters.
     * @returns {?[Number, Number]} The current center coordinates of the mapView.
     */
    centerCoordinates (_, __, ___, rootGetters) {
        return rootGetters["Map/center"];
    },
    simpleMap () {
        return Config.hasOwnProperty("simpleMap") ? Config.simpleMap : false;
    },
    /**
     * @param {Object} state saveSelection store state.
     * @param {Object} getters saveSelection store getters.
     * @returns {String} The Url that can be copied by the user.
     */
    url ({layerIds, layerVisibilities, layerTransparencies}, {centerCoordinates, zoomLevel}) {
        return location.origin + location.pathname + "?layerIds=" + layerIds + "&visibility=" + layerVisibilities + "&transparency=" + layerTransparencies + "&center=" + centerCoordinates + "&zoomLevel=" + zoomLevel;
    },
    /**
     * @param {Object} _ saveSelection store state.
     * @param {Object} __ saveSelection store getters.
     * @param {Object} ___ root state.
     * @param {Object} rootGetters root getters.
     * @returns {?[Number, Number]} The current zoomLevel of the mapView.
     */
    zoomLevel (_, __, ___, rootGetters) {
        return rootGetters["Map/zoomLevel"];
    }
};

export default getters;
