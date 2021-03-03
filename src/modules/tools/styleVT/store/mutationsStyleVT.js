import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateStyleVT";

const mutations = {
    ...generateSimpleMutations(initialState),
    /**
     * If the selected id is not an empty String the model of the layer is requested from the ModelList.
     * This value then is committed to the state.
     * If no id is present, null is committed.
     *
     * @param {Object} state State object of the module.
     * @param {String} id Id of the layerModel.
     * @returns {void}
     */
    setLayerModelById (state, id) {
        let layerModel = null;

        if (id !== "") {
            layerModel = Radio.request("ModelList", "getModelByAttributes", {id});
        }

        Object.assign(state, {layerModel});
    },
    /**
     * Changes the style of the selected layer to the one of the one with the selected styleId.
     *
     * @param {Object} state State object of the module.
     * @param {String} styleId Id of the style to be set on the layer.
     * @returns {void}
     */
    triggerStyleUpdate (state, styleId) {
        state.layerModel.setStyleById(styleId);
    }
};

export default mutations;
