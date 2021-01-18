import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import state from "./stateLayerOverlapAnalysis";

const getters = {
    ...generateSimpleGetters(state),
    options () {
        if (!state.options.length) {
            Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"}).forEach(layer => {
                if (layer.get("layerSource").getFeatures().length > 100) {
                    layer.set("performanceWarning", true);
                }
                state.options.push(layer);
            });
        }
        return state.options;
    }
};

export default getters;
