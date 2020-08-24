import ToolsState from "./stateTools";
import {generateSimpleGetters} from "../../app-store/utils/generators";

const getters = {
    ...generateSimpleGetters(ToolsState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
