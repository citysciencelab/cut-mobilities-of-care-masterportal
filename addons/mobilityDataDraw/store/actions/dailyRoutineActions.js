import Feature from "ol/Feature";

import {mobilityModes} from "../../../../../../shared/constants/mobilityData";

import getMobilityDataStyle from "../../utils/getMobilityDataStyle";
import getNextGeometryIndex from "../../utils/getNextGeometryIndex";

import stateMobilityDataDraw from "../stateMobilityDataDraw";

const initialState = JSON.parse(JSON.stringify(stateMobilityDataDraw));

/**
 * Initializes the daily routine view.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function initializeDailyRoutineView ({state, commit, dispatch}) {
    // Create layer (if needed) in which the mobility data is drawn.
    const layer = Radio.request(
        "Map",
        "createLayerIfNotExists",
        "mobility_data_draw_layer"
    );

    // Set the styles for the mobility data layer
    layer.setStyle(getMobilityDataStyle);

    commit("setMobilityDataLayer", layer);

    dispatch("addMobilityDataDrawInteractions");
    dispatch("addSnapInteraction", state.mobilityDataLayer.getSource());
}

/**
 * Resets interactions from the daily routine view.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function cleanUpDailyRoutineView ({commit, dispatch}) {
    // Unselect all mobility data features
    dispatch("selectMobilityDataFeature");
    // Remove mobility data draw interactions
    dispatch("removeMobilityDataDrawInteractions");
    // Reset interaction state
    commit("setCurrentInteraction", initialState.currentInteraction);
}

/**
 * Sets the mobility mode for the current drawing.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the mobilityMode.
 * @returns {void}
 */
function setMobilityMode ({commit}, event) {
    commit("setMobilityMode", event.target.value);
}

/**
 * Toggles the clicked weekday.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the weekdays.
 * @returns {void}
 */
function toggleWeekday ({state, commit}, event) {
    const weekday = Number(event.target.value),
        newWeekdays = state.weekdays.includes(weekday)
            ? state.weekdays.filter(day => day !== weekday)
            : [...state.weekdays, weekday];

    commit("setWeekdays", newWeekdays);
}

/**
 * Updates the properties of the mobility data with the given geometry index
 *
 * @param {Object} context actions context object.
 * @param {Object} parameters contains the properties to update the mobility data
 * @param {number} parameters.geometryIndex the geometry index of the mobility data to update
 * @returns {void}
 */
function setMobilityDataProperties (
    {state, commit},
    {geometryIndex, ...props}
) {
    const newMobilityData = state.mobilityData.map(data => data.geometryIndex === geometryIndex ? {...data, ...props} : data
        ),
        {feature, mobilityMode} = props;

    if (feature && mobilityMode) {
        // Update the mobility mode also in the map feature
        feature.set("mobilityMode", mobilityMode);
    }

    // Update the mobility data state
    commit("setMobilityData", newMobilityData);
}

/**
 * Sets the summary for the current drawing.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the summary.
 * @returns {void}
 */
function setSummary ({commit}, event) {
    commit("setSummary", event.target.value);
}

/**
 * Highlights the mobility data feature with the given geometry index.
 *
 * @param {Object} context actions context object.
 * @param {number} geometryIndex the geometry index of the feature to select
 * @returns {void}
 */
function selectMobilityDataFeature ({state}, geometryIndex) {
    for (const data of state.mobilityData) {
        const isSelected = data.geometryIndex === geometryIndex;

        data.feature.set("isSelected", isSelected);
    }
}

/**
 * Adds the feature information to the mobility data in store
 * Selects the newly added mobility data feature
 *
 * @param {Object} context actions context object.
 * @param {module:ol/Feature} feature to render
 * @returns {void}
 */
function addFeatureToMobilityData ({state, commit, dispatch}, feature) {
    const geometryIndex = getNextGeometryIndex(state.mobilityData);

    // Sets the id for the new mobility data feature
    feature.setId(geometryIndex);

    commit("setMobilityData", [
        ...state.mobilityData,
        {
            feature,
            geometryIndex,
            mobilityMode: feature.get("mobilityMode")
        }
    ]);
    dispatch("selectMobilityDataFeature", geometryIndex);
}

/**
 * Adds a new location to the mobility data in store
 *
 * @param {Object} context actions context object.
 * @param {number} index the mobility data index to add the location
 * @returns {void}
 */
function addLocationToMobilityData ({state, commit, dispatch}, index) {
    const feature = new Feature(),
        geometryIndex = getNextGeometryIndex(state.mobilityData),
        newLocation = {
            feature,
            geometryIndex,
            mobilityMode: mobilityModes.POI
        },
        newMobilityData = [...state.mobilityData];

    // Sets the id and mobility mode for the new mobility data location
    feature.setId(geometryIndex);
    feature.set("mobilityMode", mobilityModes.POI);

    // Add location ad the given index
    newMobilityData.splice(index, 0, newLocation);

    commit("setMobilityData", newMobilityData);
    dispatch("selectMobilityDataFeature", geometryIndex);
    dispatch("startDrawingMobilityDataLocation", geometryIndex);
}

/**
 * Deletes a mobility data feature from store
 *
 * @param {Object} context actions context object.
 * @param {number} geometryIndex the geometry index of the mobility data to delete
 * @returns {void}
 */
function deleteMobilityDataFeature ({state, commit, dispatch}, geometryIndex) {
    const source = state.mobilityDataLayer.getSource(),
        mapFeature = source.getFeatureById(geometryIndex),
        newMobilityData = state.mobilityData.filter(
            data => data.geometryIndex !== geometryIndex
        );

    // Remove the feature from the map
    if (mapFeature) {
        source.removeFeature(mapFeature);
    }

    // Update the mobility data state
    commit("setMobilityData", newMobilityData);

    // Unselect the mobility data feature
    dispatch("selectMobilityDataFeature");
}

export default {
    initializeDailyRoutineView,
    cleanUpDailyRoutineView,
    setMobilityMode,
    toggleWeekday,
    setMobilityDataProperties,
    setSummary,
    selectMobilityDataFeature,
    addFeatureToMobilityData,
    addLocationToMobilityData,
    deleteMobilityDataFeature
};
