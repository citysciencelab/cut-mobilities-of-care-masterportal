import stateMap from "./state";
import {generateSimpleGetters} from "../../../app-store/utils/generators";
import {createGfiFeature} from "./actions/getWmsFeaturesByMimeType.js";
import {getGfiFeaturesByTileFeature} from "./actions/getGfiFeaturesByTileFeature.js";

const gettersMap = {
    ...generateSimpleGetters(stateMap),

    /**
     * gets all visible layers
     * @param {Object} state - the map state
     * @param {Object[]} state.layerList - all avaible layers in the map
     * @returns {Object[]} all visible layers
     */
    visibleLayerList: ({layerList}) => {
        return layerList.filter(layer => layer.getVisible());
    },

    /**
     * gets all visible wms layers
     * @param {Object} state - the map state
     * @param {Object} getters - the map getters
     * @param {Object[]} getters.visibleLayerList - all visible layers in the map
     * @returns {Object[]} all visible wms layers
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
     * gets all visible wms layers at the current resolution
     * @param {Object} state - the map state
     * @param {Object} getters - the map getters
     * @param {Object[]} getters.visibleWmsLayerList - all visible wms layers in the map
     * @returns {Object[]} all visible wms layers at the current resolution
     */
    visibleWmsLayerListAtResolution: (state, {visibleWmsLayerList, resolution}) => {
        return visibleWmsLayerList.filter(layer => {
            return resolution <= layer.get("maxResolution") && resolution >= layer.get("minResolution");
        });
    },

    /**
     * gets the features at the given pixel for the gfi
     * @param {object} state - the map state
     * @param {object} state.map - the openlayers map
     * @param {number[]} state.clickPixel - the pixel coordinate of the click event
     * @returns {object[]} gfi features
     */
    gfiFeaturesAtPixel: (state, {map, map3d, clickPixel}) => {
        const featuresAtPixel = [];

        map.forEachFeatureAtPixel(clickPixel, function (feature, layer) {
            if (layer.getVisible()) {
                // cluster feature
                if (feature.getProperties().features) {
                    feature.get("features").forEach(function (clusteredFeature) {
                        featuresAtPixel.push(createGfiFeature(
                            layer.get("name"),
                            layer.get("gfiTheme"),
                            layer.get("gfiAttributes"),
                            clusteredFeature.getProperties(),
                            layer.get("gfiFormat"),
                            clusteredFeature.getId()
                        ));
                    });
                }
                else {
                    featuresAtPixel.push(createGfiFeature(
                        layer.get("name"),
                        layer.get("gfiTheme"),
                        layer.get("gfiIconPath"),
                        layer.get("gfiAttributes"),
                        feature.getProperties(),
                        layer.get("gfiFormat"),
                        feature.getId()
                    ));
                }
            }
        });

        if (map3d && Array.isArray(clickPixel) && clickPixel.length === 2) {
            // add features from map3d
            const scene = map3d.getCesiumScene(),
                tileFeatures = scene.drillPick({x: clickPixel[0], y: clickPixel[1]});

            tileFeatures.forEach(tileFeature => {
                const gfiFeatures = getGfiFeaturesByTileFeature(tileFeature);

                if (Array.isArray(gfiFeatures)) {
                    gfiFeatures.forEach(gfiFeature => {
                        featuresAtPixel.push(gfiFeature);
                    });
                }
            });
        }

        return featuresAtPixel;
    },

    /**
     * @param {Object} s state
     * @returns {Boolean} true if map is not in initial zoom/center
     */
    hasMoved: ({map, initialZoomLevel, initialCenter}) => {
        const view = map.getView(),
            center = view.getCenter();

        return initialCenter[0] !== center[0] ||
            initialCenter[1] !== center[1] ||
            initialZoomLevel !== view.getZoom();
    },
    /**
     * @param {Object} _ state
     * @param {Object} g getters
     * @returns {Function} layer getter by id
     */
    layerById: (_, g) => id => g.layers[id],
    /**
     * @param {Object} _ state
     * @param {Object} g getters
     * @returns {Boolean} whether current zoom level is the maximum zoom level
     */
    maximumZoomLevelActive: (_, g) => g.zoomLevel >= g.maxZoomLevel,
    /**
     * @param {Object} _ state
     * @param {Object} g getters
     * @returns {Boolean} whether current zoom level is the minimal zoom level
     */
    minimumZoomLevelActive: (_, g) => g.zoomLevel <= g.minZoomLevel,
    /**
     * @param {Object} _ state
     * @param {Object} params getter parameters
     * @param {Object} params.scale x from computed scale value 1:x
     * @returns {String} pretty-printed scale to 2cms
     */
    scaleWithUnit: (_, {scale}) => {
        const scaleNumber = Math.round(0.02 * scale);

        return scaleNumber >= 1000 ? `${Math.round(scaleNumber / 100) / 10} km` : `${scaleNumber} m`;
    },
    /**
     * @param {Object} _ state
     * @param {Object} params getter parameters
     * @param {Object} params.scale x from computed scale value 1:x
     * @returns {String} pretty-printed scale to 2cms
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
     * @param {Object} _ state
     * @param {Object} params getter parameters
     * @param {Object} params.scale x from computed scale value 1:x
     * @returns {String} pretty-printed scale to 2cms
     */
    prettyMouseCoord: (_, {mouseCoord}) => mouseCoord ? `${mouseCoord[0].toString().substr(0, 9)}, ${mouseCoord[1].toString().substr(0, 10)}` : "",
    projectionCode: (_, g) => g.projection?.getCode(),
    projectionMetersPerUnit: (_, g) => g.projection?.getMetersPerUnit(),
    projectionUnits: (_, g) => g.projection?.getUnits()
};

export default gettersMap;
