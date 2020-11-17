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

    addFeatureToMarkerPolygon (state, wkt) {
        state.markerPolygon.getSource().addFeature(wkt);
    },

    addFeatureToMarkerPoint (state, feature) {
        state.markerPoint.getSource().addFeature(feature);
    },

    clearMarkerPolygon (state) {
        state.markerPolygon.getSource().clear();
    },

    clearMarkerPoint (state) {
        state.markerPoint.getSource().clear();
    },

    setVisibilityMarkerPolygon (state, visible) {
        state.markerPolygon.setVisible(visible);
    },

    setVisibilityMarkerPoint (state, visible) {
        state.markerPoint.setVisible(visible);
    },

    setPolygonStyle (state, style) {
        state.markerPolygon.setStyle(style);
    }
};

export default mutations;
