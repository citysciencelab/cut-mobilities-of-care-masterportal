import VectorSource from "ol/source/Vector.js";
import {Vector as VectorLayer} from "ol/layer";
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
        const resultFeatures = [];

        state.selectedTargetLayer.get("layerSource").getFeatures().forEach(targetFeature => {
            let foundIntersection = false;

            state.bufferLayer.getSource().getFeatures().forEach(sourceFeature => {
                const sourceGeometry = sourceFeature.getGeometry(),
                    targetGeometry = targetFeature.getGeometry(),
                    sameFeature = sourceFeature.get("originFeature").getId() === targetFeature.getId();

                if (targetFeature.getGeometry().getType() === "Point") {
                    if (sourceGeometry.intersectsCoordinate(targetGeometry.getCoordinates()) && !sameFeature) {
                        foundIntersection = true;
                    }
                }
                else {
                    const sourcePoly = state.parser.read(sourceGeometry),
                        targetPoly = state.parser.read(targetGeometry);

                    if (sourcePoly.intersects(targetPoly) && !sameFeature) {
                        foundIntersection = true;
                    }
                }
            });
            if (foundIntersection === state.resultType) {
                resultFeatures.push(targetFeature);
            }
        });
        if (resultFeatures.length) {
            const vectorSource = new VectorSource(),
                gfiAttributes = state.selectedTargetLayer.get("gfiAttributes");

            commit("setResultLayer", new VectorLayer({
                source: vectorSource,
                style: state.selectedTargetLayer.get("style")
            }));

            vectorSource.addFeatures(resultFeatures);
            state.resultLayer.set("gfiAttributes", gfiAttributes);
            rootGetters["Map/map"].addLayer(state.resultLayer);
            state.selectOptions.forEach(option => {
                option.setIsSelected(false);
            });
        }
    },
    applyBufferRadius ({state, commit, rootGetters}) {
        const features = state.selectedSourceLayer.get("layerSource").getFeatures(),
            newFeatures = [],
            vectorSource = new VectorSource();

        commit("setBufferLayer", new VectorLayer({
            source: vectorSource
        }));

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
            const jstsGeom = state.parser.read(feature.getGeometry()),
                buffered = jstsGeom.buffer(state.bufferRadius),
                newFeature = new Feature({
                    geometry: state.parser.write(buffered),
                    name: "Buffers"
                });

            newFeature.setStyle(state.bufferLayerStyle);
            newFeature.set("originFeature", feature);
            newFeatures.push(newFeature);
        });

        vectorSource.addFeatures(newFeatures);

        rootGetters["Map/map"].addLayer(state.bufferLayer);
    },
    removeGeneratedLayers ({state, rootGetters}) {
        rootGetters["Map/map"].removeLayer(state.resultLayer);
        rootGetters["Map/map"].removeLayer(state.bufferLayer);
    },
    applySelectedSourceLayer ({state, commit, dispatch}, selectedSourceLayer) {
        if (state.selectedTargetLayer) {
            state.selectedTargetLayer.setIsSelected(false);
            commit("setSelectedTargetLayer", null);
        }

        if (selectedSourceLayer) {
            state.selectOptions.forEach(option => {
                option.setIsSelected(selectedSourceLayer.get("id") === option.get("id"));
            });
        }

        if (state.bufferRadius) {
            dispatch("removeGeneratedLayers");
            clearTimeout(state.timerId);
            state.timerId = setTimeout(() => {
                dispatch("applyBufferRadius");
            }, 1000);
        }
        commit("setSelectedSourceLayer", selectedSourceLayer);
    },
    applySelectedTargetLayer ({commit, dispatch}, selectedTargetLayer) {
        if (selectedTargetLayer) {
            selectedTargetLayer.setIsSelected(selectedTargetLayer.get("id"));
            setTimeout(() => {
                dispatch("removeGeneratedLayers");
                dispatch("checkIntersection");
            }, 1000);
        }
        commit("setSelectedTargetLayer", selectedTargetLayer);
    },
    applyInputBufferRadius ({state, commit, dispatch}, selectedBufferRadius) {
        if (selectedBufferRadius) {
            dispatch("removeGeneratedLayers");
            clearTimeout(state.timerId);
            commit("setTimerId", setTimeout(() => {
                dispatch("applyBufferRadius");
            }, 1000));
        }
        commit("setBufferRadius", selectedBufferRadius);
    }
};

export default actions;
