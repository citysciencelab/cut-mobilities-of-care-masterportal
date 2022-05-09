import {Draw, Snap, Modify} from "ol/interaction";
import Collection from "ol/Collection";

import {mobilityModes} from "../../../../shared/constants/mobilityData";

import {
    getMobilityDataDrawLineStyle,
    getMobilityDataDrawPointStyle,
    getMobilityDataModifyStyle
} from "../../utils/getMobilityDataDrawStyle";
import {
    getAnnotationsDrawLineStyle,
    getAnnotationsDrawPointStyle
} from "../../utils/getAnnotationsDrawStyle";

import {drawingModes, interactionTypes} from "../constantsMobilityDataDraw";

/**
 * Creates interactions for drawing mobility data and adds them to the map.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function addMobilityDataDrawInteractions ({
    rootState,
    state,
    commit,
    dispatch
}) {
    const source = state.mobilityDataLayer.getSource(),
        drawLineInteraction = new Draw({
            source,
            type: "LineString",
            style: () => getMobilityDataDrawLineStyle(state.mobilityMode)
        }),
        drawPointInteraction = new Draw({
            source,
            type: "Point",
            style: getMobilityDataDrawPointStyle
        });

    // Deactivate draw point interaction by default
    drawPointInteraction.setActive(false);

    commit("setDrawLineInteraction", drawLineInteraction);
    commit("setDrawPointInteraction", drawPointInteraction);

    dispatch("createMobilityDataDrawInteractionListeners");

    // Add interactions to the current map instance
    rootState.Map.map.addInteraction(drawLineInteraction);
    rootState.Map.map.addInteraction(drawPointInteraction);
}

/**
 * Create listeners for mobility data drawing.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function createMobilityDataDrawInteractionListeners ({state, dispatch}) {
    // Listener to stop drawing a line feature
    state.drawLineInteraction.on("drawend", event => {
        // Add the current mobility mode to the finished feature
        event.feature.set("mobilityMode", state.mobilityMode);
        dispatch("addFeatureToMobilityData", event.feature);
    });
}

/**
 * Removes the interactions for drawing mobility data.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function removeMobilityDataDrawInteractions ({rootState, state, commit}) {
    if (state.drawLineInteraction) {
        rootState.Map.map.removeInteraction(state.drawLineInteraction);
        commit("setDrawLineInteraction", null);
    }
    if (state.drawPointInteraction) {
        rootState.Map.map.removeInteraction(state.drawPointInteraction);
        commit("setDrawPointInteraction", null);
    }
}

/**
 * Creates an interaction for drawing annotations and adds it to the map.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function addAnnotationDrawInteraction ({rootState, state, commit, dispatch}) {
    const source = state.annotationsLayer.getSource();
    let drawPointAnnotationInteraction, drawLineAnnotationInteraction;

    // Remove old draw interaction
    if (state.drawLineAnnotationInteraction || state.drawPointAnnotationInteraction) {
        dispatch("removeAnnotationDrawInteraction");
    }
    if (state.drawingMode === "Point") {
        drawPointAnnotationInteraction = new Draw({
            source,
            type: "Point",
            style: getAnnotationsDrawPointStyle
        });
        commit("setDrawPointAnnotationInteraction", drawPointAnnotationInteraction);
        dispatch("createAnnotationPointInteractionListeners");
        // Add interaction to the current map instance
        rootState.Map.map.addInteraction(drawPointAnnotationInteraction);
    } else {
        drawLineAnnotationInteraction = new Draw({
            source,
            type: state.drawingMode,
            style: () => getAnnotationsDrawLineStyle(state.mobilityMode, state.drawingMode)
        });
        commit("setDrawLineAnnotationInteraction", drawLineAnnotationInteraction);
        dispatch("createAnnotationDrawInteractionListeners");
        // Add interaction to the current map instance
        rootState.Map.map.addInteraction(drawLineAnnotationInteraction);
    }

    // Update the snap interaction
    dispatch("addSnapInteraction", source);
}

/**
 * Create listeners for annotation drawing.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function createAnnotationDrawInteractionListeners ({state, dispatch}) {
    // Listener to stop drawing a line feature
    state.drawLineAnnotationInteraction.on("drawend", event => {
        // Add the current mobility mode to the finished feature
        if (event.target.mode_ !== "Polygon") {
            event.feature.set("mobilityMode", state.mobilityMode);
        }
        dispatch("addFeatureToAnnotation", event.feature);
    });
}

/**
 * Create listeners for annotation point drawing.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function createAnnotationPointInteractionListeners ({state, dispatch}) {
    // Listener to stop drawing a line feature
    state.drawPointAnnotationInteraction.on("drawend", event => {
        dispatch("addFeatureToAnnotation", event.feature);
    });
}

/**
 * Removes the interaction for drawing annotations.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function removeAnnotationDrawInteraction ({rootState, state, commit}) {
    if (state.drawLineAnnotationInteraction) {
        rootState.Map.map.removeInteraction(state.drawLineAnnotationInteraction);
        commit("setDrawLineAnnotationInteraction", null);
    }
    if (state.drawPointAnnotationInteraction) {
        rootState.Map.map.removeInteraction(state.drawPointAnnotationInteraction);
        commit("setDrawPointAnnotationInteraction", null);
    }
}

/**
 * Creates an interaction for snapping of vector features while drawing or modifying and adds it to the map.
 *
 * @param {Object} context actions context object.
 * @param {module:ol/source/Source} source the map layer source to add the snap interaction to
 * @returns {void}
 */
