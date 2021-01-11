import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateStyleVT";

const getters = {
    ...generateSimpleGetters(initialState),
    selectedLayerId (state) {
        return layerId => layerId === state.layerModel?.id;
    },
    selectedStyle (state) {
        return styleId => styleId === state.layerModel.selectedStyleID;
    }
};

export default getters;
