import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import stateMeasure from "./stateMeasure";

const mutations = {
    ...generateSimpleMutations(stateMeasure),
    /**
     * Adds a feature depending on the currently selected geometry style to either
     * the lines or the polygons object by key. Features cannot be added multiple
     * times by design. To trigger an update regarding the feature, re-add it.
     * @param {object} state vuex state
     * @param {module:ol/Feature} payload feature to add
     * @returns {void}
     */
    addFeature (state, payload) {
        const key = state.selectedGeometry === "LineString" ? "lines" : "polygons";

        state[key] = {
            ...state[key],
            [payload.ol_uid]: payload
        };
    },
    /**
     * Adds an unlisten function to the unlisteners array.
     * @param {object} state vuex state
     * @param {function} payload added unlisten function
     * @returns {void}
     */
    addUnlistener (state, payload) {
        state.unlisteners = [...state.unlisteners, payload];
    }
};

export default mutations;