function addSnapInteraction ({rootState, state, commit, dispatch}, source) {
    const snapInteraction = new Snap({source});

    // Remove old snap interaction
    if (state.snapInteraction) {
        dispatch("removeSnapInteraction");
    }

    commit("setSnapInteraction", snapInteraction);

    // Add interaction to the current map instance
    rootState.Map.map.addInteraction(snapInteraction);
}

/**
 * Removes the interaction for snapping of vector features while drawing or modifying.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function removeSnapInteraction ({rootState, state, commit}) {
    if (state.snapInteraction) {
        rootState.Map.map.removeInteraction(state.snapInteraction);
        commit("setSnapInteraction", null);
    }
}

/**
 * Creates an interaction for modifying mobility data and adds it to the map.
 *
 * @param {Object} context actions context object.
 * @param {module:ol/Feature} feature The selected mobility data feature
 * @returns {void}
 */
function addModifyInteraction ({rootState, state, commit, dispatch}, feature) {
    console.log("modify")
    const features = new Collection([feature]),
        modifyInteraction = new Modify({
            features,
            style: getMobilityDataModifyStyle
        });

    // Remove old modify interaction
    if (state.modifyInteraction) {
        dispatch("removeModifyInteraction");
    }

    commit("setModifyInteraction", modifyInteraction);

    // Add interaction to the current map instance
    rootState.Map.map.addInteraction(modifyInteraction);
}

/**
 * Removes the interaction for modifying mobility data.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function removeModifyInteraction ({rootState, state, commit}) {
    if (state.modifyInteraction) {
        rootState.Map.map.removeInteraction(state.modifyInteraction);
        commit("setModifyInteraction", null);
    }
}

/**
 * Starts modifying the passed mobility data feature.
 *
 * @param {Object} context actions context object.
 * @param {number} geometryIndex The geometry index of the mobility data to modify
 * @returns {void}
 */
function startModifyingMobilityDataFeature (
    {state, commit, dispatch},
    geometryIndex
) {
    const {feature} =
        state.mobilityData.find(data => data.geometryIndex === geometryIndex) ||
        {};

    if (feature) {
        commit("setCurrentInteraction", interactionTypes.MODIFY);

        // Set modifying state of the feature
        feature.set("isModifying", true);

        // Disable draw interactions
        state.drawLineInteraction.setActive(false);
        state.drawPointInteraction.setActive(false);

        // Add modify interaction for the selected feature
        dispatch("addModifyInteraction", feature);

        // Update the snap interaction
        dispatch("addSnapInteraction", state.mobilityDataLayer.getSource());
    }
}

