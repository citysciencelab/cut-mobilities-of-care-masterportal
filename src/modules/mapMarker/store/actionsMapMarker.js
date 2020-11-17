import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";
import {getWKTGeom} from "../../../utils/getWKTGeom";
import {Stroke, Fill} from "ol/style.js";
import Style from "ol/style/Style";

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
     * Set the style for teh polygon.
     * @returns {void}
     */
    setPolygonStyle ({state, commit}) {
        const style = new Style({
            fill: new Fill({
                color: state.polygonStyle.fillColorPolygon
            }),
            stroke: new Stroke(state.polygonStyle.strokeStylePolygon)
        });

        commit("setPolygonStyle", style);
    },

    /**
     * With this function the coordinate, which has to be marked by the mapMarker, is written to the MapMarker state.
     * @param {String[]} value The array with the markable coordinate pair.
     * @returns {void}
     */
    placingPointMarker ({commit}, value = []) {
        commit("setResultToMark", []);

        if (Array.isArray(value)) {
            commit("setResultToMark", value);
        }
    },

    /**
     * This function has the task to remove the coordinate from the mapMarker state.
     * This is necessary / triggered if the MapMarker should be removed.
     * @returns {void}
     */
    removePointMarker ({commit}) {
        commit("setResultToMark", []);
    },

    /**
     * Converts polygon to the wkt format and add this to the map.
     * @param {String[]} wktcontent The polygon to highlight in the map.
     * @param {String} geometryType The type of geometry.
     * @returns {void}
     */
    placingPolygonMarker ({state, commit}, {wktcontent, geometryType}) {
        commit("addFeatureToMarkerPolygon", getWKTGeom(wktcontent, geometryType));
        commit("setVisibilityMarkerPolygon", true);
        commit("Map/addLayerToMap", state.markerPolygon, {root: true});
    },

    /**
     * Removes the polygon from the map.
     * @returns {void}
     */
    removePolygonMarker: function ({state, commit}) {
        commit("Map/removeLayerFromMap", state.markerPolygon, {root: true});
        commit("clearMarkerPolygon");
        commit("setVisibilityMarkerPolygon", false);
    }
};
