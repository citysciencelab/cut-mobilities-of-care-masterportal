import VectorSource from "ol/source/Vector.js";
import {Vector as VectorLayer} from "ol/layer";
import {GeoJSON} from "ol/format.js";
import Feature from "ol/Feature";
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
    checkIntersection ({state, commit, rootGetters}) {
        const resultFeatures = [],
            targetFeatures = state.selectedTargetLayer.get("layerSource").getFeatures(),
            bufferFeatures = state.bufferLayer.getSource().getFeatures(),
            intersections = [];

        for (const targetFeature of targetFeatures) {
            let foundIntersection = false;
            const targetGeometry = targetFeature.getGeometry();

            foundIntersection = bufferFeatures.some(bufferFeature => {
                const sourceGeometry = bufferFeature.getGeometry(),
                    // check if buffer origin feature is the same as the target feature
                    sameFeature = bufferFeature.get("originFeature").getId() === targetFeature.getId();

                if (targetGeometry.getType() === "Point") {
                    // points do not need parsing
                    if (sourceGeometry.intersectsCoordinate(targetGeometry.getCoordinates()) && !sameFeature) {
                        return true;
                    }
                }
                else {
                    // read geometries with jsts
                    const sourcePoly = state.parser.read(sourceGeometry),
                        targetPoly = state.parser.read(targetGeometry);

                    // check for intersections
                    if (sourcePoly.intersects(targetPoly) && !sameFeature) {
                        let subsetPoly,
                            found = false;

                        // calculate subset polygon due to selected result type
                        if (state.resultType) {
                            subsetPoly = sourcePoly.intersection(targetPoly);
                        }
                        else {
                            subsetPoly = targetPoly.difference(sourcePoly);
                            found = true;
                        }
                        subsetPoly.properties = targetFeature.getProperties();
                        // push poly to array
                        intersections.push(subsetPoly);
                        return found;

                    }
                }

                return false;
            });
            if (foundIntersection === state.resultType) {
                // only add target feature due to selected result type
                resultFeatures.push(targetFeature);
            }
        }

        bufferFeatures.forEach(buffer => {
            intersections.forEach((intersection, key, object) => {
                const sourceGeometry = buffer.getGeometry(),
                    sourcePoly = state.parser.read(sourceGeometry);

                if (sourcePoly.intersects(intersection)) {

                    let subsetPoly;

                    if (state.resultType) {
                        subsetPoly = sourcePoly.intersection(intersection);
                    }
                    else {
                        subsetPoly = intersection.difference(sourcePoly);
                    }
                    subsetPoly.properties = intersection.properties;
                    object.splice(key, 1);
                    intersections.push(subsetPoly);
                }
            });
        });

        if (intersections.length) {
            intersections.forEach(intersection => {
                const geojsonFormat = new GeoJSON(),
                    newFeature = geojsonFormat.readFeature({
                        type: "Feature",
                        properties: intersection.properties,
                        geometry: state.geoJSONWriter.write(intersection)
                    });

                resultFeatures.push(newFeature);
            });
        }
        // check if there are result features in array
        if (resultFeatures.length) {
            // create new vector source and get gfi attributes
            const vectorSource = new VectorSource(),
                gfiAttributes = state.selectedTargetLayer.get("gfiAttributes");

            // set new vector layer to state with same style as target layer
            commit("setResultLayer", new VectorLayer({
                source: vectorSource,
                style: state.selectedTargetLayer.get("style")
            }));

            // add result features to new vector source
            vectorSource.addFeatures(resultFeatures);
            // state.selectedTargetLayer.setIsSelected(false);
            // apply gfi attributes to new vector layer
            state.resultLayer.set("gfiAttributes", gfiAttributes);
            // add new layer to map
            rootGetters["Map/map"].addLayer(state.resultLayer);
            // reduce opacity for source, target and buffer layers
            state.selectedTargetLayer.get("layer").setOpacity(state.selectedTargetLayer.get("layer").getOpacity() * 0.5);
            state.selectedSourceLayer.get("layer").setOpacity(state.selectedSourceLayer.get("layer").getOpacity() * 0.5);
            state.bufferLayer.setOpacity(0.5);
        }
    },
    showBuffer ({state, commit, rootGetters}) {
        // get features from selected layer
        const features = state.selectedSourceLayer.get("layerSource").getFeatures(),
            // create new source for buffer layer
            vectorSource = new VectorSource();

        // add new buffer layer to state
        commit("setBufferLayer", new VectorLayer({
            source: vectorSource
        }));

        // inject possible geometries to jsts parser
        state.parser.inject(
            Point,
            LineString,
            LinearRing,
            Polygon,
            MultiPoint,
            MultiLineString,
            MultiPolygon
        );

        features.forEach(feature => {
            // parse feature geometry with jsts
            const jstsGeom = state.parser.read(feature.getGeometry()),
                // calculate buffer with selected buffer radius
                buffered = jstsGeom.buffer(state.bufferRadius),
                // create new feature with reconverted geometry
                newFeature = new Feature({
                    geometry: state.parser.write(buffered),
                    name: "Buffers"
                });

            // set configured style
            newFeature.setStyle(state.bufferLayerStyle);
            // remember origin feature
            newFeature.set("originFeature", feature);
            // add new feature to source
            vectorSource.addFeature(newFeature);
        });
        // add new layer with buffers to map
        rootGetters["Map/map"].addLayer(state.bufferLayer);
    },
    removeGeneratedLayers ({state, rootGetters}) {
        rootGetters["Map/map"].removeLayer(state.resultLayer);
        rootGetters["Map/map"].removeLayer(state.bufferLayer);
    },
    applySelectedSourceLayer ({state, commit, dispatch, rootGetters}, selectedSourceLayer) {
        // unselect target layer if it is already selected
        if (state.selectedTargetLayer) {
            state.selectedTargetLayer.setIsSelected(false);
            commit("setSelectedTargetLayer", null);
        }

        let selectedLayer = selectedSourceLayer;

        // find the layer in select options if selected layer is provided by id
        if (typeof selectedLayer === "string") {
            selectedLayer = rootGetters["Tools/BufferAnalysis/selectOptions"].find(item => item.id === selectedLayer);
        }

        // select only the new source layer and deselect all previous selected layers
        if (selectedLayer) {
            rootGetters["Tools/BufferAnalysis/selectOptions"].forEach(option => {
                option.setIsSelected(selectedLayer.get("id") === option.get("id"));
            });
        }
        // throw error if no selected layer is provided and it is not a valid null value
        else if (selectedLayer !== null) {
            throw new Error("ausgewählter quell layer nicht gefunden");
        }

        // remove previously generated layers and show buffer after a short timeout
        if (state.bufferRadius) {
            dispatch("removeGeneratedLayers");
            clearTimeout(state.timerId);
            state.timerId = setTimeout(() => {
                dispatch("showBuffer");
            }, 1000);
        }
        commit("setSelectedSourceLayer", selectedLayer);
    },
    applySelectedTargetLayer ({state, commit, dispatch}, selectedTargetLayer) {
        let selectedLayer = selectedTargetLayer;

        // find the layer in select options if selected layer is provided by id
        if (typeof selectedLayer === "string") {
            selectedLayer = state.selectOptions.find(item => item.id === selectedTargetLayer);
        }

        // select the new target layer and check for intersections
        if (selectedLayer) {
            selectedLayer.setIsSelected(selectedLayer.get("id"));
            setTimeout(() => {
                dispatch("checkIntersection");
            }, 1000);
        }
        // throw error if no selected layer is provided and it is not a valid null value
        else if (selectedLayer !== null) {
            throw new Error("ausgewählter ziel layer nicht gefunden");
        }
        commit("setSelectedTargetLayer", selectedLayer);
    },
    applyInputBufferRadius ({state, commit, dispatch}, selectedBufferRadius) {
        // remove previous generated layers and show buffer only when a truthy value is provided
        if (selectedBufferRadius) {
            dispatch("removeGeneratedLayers");
            clearTimeout(state.timerId);
            commit("setTimerId", setTimeout(() => {
                dispatch("showBuffer");
            }, 1000));
        }
        commit("setBufferRadius", selectedBufferRadius);
    }
};

export default actions;
