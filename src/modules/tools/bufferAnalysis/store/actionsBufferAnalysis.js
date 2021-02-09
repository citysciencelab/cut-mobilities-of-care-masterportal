import VectorSource from "ol/source/Vector.js";
import {Vector as VectorLayer} from "ol/layer";
import {GeoJSON} from "ol/format.js";
import Feature from "ol/Feature";
import {ResultType} from "./enums";
import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";

const actions = {
    /**
     * Injects OpenLayers geom classes to JSTS Parser
     *
     * @param {Object} context - context object for actions
     *
     * @returns {void}
     */
    initJSTSParser ({getters}) {
        // inject possible geometries to jsts parser
        getters.jstsParser.inject(
            Point,
            LineString,
            LinearRing,
            Polygon,
            MultiPoint,
            MultiLineString,
            MultiPolygon
        );
    },
    loadSelectOptions ({commit}) {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"}) || [];

        layers.forEach(layer => {
            if (layer.get("layerSource").getFeatures().length > 100) {
                layer.set("performanceWarning", true);
            }
            commit("addSelectOption", layer);
        });
    },
    /**
     * Triggers several actions to check for intersections.
     * Includes checks between created buffers and features of selected target layer
     * Also checks again for intersections between buffers and intersection polygons
     * Finally adds new intersection features to map
     *
     * @param {Object} context - context object for actions
     *
     * @return {void}
     */
    async checkIntersection ({getters, dispatch}) {
        const bufferFeatures = getters.bufferLayer.getSource().getFeatures();

        dispatch("areLayerFeaturesLoaded", getters.selectedTargetLayer.get("id")).then(() => {
            dispatch("checkIntersectionWithBuffers", bufferFeatures);
            dispatch("checkIntersectionsWithIntersections", bufferFeatures);
            dispatch("convertIntersectionsToPolygons");
            dispatch("addNewFeaturesToMap");
        });
    },
    /**
     * Creates and shows buffers associated to features of selected source layer
     *
     * @param {Object} context - context object for actions
     *
     * @return {void}
     */
    showBuffer ({commit, getters, rootGetters}) {
        // get features from selected layer
        const features = getters.selectedSourceLayer.get("layerSource").getFeatures(),
            // create new source for buffer layer
            vectorSource = new VectorSource();

        // add new buffer layer to state
        commit("setBufferLayer", new VectorLayer({
            source: vectorSource
        }));

        features.forEach(feature => {
            // parse feature geometry with jsts
            const jstsGeom = getters.jstsParser.read(feature.getGeometry()),
                // calculate buffer with selected buffer radius
                buffered = jstsGeom.buffer(getters.bufferRadius),
                // create new feature with reconverted geometry
                newFeature = new Feature({
                    geometry: getters.jstsParser.write(buffered),
                    name: "Buffers"
                });

            // set configured style
            newFeature.setStyle(getters.bufferStyle);
            // remember origin feature
            newFeature.set("originFeature", feature);
            // add new feature to source
            vectorSource.addFeature(newFeature);
        });
        // add new layer with buffers to map
        rootGetters["Map/map"].addLayer(getters.bufferLayer);
    },
    /**
     * Removes generated result layer and buffer layer
     * Also unsets the intersections and result features arrays
     *
     * @param {Object} context - context object for actions
     *
     * @return {void}
     */
    removeGeneratedLayers ({getters, rootGetters, commit}) {
        rootGetters["Map/map"].removeLayer(getters.resultLayer);
        commit("setResultLayer", null);
        rootGetters["Map/map"].removeLayer(getters.bufferLayer);
        commit("setBufferLayer", null);
        commit("setIntersections", []);
        commit("setResultFeatures", []);
    },
    /**
     * Resets the module to default settings
     * Also restores the opacity for selected source and target layers
     *
     * @param {Object} context - context object for actions
     *
     * @return {void}
     */
    resetModule ({getters, commit, dispatch}) {
        commit("setBufferRadius", 0);

        if (getters.selectedSourceLayer) {
            getters.selectedSourceLayer.get("layer").setOpacity(1);
        }

        if (getters.selectedTargetLayer) {
            getters.selectedTargetLayer.get("layer").setOpacity(1);
        }
        dispatch("applySelectedSourceLayer", null);
        dispatch("applySelectedTargetLayer", null);
        dispatch("removeGeneratedLayers");
    },
    /**
     * Selects given layer by object or ID
     * Also unselects all previous selected layers and
     * shows buffers if a buffer radius was provided previously
     *
     * @param {Object} context - context object for actions
     * @param {Object|String} selectedSourceLayer - layer object or ID string to select corresponding layer
     *
     * @throws Error
     * @return {void}
     */
    applySelectedSourceLayer ({commit, dispatch, getters}, selectedSourceLayer) {
        // unselect target layer if it is already selected
        if (getters.selectedTargetLayer) {
            getters.selectedTargetLayer.setIsSelected(false);
            commit("setSelectedTargetLayer", null);
        }

        let selectedLayer = selectedSourceLayer;

        // find the layer in select options if selected layer is provided by id
        if (typeof selectedLayer === "string") {
            // selectedLayer = rootGetters["Tools/BufferAnalysis/selectOptions"].find(item => item.id === selectedLayer);
            selectedLayer = getters.selectOptions.find(item => item.id === selectedLayer);
        }

        // select only the new source layer and deselect all previous selected layers
        if (selectedLayer) {
            getters.selectOptions.forEach(option => {
                option.setIsSelected(selectedLayer.get("id") === option.get("id"));
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
    },
    /**
     * Selects given layer by object or ID
     * triggers also the intersection check action
     *
     * @param {Object} context - context object for actions
     * @param {Object|String} selectedTargetLayer - layer object or ID string to select corresponding layer
     *
     * @throws Error
     * @return {void}
     */
    applySelectedTargetLayer ({getters, commit, dispatch}, selectedTargetLayer) {
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
    },
    /**
     * Applies the input buffer radius which triggers the show buffer action
     *
     * @param {Object} context - context object for actions
     * @param {Number} selectedBufferRadius - layer object or ID string to select corresponding layer
     *
     * @return {void}
     */
    applyBufferRadius ({commit, dispatch}, selectedBufferRadius) {
        // remove previous generated layers and show buffer only when a truthy value is provided
        commit("setBufferRadius", selectedBufferRadius);
        if (selectedBufferRadius) {
            dispatch("removeGeneratedLayers");
            dispatch("showBuffer");
        }
    },
    /**
     * Checks intersections between buffers and features of the selected target layer
     * Also triggers the actions to create intersection polygons and to add the new intersection result features
     *
     * @param {Object} context - context object for actions
     * @param {Array} bufferFeatures - array with buffer features
     *
     * @return {void}
     */
    checkIntersectionWithBuffers ({getters, dispatch, commit}, bufferFeatures) {
        const targetFeatures = getters.selectedTargetLayer.get("layerSource").getFeatures();

        targetFeatures.forEach(targetFeature => {
            const targetGeometry = targetFeature.getGeometry(),
                foundIntersection = bufferFeatures.some(bufferFeature => {
                    const sourceGeometry = bufferFeature.getGeometry(),
                        // check if buffer origin feature is the same as the target feature
                        sameFeature = bufferFeature.get("originFeature").getId() === targetFeature.getId(),
                        sourcePoly = getters.jstsParser.read(sourceGeometry),
                        targetPoly = getters.jstsParser.read(targetGeometry);

                    // points do not need parsing
                    if (targetGeometry.getType() === "Point" &&
                        sourceGeometry.intersectsCoordinate(targetGeometry.getCoordinates()) &&
                        !sameFeature) {
                        return true;
                    }

                    // check for intersections
                    if (sourcePoly.intersects(targetPoly) && !sameFeature) {
                        dispatch("generateIntersectionPolygon", {
                            properties: targetFeature.getProperties(),
                            sourcePoly,
                            targetPoly
                        });
                        return getters.resultType !== ResultType.WITHIN;
                    }

                    return false;
                });

            // only add target feature due to selected result type
            if (!foundIntersection && getters.resultType === ResultType.OUTSIDE ||
                foundIntersection && getters.resultType === ResultType.WITHIN) {
                commit("addResultFeature", targetFeature);
            }
        });
    },
    /**
     * Calculates based on selected result type the intersection/difference between source and target polygon
     * and adds the calculated polygon to the intersections array.
     * Also transfers the given properties to the new polygon.
     *
     * @param {Object} context - context actions object
     * @param {Object} payload - payload for the action
     * @param {Polygon} payload.sourcePoly - source polygon
     * @param {Polygon} payload.targetPoly - target polygon
     * @param {Object} payload.properties - properties to be transferred
     *
     * @returns {void}
     */
    generateIntersectionPolygon ({getters, commit}, {sourcePoly, targetPoly, properties = {}}) {
        let subsetPoly;

        // calculate subset polygon due to selected result type
        if (getters.resultType === ResultType.WITHIN) {
            subsetPoly = sourcePoly.intersection(targetPoly);
        }
        else {
            subsetPoly = targetPoly.difference(sourcePoly);
        }
        subsetPoly.properties = properties;
        // add poly to intersections array
        commit("addIntersectionPolygon", subsetPoly);
    },
    /**
     * Checks intersections between buffers and already calculated intersections
     * Also triggers the action to create a new intersection polygon and removes the previous calculated intersection
     *
     * @param {Object} context - context object for actions
     * @param {Array} bufferFeatures - array with features
     *
     * @return {void}
     */
    checkIntersectionsWithIntersections ({getters, dispatch}, bufferFeatures) {
        bufferFeatures.forEach(buffer => {
            getters.intersections.forEach((intersection, key, object) => {
                const sourceGeometry = buffer.getGeometry(),
                    sourcePoly = getters.jstsParser.read(sourceGeometry);

                if (sourcePoly.intersects(intersection)) {
                    dispatch("generateIntersectionPolygon", {properties: intersection.properties, sourcePoly, targetPoly: intersection});
                    object.splice(key, 1);
                }
            });
        });
    },
    /**
     * Converts intersection polygons to Open layers features
     *
     * @param {Object} context - context object for actions
     *
     * @return {void}
     */
    convertIntersectionsToPolygons ({getters, commit}) {
        if (getters.intersections.length) {
            getters.intersections.forEach(intersection => {
                const geojsonFormat = new GeoJSON(),
                    newFeature = geojsonFormat.readFeature({
                        type: "Feature",
                        properties: intersection.properties,
                        geometry: getters.geoJSONWriter.write(intersection)
                    });

                commit("addResultFeature", newFeature);
            });
        }
    },
    /**
     * Creates a new layer for the result features and adds it to the map
     * Style and GFI config is transferred from target layer
     *
     * @param {Object} context - context object for actions
     *
     * @return {void}
     */
    addNewFeaturesToMap ({getters, commit, rootGetters}) {
        // check if there are result features in array
        if (getters.resultFeatures.length) {
            // create new vector source and get gfi attributes
            const vectorSource = new VectorSource(),
                gfiAttributes = getters.selectedTargetLayer.get("gfiAttributes");

            // set new vector layer to state with same style as target layer
            commit("setResultLayer", new VectorLayer({
                source: vectorSource,
                style: getters.selectedTargetLayer.get("style")
            }));

            // add result features to new vector source
            vectorSource.addFeatures(getters.resultFeatures);
            // apply gfi attributes to new vector layer
            getters.resultLayer.set("gfiAttributes", gfiAttributes);
            // add new layer to map
            rootGetters["Map/map"].addLayer(getters.resultLayer);
        }
        // reduce opacity for source, target and buffer layers
        const targetOlLayer = getters.selectedTargetLayer.get("layer"),
            sourceOlLayer = getters.selectedSourceLayer.get("layer");

        targetOlLayer.setOpacity(targetOlLayer.getOpacity() * 0.5);
        sourceOlLayer.setOpacity(sourceOlLayer.getOpacity() * 0.5);
        getters.bufferLayer.setOpacity(0.5);
    },
    /**
     * Verifies if all features of a given layerId are loaded
     * and waits if the layer has not been loaded previously
     *
     * @param {Object} context - context object for actions
     * @param {String} layerId - the layer ID to check loaded status
     *
     * @return {void}
     */
    async areLayerFeaturesLoaded ({rootGetters, commit}, layerId) {
        await new Promise(resolve => {
            if (rootGetters["Map/loadedLayers"].find(id => id === layerId)) {
                resolve();
            }
            const channel = Radio.channel("VectorLayer");

            channel.on({"featuresLoaded": id => {
                commit("Map/addLoadedLayerId", id, {root: true});
                if (id === layerId) {
                    resolve();
                }
            }});
        });
    }
};

export default actions;
