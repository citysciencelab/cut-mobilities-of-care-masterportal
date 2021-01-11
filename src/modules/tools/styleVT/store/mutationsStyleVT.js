import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateStyleVT";

const mutations = {
    ...generateSimpleMutations(initialState),
    setLayerModelById (state, payload) {
        const id = payload.target.value;
        let layerModel = null;

        if (id !== "") {
            layerModel = Radio.request("ModelList", "getModelByAttributes", {id});
        }

        Object.assign(state, {layerModel});
    }
};

export default mutations;