/**
 * Stops modifying a mobility data feature.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function stopModifyingMobilityDataFeature ({state, commit, dispatch}) {
    commit("setCurrentInteraction", interactionTypes.DRAW);

    // Remove modifying state from all features again
    for (const data of state.mobilityData) {
        data.feature.set("isModifying", false);
    }

    // Remove modify interaction
    dispatch("removeModifyInteraction");

    // Enable draw interaction again
    state.drawLineInteraction.setActive(true);
}

/**
 * Starts drawing a new mobility data location.
 *
 * @param {Object} context actions context object.
 * @param {number} geometryIndex The geometry index of the new mobility data location
 * @returns {void}
 */
function startDrawingMobilityDataLocation (
    {state, commit, dispatch},
    geometryIndex
) {
    commit("setCurrentInteraction", interactionTypes.MODIFY);

    // Disable draw line interaction
    state.drawLineInteraction.setActive(false);
    // Enable draw point interaction
    state.drawPointInteraction.setActive(true);

    // Listener to stop drawing a the location
    state.drawPointInteraction.once("drawend", event => {
        event.feature.setId(geometryIndex);
        event.feature.set("mobilityMode", mobilityModes.POI);
        event.feature.set("isSelected", true);

        const newMobilityData = state.mobilityData.map(data => data.geometryIndex === geometryIndex
            ? {...data, feature: event.feature}
            : data
        );
        commit("setMobilityData", newMobilityData);

        dispatch("stopDrawingMobilityDataLocation");
    });

    // Update the snap interaction
    dispatch("addSnapInteraction", state.mobilityDataLayer.getSource());
}

/**
 * Stops modifying a mobility data feature.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function stopDrawingMobilityDataLocation ({state, commit}) {
    commit("setCurrentInteraction", interactionTypes.DRAW);

    // Disable draw point interaction
    state.drawPointInteraction.setActive(false);
    // Enable draw line interaction again
    state.drawLineInteraction.setActive(true);
}

/**
 * Starts modifying the passed annotation feature.
 *
 * @param {Object} context actions context object.
 * @param {number} geometryIndex The geometry index of the annotation to modify
 * @returns {void}
 */
function startModifyingAnnotationFeature (
    {state, commit, dispatch},
    geometryIndex
) {
    const {feature} =
        state.annotations.find(data => data.geometryIndex === geometryIndex) ||
        {};

    if (feature) {
        commit("setCurrentInteraction", interactionTypes.MODIFY);

        // Set modifying state of the feature
        feature.set("isModifying", true);

        // Disable draw annotation interaction
        if (state.drawLineAnnotationInteraction) {
            state.drawLineAnnotationInteraction.setActive(false);
        } else if (state.drawPointAnnotationInteraction) {
            state.drawPointAnnotationInteraction.setActive(false);
        }

        // Add modify interaction for the selected feature
        dispatch("addModifyInteraction", feature);

        // Update the snap interaction
        dispatch("addSnapInteraction", state.annotationsLayer.getSource());
    }
}

/**
 * Stops modifying an annotation feature.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function stopModifyingAnnotationFeature ({state, commit, dispatch}) {
    commit("setCurrentInteraction", interactionTypes.DRAW);

    // Remove modifying state from all features again
    for (const data of state.annotations) {
        data.feature.set("isModifying", false);
    }

    // Remove modify interaction
    dispatch("removeModifyInteraction");

    // Enable draw annotation interaction again
    if (state.drawLineAnnotationInteraction) {
        state.drawLineAnnotationInteraction.setActive(true);
    } else if (state.drawPointAnnotationInteraction) {
        state.drawPointAnnotationInteraction.setActive(true);
    }

}

export default {
    addMobilityDataDrawInteractions,
    createMobilityDataDrawInteractionListeners,
    removeMobilityDataDrawInteractions,
    addAnnotationDrawInteraction,
    createAnnotationDrawInteractionListeners,
    createAnnotationPointInteractionListeners,
    removeAnnotationDrawInteraction,
    addSnapInteraction,
    removeSnapInteraction,
    addModifyInteraction,
    removeModifyInteraction,
    startModifyingMobilityDataFeature,
    stopModifyingMobilityDataFeature,
    startDrawingMobilityDataLocation,
    stopDrawingMobilityDataLocation,
    startModifyingAnnotationFeature,
    stopModifyingAnnotationFeature
};
