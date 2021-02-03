import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import state from "./stateBufferAnalysis";

const getters = {
    ...generateSimpleGetters(state),
    selectOptions () {
        if (!state.selectOptions.length) {
            const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"}) || [];

            layers.forEach(layer => {
                if (layer.get("layerSource").getFeatures().length > 100) {
                    layer.set("performanceWarning", true);
                }
                state.selectOptions.push(layer);
            });
        }
        return state.selectOptions;
    }
};

export default getters;
