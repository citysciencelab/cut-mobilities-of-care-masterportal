import getAnnotationsStyle from "../../utils/getAnnotationsStyle";
import getNextGeometryIndex from "../../utils/getNextGeometryIndex";

import stateMobilityDataDraw from "../stateMobilityDataDraw";

const initialState = JSON.parse(JSON.stringify(stateMobilityDataDraw));

/**
 * Initializes the annotations view.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function initializeAnnotationsView ({state, commit, dispatch}) {
    // Create layer (if needed) in which the annotations are drawn.
    const layer = Radio.request(
        "Map",
        "createLayerIfNotExists",
        "mobility_data_annotations_draw_layer"
    );

    // Set the styles for the annotations layer
    layer.setStyle(getAnnotationsStyle);

    commit("setAnnotationsLayer", layer);

    dispatch("addAnnotationDrawInteraction");
    dispatch("addSnapInteraction", state.annotationsLayer.getSource());
}

/**
 * Reset interactions from the annotations view.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function cleanUpAnnotationsView ({commit, dispatch}) {
    // Unselect all annotation features
    dispatch("selectAnnotationFeature");
    // Remove annotation draw interaction
    dispatch("removeAnnotationDrawInteraction");
    // Reset interaction state
    commit("setCurrentInteraction", initialState.currentInteraction);
}

/**
 * Sets the drawing mode for the current drawing.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the drawingMode.
 * @returns {void}
 */
function setDrawingMode ({commit, dispatch}, event) {
    commit("setDrawingMode", event.target.value);

    // Update the draw interaction for the new drawing mode
    dispatch("addAnnotationDrawInteraction");
}

/**
 * Updates the properties of the annotation with the given geometry index
 *
 * @param {Object} context actions context object.
 * @param {Object} parameters contains the properties to update the annotation
 * @param {number} parameters.geometryIndex the geometry index of the annotation to update
 * @returns {void}
 */
function setAnnotationProperties (
    {state, commit},
    {geometryIndex, ...props}
) {
    const newAnnotations = state.annotations.map(data => data.geometryIndex === geometryIndex ? {...data, ...props} : data
    );

    // Update the annotations state
    commit("setAnnotations", newAnnotations);
}

/**
 * Highlights the annotation feature with the given geometry index.
 *
 * @param {Object} context actions context object.
 * @param {number} geometryIndex the geometry index of the feature to select
 * @returns {void}
 */
function selectAnnotationFeature ({state, commit}, geometryIndex) {

    // Update the selected annotation index
    commit("setSelectedAnnotationIndex", geometryIndex);

    for (const annotation of state.annotations) {
        const isSelected = annotation.geometryIndex === geometryIndex;

        annotation.feature.set("isSelected", isSelected);
    }
}

/**
 * Adds the feature information to the annotations in store
 * Selects the newly added annotation feature
 *
 * @param {Object} context actions context object.
 * @param {module:ol/Feature} feature to render
 * @returns {void}
 */
function addFeatureToAnnotation ({state, commit, dispatch}, feature) {
    const geometryIndex = getNextGeometryIndex(state.annotations);

    // Sets the id for the new annotation feature
    feature.setId(geometryIndex);

    feature.values_["mode"] = state.drawingMode;
    feature.values_["mode_index"] = state.drawingMode + " " + geometryIndex + 1;
    const mobilityMode = feature.values_['mobilityMode'];
    feature["mobility_mode"] = mobilityMode;

    commit("setAnnotations", [
        ...state.annotations,
        {
            feature,
            geometryIndex,
            mobilityMode
        }
    ]);
    dispatch("selectAnnotationFeature", geometryIndex);
}

/**
 * Deletes an annotation from store
 *
 * @param {Object} context actions context object.
 * @param {number} geometryIndex the geometry index of the annotation to delete
 * @returns {void}
 */
function deleteAnnotation ({state, commit, dispatch}, geometryIndex) {
    const source = state.annotationsLayer.getSource(),
        mapFeature = source.getFeatureById(geometryIndex),
        newAnnotations = state.annotations.filter(
            data => data.geometryIndex !== geometryIndex
        );

    // Remove the annotation from the map
    if (mapFeature) {
        source.removeFeature(mapFeature);
    }

    // Update the annotations state
    commit("setAnnotations", newAnnotations);

    // Unselect the annotation
    dispatch("selectAnnotationFeature");
}

export default {
    initializeAnnotationsView,
    cleanUpAnnotationsView,
    setDrawingMode,
    setAnnotationProperties,
    selectAnnotationFeature,
    addFeatureToAnnotation,
    deleteAnnotation
};
