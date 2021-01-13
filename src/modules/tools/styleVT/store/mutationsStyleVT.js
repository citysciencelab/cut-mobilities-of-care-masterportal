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
     * @param {Event} event Event fired by changing the selected value for the layerModel.
     * @param {HTMLSelectElement} event.target The HTML select element for the layerModel.
     * @returns {void}
     */
    setLayerModelById (state, {target}) {
        const id = target.value;
        let layerModel = null;

        if (id !== "") {
            layerModel = Radio.request("ModelList", "getModelByAttributes", {id});
        }

        Object.assign(state, {layerModel});
    }
};

export default mutations;
