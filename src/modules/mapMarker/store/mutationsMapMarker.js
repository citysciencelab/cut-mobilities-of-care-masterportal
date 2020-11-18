import {generateSimpleMutations} from "../../../app-store/utils/generators";
import mapMarkerState from "./stateMapMarker";


const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(mapMarkerState),

    /**
     * Adds a feature to the given map marker source.
     * @param {Object} state The state of mapMarker.
     * @param {ol/Feature} feature The feature to be added.
     * @param {String} marker The marker to which the feature should be added.
     * @returns {void}
     */
    addFeatureToMarker (state, {feature, marker}) {
        state[marker].getSource().addFeature(feature);
    },

    /**
     * Clears the given map marker source.
     * @param {Object} state The state of mapMarker.
     * @param {String} marker The marker to be cleared.
     * @returns {void}
     */
    clearMarker (state, marker) {
        state[marker].getSource().clear();
    },

    /**
     * Sets the visibility of the given map marker.
     * @param {Object} state The state of mapMarker.
     * @param {Boolean} visibility The visibility.
     * @param {String} marker The marker whose visibility should be changed.
     * @returns {void}
     */
    setVisibilityMarker (state, {visibility, marker}) {
        state[marker].setVisible(visibility);
    }
};

export default mutations;
