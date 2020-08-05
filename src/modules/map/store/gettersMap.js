import stateMap from "./state";
import {generateSimpleGetters} from "../../../app-store/utils/generators";

const gettersMap = {
    ...generateSimpleGetters(stateMap),

    /**
     * gets all visible layers
     * @param {object} state - the map state
     * @param {object[]} state.layerList - all avaible layers in the map
     * @returns {object[]} all visible layers
     */
    visibleLayerList: ({layerList}) => {
        return layerList.filter(layer => layer.getVisible());
    },

    /**
     * gets all visible wms layers
     * @param {object} state - the map state
     * @param {object} getters - the map getters
     * @param {object[]} getters.visibleLayerList - all visible layers in the map
     * @returns {object[]} all visible wms layers
     */
    visibleWmsLayerList: (state, {visibleLayerList}) => {
        const list = [];

        visibleLayerList.forEach(layer => {
            // Group Layer
            if (layer.get("layers")) {
                layer.get("layers").getArray().forEach(childLayer => {
                    if (childLayer.get("typ") === "WMS") {
                        list.push(childLayer);
                    }
                });
            }
            else if (layer.get("typ") === "WMS") {
                list.push(layer);
            }
        });
        return list;
    },

    /**
     * gets the features at the given pixel for the gfi
     * @param {object} state - the map state
     * @param {object} state.map - the openlayers map
     * @param {number[]} state.clickPixel - the pixel coordinate of the click event
     * @returns {object[]} gfi features
     */
    gfiFeaturesAtPixel: ({map, clickPixel}) => {
        const featuresAtPixel = [];

        map.forEachFeatureAtPixel(clickPixel, function (feature, layer) {
            // cluster feature
            if (feature.getProperties().features) {
                feature.get("features").forEach(function (clusteredFeature) {
                    featuresAtPixel.push({
                        html: null,
                        theme: layer.get("gfiTheme"),
                        title: layer.get("name"),
                        attributesToShow: layer.get("gfiAttributes"),
                        olFeatures: clusteredFeature
                    });
                });
            }
            else {
                featuresAtPixel.push({
                    html: null,
                    theme: layer.get("gfiTheme"),
                    title: layer.get("name"),
                    attributesToShow: layer.get("gfiAttributes"),
                    olFeatures: feature
                });
            }
        });
        return featuresAtPixel;
    },

    /**
     * @param {object} s state
     * @returns {boolean} true if map is not in initial zoom/center
     */
    hasMoved: ({map, initialZoomLevel, initialCenter}) => {
        const view = map.getView(),
            center = view.getCenter();

        return initialCenter[0] !== center[0] ||
            initialCenter[1] !== center[1] ||
            initialZoomLevel !== view.getZoom();
    },
    /**
     * @param {object} _ state
     * @param {object} g getters
     * @returns {function} layer getter by id
     */
    layerById: (_, g) => id => g.layers[id],
    /**
     * @param {object} _ state
     * @param {object} g getters
     * @returns {boolean} whether current zoom level is the maximum zoom level
     */
    maximumZoomLevelActive: (_, g) => g.zoomLevel >= g.maxZoomLevel,
    /**
     * @param {object} _ state
     * @param {object} g getters
     * @returns {boolean} whether current zoom level is the minimal zoom level
     */
    minimumZoomLevelActive: (_, g) => g.zoomLevel <= g.minZoomLevel,
    /**
     * @param {object} _ state
     * @param {object} params getter parameters
     * @param {object} params.scale x from computed scale value 1:x
     * @returns {string} pretty-printed scale to 2cms
     */
    scaleWithUnit: (_, {scale}) => {
        const scaleNumber = Math.round(0.02 * scale);

        return scaleNumber >= 1000 ? `${Math.round(scaleNumber / 100) / 10} km` : `${scaleNumber} m`;
    },
    /**
     * @param {object} _ state
     * @param {object} params getter parameters
     * @param {object} params.scale x from computed scale value 1:x
     * @returns {string} pretty-printed scale to 2cms
     */
    scaleToOne: (_, {scale}) => {
        if (scale > 10000) {
            return `1 : ${(Math.round(scale / 1000) * 1000).toLocaleString()}`;
        }
        else if (scale > 100) {
            return `1 : ${(Math.round(scale / 100) * 100).toLocaleString()}`;
        }
        return `1 : ${Math.round(scale).toLocaleString()}`;
    },
    /**
     * @param {object} _ state
     * @param {object} params getter parameters
     * @param {object} params.scale x from computed scale value 1:x
     * @returns {string} pretty-printed scale to 2cms
     */
    prettyMouseCoord: (_, {mouseCoord}) => mouseCoord ? `${mouseCoord[0].toString().substr(0, 9)}, ${mouseCoord[1].toString().substr(0, 10)}` : "",
    projectionCode: (_, g) => g.projection?.getCode(),
    projectionMetersPerUnit: (_, g) => g.projection?.getMetersPerUnit(),
    projectionUnits: (_, g) => g.projection?.getUnits()
};

export default gettersMap;
