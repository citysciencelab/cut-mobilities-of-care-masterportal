/**
 * Selects given layer by object or ID
 * Also unselects all previous selected layers and
 * shows buffers if a buffer radius was provided previously
 *
 * @param {Object|String} selectedSourceLayer - layer object or ID string to select corresponding layer
 *
 * @throws Error
 * @return {void}
 */
function applySelectedSourceLayer ({getters, commit, dispatch}, selectedSourceLayer) {
    // unselect target layer if it is already selected
    if (getters.selectedTargetLayer) {
        getters.selectedTargetLayer.setIsSelected(false);
        commit("setSelectedTargetLayer", null);
    }

    let selectedLayer = selectedSourceLayer;

    // find the layer in select options if selected layer is provided by id
    if (typeof selectedLayer === "string") {
        selectedLayer = getters.selectOptions.find(item => item.id === selectedLayer);
    }

    // select only the new source layer and deselect all previous selected layers
    if (selectedLayer) {
        getters.selectOptions.forEach(layerOption => {
            layerOption.setIsSelected(selectedLayer.get("id") === layerOption.get("id"));
        });
    }
    // throw error if no selected layer is provided and it is not a valid null value
    else if (selectedLayer !== null) {
        throw new Error(i18next.t("common:modules.tools.bufferAnalysis.sourceLayerNotFound"));
    }
    commit("setSelectedSourceLayer", selectedLayer);
    // remove previously generated layers and show buffer
    if (getters.bufferRadius && selectedLayer) {
        dispatch("areLayerFeaturesLoaded", selectedLayer.get("id")).then(() => {
            dispatch("removeGeneratedLayers");
            dispatch("showBuffer");
        });
    }
}
/**
 * Selects given layer by object or ID
 * triggers also the intersection check action
 *
 * @param {Object|String} selectedTargetLayer - layer object or ID string to select corresponding layer
 *
 * @throws Error
 * @return {void}
 */
function applySelectedTargetLayer ({commit, getters, dispatch}, selectedTargetLayer) {
    let selectedLayer = selectedTargetLayer;

    // find the layer in select options if selected layer is provided by id
    if (typeof selectedLayer === "string") {
        selectedLayer = getters.selectOptions.find(item => item.id === selectedTargetLayer);
    }
    commit("setSelectedTargetLayer", selectedLayer);
    // select the new target layer and check for intersections
    if (selectedLayer) {
        selectedLayer.setIsSelected(selectedLayer.get("id"));
        dispatch("checkIntersection");
    }
    // throw error if no selected layer is provided and it is not a valid null value
    else if (selectedLayer !== null) {
        throw new Error(i18next.t("common:modules.tools.bufferAnalysis.targetLayerNotFound"));
    }
}
/**
 * Applies the input buffer radius which triggers the show buffer action
 *
 * @param {Number} selectedBufferRadius - layer object or ID string to select corresponding layer
 *
 * @return {void}
 */
function applyBufferRadius ({commit, dispatch}, selectedBufferRadius) {
    // remove previous generated layers and show buffer only when a truthy value is provided
    commit("setBufferRadius", selectedBufferRadius);
    if (selectedBufferRadius) {
        dispatch("removeGeneratedLayers");
        dispatch("showBuffer");
    }
}

export {
    applySelectedSourceLayer,
    applySelectedTargetLayer,
    applyBufferRadius
};
