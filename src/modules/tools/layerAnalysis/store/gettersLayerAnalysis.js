import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import scaleLayerAnalysis from "./stateLayerAnalysis";

const getters = {
    ...generateSimpleGetters(scaleLayerAnalysis)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
