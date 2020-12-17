import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import stateMeasure from "./stateMeasure";

const mutations = {
    ...generateSimpleMutations(stateMeasure),
    addFeature (state, payload) {
        const key = state.selectedGeometry === "LineString" ? "lines" : "polygons";

        state[key] = {
            ...state[key],
            [payload.ol_uid]: payload
        };
    },
    addOverlay (state, payload) {
        state.overlays = [...state.overlays, payload];
    }
};

export default mutations;
