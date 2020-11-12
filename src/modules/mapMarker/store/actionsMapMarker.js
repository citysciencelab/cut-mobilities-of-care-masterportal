import mapMarkerState from "../../mapMarker/store/stateMapMarker";
import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";
import {getWKTGeom} from "../../../utils/getWKTGeom";
import map from "../../map/store/indexMap";

// Path array of possible config locations. First one found will be used.
const configPaths = [
    "configJs.mapMarker"
];

export default {
    initialize: context => {
        const configFetchSuccess = fetchFirstModuleConfig(context, configPaths, "MapMarker", false);

        if (!configFetchSuccess) {
            // insert fallback: recursive config dearch for backwards compatibility
            // see helpers.js@fetchFirstModuleConfig() for alternative place for this
        }

        // In case we need more than one config, we need to call fetchFirstModuleConfig() more than once.
        /*
        const additionalConfigFetchSuccess = fetchFirstModuleConfig(rootState, additionalConfigPaths, "Alerting");

        if (!additionalConfigFetchSuccess) {
            ...
        }
        */
    },
    /**
     * With this function the coordinate, which has to be marked by the MapMarker, is written to the MapMarker state.
     * @param {Array} state - the state.
     * @param {Array} value - the array with the markable coordinate pair.
     * @returns {void} returns nothing.
     */
    placingPointMarker (state, value = []) {
        if (Array.isArray(value)) {
            mapMarkerState.resultToMark = [];
            mapMarkerState.resultToMark = value;
        }
        else {
            mapMarkerState.resultToMark = [];
        }
    },
    /**
     * This function has the task to remove the coordinate from the MapMarker state.
     * This is necessary / triggered if the MapMarker should be removed.
     * @returns {void} returns nothing.
     */
    removePointMarker () {
        mapMarkerState.resultToMark = [];
    },
    placingPolygonMarker (state, wktcontent) {
        mapMarkerState.wkt = getWKTGeom(wktcontent);
        mapMarkerState.markerPolygon.getSource().addFeature(mapMarkerState.wkt);
        mapMarkerState.markerPolygon.setVisible(true);
        map.state.map.addLayer(mapMarkerState.markerPolygon);
    },

    /**
     * Deletes the polygon
     * @return {void}
     */
    removePolygonMarker: function () {
        mapMarkerState.wkt = [];
        map.state.map.removeLayer(mapMarkerState.markerPolygon);
        mapMarkerState.markerPolygon.getSource().clear();
        mapMarkerState.markerPolygon.setVisible(false);
    }
};
