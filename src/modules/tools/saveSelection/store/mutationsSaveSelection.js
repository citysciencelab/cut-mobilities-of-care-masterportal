import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateSaveSelection";

const mutations = {
    ...generateSimpleMutations(initialState),
    setLayerList (state, payload) {
        const {featureViaURL} = Config,
            getIds = [];
        let layerList = [];

        // The layer defined by the featureViaUrl module are excluded, as they are only given if the needed Url parameter is given.
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
