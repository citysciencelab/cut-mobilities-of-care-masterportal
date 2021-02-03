import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateSaveSelection";

const getters = {
    ...generateSimpleGetters(initialState),
    /**
     * @param {Object} state saveSelection store state.
     * @param {Object} _ saveSelection store getters.
     * @param {Object} __ root state.
     * @param {Object} rootGetters root getters.
     * @returns {String} The Url that can be copied by the user.
     */
    url ({layerIds, layerVisibilities, layerTransparencies}, _, __, rootGetters) {
        return location.origin + location.pathname + "?layerIds=" + layerIds + "&visibility=" + layerVisibilities + "&transparency=" + layerTransparencies + "&center=" + rootGetters["Map/center"] + "&zoomLevel=" + rootGetters["Map/zoomLevel"];
    }
};

export default getters;
