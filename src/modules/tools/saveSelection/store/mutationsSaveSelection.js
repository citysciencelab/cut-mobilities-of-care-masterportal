import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateSaveSelection";

const mutations = {
    ...generateSimpleMutations(initialState),
    setLayerList (state, payload) {
        const {featureViaURL} = Config,
            getIds = [];
        let layerList = [];

        if (featureViaURL !== undefined) {
            featureViaURL.layers.forEach(el => {
                getIds.push(el.id);
            });
        }
        layerList = payload.filter(el => !getIds.includes(el.id));
        Object.assign(state, {layerList});
    }
};

export default mutations;
