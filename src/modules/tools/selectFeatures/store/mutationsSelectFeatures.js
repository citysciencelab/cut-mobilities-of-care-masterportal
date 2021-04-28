import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import stateSelectFeatures from "./stateSelectFeatures";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateSelectFeatures),

    /**
     * Adds the Item to the selectedFeaturesWithRenderInformation array
     * @param {Object} state vuex state
     * @param {Object} payload feature item and properties
     * @returns {void}
     */
    addSelectedFeatureWithRenderInformation (state, payload) {
        state.selectedFeaturesWithRenderInformation.push(payload);
    },

    /**
     * Adds the Feature to the selectedFeatures Collection
     * @param {Object} state vuex state
     * @param {Object} payload selected feature
     * @returns {void}
     */
    addSelectedFeature (state, payload) {
        state.selectedFeatures.push(payload);
    }

};

export default mutations;
