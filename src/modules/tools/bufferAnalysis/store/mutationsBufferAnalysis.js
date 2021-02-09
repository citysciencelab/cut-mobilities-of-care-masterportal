import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import stateBufferAnalysis from "./stateBufferAnalysis";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateBufferAnalysis),
    /**
     * Adds result features to an array for collection purpose
     *
     * @param {Object} state - context state object
     * @param {Object} feature - open layers feature object
     *
     * @return {void}
     */
    addResultFeature (state, feature) {
        state.resultFeatures.push(feature);
    },
    /**
     * Adds intersection polygons to an array for collection purpose
     *
     * @param {Object} state - context state object
     * @param {Object} polygon - JSTS geometry object
     *
     * @return {void}
     */
    addIntersectionPolygon (state, polygon) {
        state.intersections.push(polygon);
    },
    /**
     * Adds a layer as an option to the v-model of the layer select elements in component
     *
     * @param {Object} state - context state object
     * @param {Object} option - layer model object
     *
     * @return {void}
     */
    addSelectOption (state, option) {
        state.selectOptions.push(option);
    }
};

export default mutations;
