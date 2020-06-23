import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import supplyCoordState from "./stateSupplyCoord";

const getters = {
    ...generateSimpleGetters(supplyCoordState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
