import VectorSource from "ol/source/Vector";
import {Vector as VectorLayer} from "ol/layer";
import {GeoJSON} from "ol/format";
import Feature from "ol/Feature";
import {ResultType} from "./enums";
import * as setters from "./settersBufferAnalysis";
import * as initializers from "./initializersBufferAnalysis";

const actions = {
    ...initializers,
    ...setters,
    /**
     * Dispatches the action to copy the given element to the clipboard.
     *
     * @param {Element} el element to copy
     * @returns {void}
     */
    copyToClipboard ({dispatch}, el) {
        dispatch("copyToClipboard", el, {root: true});
    },
    /**
     * Triggers several actions to check for intersections.
     * Includes checks between created buffers and features of selected target layer
     * Also checks again for intersections between buffers and intersection polygons
     * Finally adds new intersection features to map
     *
     * @return {void}
     */
    checkIntersection ({dispatch, getters: {selectedTargetLayer, bufferLayer}}) {
        dispatch("areLayerFeaturesLoaded", selectedTargetLayer.get("id")).then(() => {
            const bufferFeatures = bufferLayer.getSource().getFeatures();

            dispatch("checkIntersectionWithBuffers", bufferFeatures);
            dispatch("checkIntersectionsWithIntersections", bufferFeatures);
            dispatch("convertIntersectionsToPolygons");
            dispatch("addNewFeaturesToMap");
        });
    },
    /**
     * Creates and shows buffers associated to features of selected source layer
     *
     * @return {void}
     */
    showBuffer ({commit, rootGetters, getters: {selectedSourceLayer, jstsParser, bufferRadius, bufferStyle}}) {
        // get features from selected layer
        const features = selectedSourceLayer.get("layerSource").getFeatures(),
            // create new source for buffer layer
            vectorSource = new VectorSource(),
            bufferLayer = new VectorLayer({
                source: vectorSource
            });

        // add new buffer layer to state
        commit("setBufferLayer", bufferLayer);
        features.forEach(feature => {
            // parse feature geometry with jsts
            const jstsGeom = jstsParser.read(feature.getGeometry()),
                // calculate buffer with selected buffer radius
                buffered = jstsGeom.buffer(bufferRadius),
                // create new feature with reconverted geometry
                newFeature = new Feature({
                    geometry: jstsParser.write(buffered),
                    name: "Buffers"
                });

            // set configured style
            newFeature.setStyle(bufferStyle);
            // remember origin feature
            newFeature.set("originFeature", feature);
            // add new feature to source
            vectorSource.addFeature(newFeature);
        });
        // add new layer with buffers to map
        rootGetters["Map/map"].addLayer(bufferLayer);
    },
    /**
     * Removes generated result layer and buffer layer
     * Also unsets the intersections and result features arrays
     *
     * @return {void}
     */
    removeGeneratedLayers ({commit, rootGetters, getters: {resultLayer, bufferLayer}}) {
        rootGetters["Map/map"].removeLayer(resultLayer);
        commit("setResultLayer", null);
        rootGetters["Map/map"].removeLayer(bufferLayer);
        commit("setBufferLayer", null);
        commit("setIntersections", []);
        commit("setResultFeatures", []);
    },
    /**
     * Resets the module to default settings
     * Also restores the opacity for selected source and target layers
     *
     * @return {void}
     */
    resetModule ({commit, dispatch, getters: {selectedSourceLayer, selectedTargetLayer}}) {
        commit("setBufferRadius", 0);

        if (selectedSourceLayer) {
            selectedSourceLayer.get("layer").setOpacity(1);
        }

        if (selectedTargetLayer) {
            selectedTargetLayer.get("layer").setOpacity(1);
        }
        dispatch("applySelectedSourceLayer", null);
        dispatch("applySelectedTargetLayer", null);
        dispatch("removeGeneratedLayers");
    },
    /**
     * Checks intersections between buffers and features of the selected target layer
     * Also triggers the actions to create intersection polygons and to add the new intersection result features
     *
     * @param {Array} bufferFeatures - array with buffer features
     *
     * @return {void}
     */
    checkIntersectionWithBuffers ({commit, dispatch, getters: {selectedTargetLayer, jstsParser, resultType}}, bufferFeatures) {
        const targetFeatures = selectedTargetLayer.get("layerSource").getFeatures();

        targetFeatures.forEach(targetFeature => {
            const targetGeometry = targetFeature.getGeometry(),
                foundIntersection = bufferFeatures.some(bufferFeature => {
                    const sourceGeometry = bufferFeature.getGeometry(),
                        // check if buffer origin feature is the same as the target feature
                        sameFeature = bufferFeature.get("originFeature").getId() === targetFeature.getId(),
                        sourcePoly = jstsParser.read(sourceGeometry),
                        targetPoly = jstsParser.read(targetGeometry);

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
                        return resultType !== ResultType.WITHIN;
                    }

                    return false;
                });

            // only add target feature due to selected result type
            if (!foundIntersection && resultType === ResultType.OUTSIDE ||
                foundIntersection && resultType === ResultType.WITHIN) {
                commit("addResultFeature", targetFeature);
            }
        });
    },
    /**
     * Calculates based on selected result type the intersection/difference between source and target polygon
     * and adds the calculated polygon to the intersections array.
     * Also transfers the given properties to the new polygon.
     *
     * @param {Object} payload - payload for the action
     * @param {Polygon} payload.sourcePoly - source polygon
     * @param {Polygon} payload.targetPoly - target polygon
     * @param {Object} [payload.properties = {}] - properties to be transferred
     *
     * @returns {void}
     */
    generateIntersectionPolygon ({commit, getters: {resultType}}, {sourcePoly, targetPoly, properties = {}}) {
        // calculate subset polygon due to selected result type
        const subsetPoly = resultType === ResultType.WITHIN ? sourcePoly.intersection(targetPoly) : targetPoly.difference(sourcePoly);

        subsetPoly.properties = properties;
        // add poly to intersections array
        commit("addIntersectionPolygon", subsetPoly);
    },
    /**
     * Checks intersections between buffers and already calculated intersections
     * Also triggers the action to create a new intersection polygon and removes the previous calculated intersection
     *
     * @param {Array} bufferFeatures - array with features
     *
     * @return {void}
     */
    checkIntersectionsWithIntersections ({dispatch, getters: {intersections, jstsParser, resultType}}, bufferFeatures) {
        bufferFeatures.forEach(buffer => {
            intersections.forEach((intersection, key, thisArray) => {
                const sourceGeometry = buffer.getGeometry(),
                    sourcePoly = jstsParser.read(sourceGeometry);

                if (sourcePoly.intersects(intersection)) {
                    dispatch("generateIntersectionPolygon", {properties: intersection.properties, sourcePoly, targetPoly: intersection});

                    if (resultType === ResultType.OUTSIDE) {
                        thisArray.splice(key, 1);
                    }
                }
            });
        });
    },
    /**
     * Converts intersection polygons to Open layers features
     *
     * @return {void}
     */
    convertIntersectionsToPolygons ({commit, getters: {intersections, geoJSONWriter}}) {
        if (intersections.length) {
            intersections.forEach(intersection => {
                const geojsonFormat = new GeoJSON(),
                    newFeature = geojsonFormat.readFeature({
                        type: "Feature",
                        properties: intersection.properties,
                        geometry: geoJSONWriter.write(intersection)
                    });

                commit("addResultFeature", newFeature);
            });
        }
    },
    /**
     * Creates a new layer for the result features and adds it to the map
     * Style and GFI config is transferred from target layer
     *
     * @return {void}
     */
    addNewFeaturesToMap ({commit,
        rootGetters,
        getters: {
            resultFeatures,
            selectedTargetLayer,
            selectedSourceLayer,
            bufferLayer
        }}) {
        // check if there are result features in array
        if (resultFeatures.length) {
            // create new vector source and get gfi attributes
            const vectorSource = new VectorSource(),
                gfiAttributes = selectedTargetLayer.get("gfiAttributes"),
                resultLayer = new VectorLayer({
                    source: vectorSource,
                    style: selectedTargetLayer.get("style")
                });

            // set new vector layer to state with same style as target layer
            commit("setResultLayer", resultLayer);

            // add result features to new vector source
            vectorSource.addFeatures(resultFeatures);
            // apply gfi attributes to new vector layer
            resultLayer.set("gfiAttributes", gfiAttributes);
            // add new layer to map
            rootGetters["Map/map"].addLayer(resultLayer);
        }
        // reduce opacity for source, target and buffer layers
        const targetOlLayer = selectedTargetLayer.get("layer"),
            sourceOlLayer = selectedSourceLayer.get("layer");

        targetOlLayer.setOpacity(targetOlLayer.getOpacity() * 0.5);
        sourceOlLayer.setOpacity(sourceOlLayer.getOpacity() * 0.5);
        bufferLayer.setOpacity(0.5);
    },
    /**
     * Verifies if all features of a given layerId are loaded
     *
     * @return {void}
     */
    buildUrlFromToolState ({commit, getters: {selectedSourceLayer, bufferRadius, resultType, selectedTargetLayer, id}}) {
        const toolState = {
            applySelectedSourceLayer: selectedSourceLayer.id,
            applyBufferRadius: bufferRadius,
            setResultType: resultType,
            applySelectedTargetLayer: selectedTargetLayer.id
        };

        commit("setSavedUrl", location.origin +
            location.pathname +
            "?isinitopen=" +
            id +
            "&initvalues=" +
            JSON.stringify(toolState));
    },
    /**
     * Verifies if all features of a given layerId are loaded
     * and waits if the layer has not been loaded previously
     *
     * @param {String} layerId - the layer ID to check loaded status
     *
     * @return {void}
     */
    async areLayerFeaturesLoaded ({commit, rootGetters}, layerId) {
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
