import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import scaleLayerOverlapAnalysis from "./stateLayerOverlapAnalysis";

const getters = {
    ...generateSimpleGetters(scaleLayerOverlapAnalysis)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
