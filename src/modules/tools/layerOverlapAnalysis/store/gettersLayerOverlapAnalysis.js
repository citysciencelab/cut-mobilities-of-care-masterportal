import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import state from "./stateLayerOverlapAnalysis";

const getters = {
    ...generateSimpleGetters(state),
    sourceOptions () {
        if (!state.sourceOptions.length) {
            state.sourceOptions = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"});
        }
        return state.sourceOptions;
    },
    targetOptions () {
        if (!state.targetOptions.length) {
            state.targetOptions = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"});
        }

        if (state.selectedSourceLayer) {
            return state.targetOptions.filter(layer => {
                return layer.get("id") !== state.selectedSourceLayer.get("id");
            });
        }
        return state.targetOptions;
    }
};

export default getters;
