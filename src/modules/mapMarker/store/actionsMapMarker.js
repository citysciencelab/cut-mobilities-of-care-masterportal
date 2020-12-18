import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";
import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";

/**
 * @const {String} configPaths an array of possible config locations. First one found will be used
 * @const {Object} actions vue actions
 */
const configPaths = [
    "configJs.mapMarker"
];

export default {
    /**
     * Sets the config-params of this mapMarker into state.
     * @param {Object} context The context Vue instance.
     * @returns {Boolean} false, if config does not contain the mapMarker.
     */
    initialize: context => {
        return fetchFirstModuleConfig(context, configPaths, "MapMarker", false);
    },

    /**
     * Checks if the MapMarker should be set initially by the url param "marker".
     * @returns {void}
     */
    activateByUrlParam: ({rootState, dispatch}) => {
        if (rootState.queryParams instanceof Object && rootState?.queryParams?.marker) {
            const coordinates = rootState.queryParams.marker.split(",");

            dispatch("placingPointMarker", coordinates.map(coordinate => parseFloat(coordinate, 10)));
        }
    },

    /**
     * With this function the coordinate, which has to be marked by the mapMarker, is written to the MapMarker state.
     * @param {String[]} value The array with the markable coordinate pair.
     * @returns {void}
     */
    placingPointMarker ({state, commit, dispatch}, value) {
        const styleListModel = Radio.request("StyleList", "returnModelById", state.pointStyleId);

        dispatch("removePointMarker");

        if (styleListModel) {
            const iconfeature = new Feature({
                    geometry: new Point(value)
                }),
                featureStyle = styleListModel.createStyle(iconfeature, false);

            iconfeature.setStyle(featureStyle);
            commit("addFeatureToMarker", {feature: iconfeature, marker: "markerPoint"});
            commit("setVisibilityMarker", {visibility: true, marker: "markerPoint"});
            commit("Map/addLayerToMap", state.markerPoint, {root: true});
        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.noStyleModel", {styleId: state.pointStyleId}), {root: true});
        }
    },

    /**
     * This function has the task to remove the coordinate from the mapMarker state.
     * This is necessary / triggered if the MapMarker should be removed.
     * @returns {void}
     */
    removePointMarker ({state, commit}) {
        commit("Map/removeLayerFromMap", state.markerPoint, {root: true});
        commit("clearMarker", "markerPoint");
        commit("setVisibilityMarker", {visbility: false, marker: "markerPoint"});
    },

    /**
     * Converts polygon to the wkt format and add this to the map.
     * @param {ol/Feature} feature The ol feature that is added to the map.
     * @returns {void}
     */
    placingPolygonMarker ({state, commit, dispatch}, feature) {
        const styleListModel = Radio.request("StyleList", "returnModelById", state.polygonStyleId);

        dispatch("removePolygonMarker");

        if (styleListModel) {
            const featureStyle = styleListModel.createStyle(feature, false);

            feature.setStyle(featureStyle);
            commit("addFeatureToMarker", {feature: feature, marker: "markerPolygon"});
            commit("setVisibilityMarker", {visibility: true, marker: "markerPolygon"});
            commit("Map/addLayerToMap", state.markerPolygon, {root: true});
        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.noStyleModel", {styleId: state.polygonStyleId}), {root: true});
        }
    },

    /**
     * Removes the polygon map marker from the map.
     * @returns {void}
     */
    removePolygonMarker: function ({state, commit}) {
        commit("Map/removeLayerFromMap", state.markerPolygon, {root: true});
        commit("clearMarker", "markerPolygon");
        commit("setVisibilityMarker", {visbility: false, marker: "markerPolygon"});
    }
};
