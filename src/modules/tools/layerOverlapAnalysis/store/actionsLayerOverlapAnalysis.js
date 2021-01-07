import VectorSource from "ol/source/Vector.js";
import {Vector as VectorLayer} from "ol/layer";

const actions = {
    clearBufferLayer ({state, rootGetters}) {
        rootGetters["Map/map"].removeLayer(state.bufferLayer);
    },
    checkIntersection ({state, commit, dispatch, rootGetters}) {
        const resultFeatures = [];

        state.selectedTargetLayer.get("layerSource").getFeatures().forEach(targetFeature => {
            let foundIntersection = false;

            state.bufferLayer.getSource().getFeatures().forEach(sourceFeature => {
                const sourceGeometry = sourceFeature.getGeometry(),
                    targetGeometry = targetFeature.getGeometry();


                if (targetFeature.getGeometry().getType() === "Point") {
                    if (sourceGeometry.intersectsCoordinate(targetGeometry.getCoordinates())) {
                        foundIntersection = true;
                    }
                }
                else {
                    const sourcePoly = this.parser.read(sourceGeometry),
                        targetPoly = this.parser.read(targetGeometry);

                    if (sourcePoly.intersects(targetPoly)) {
                        foundIntersection = true;
                    }
                }

            });
            if (!foundIntersection) {
                resultFeatures.push(targetFeature);
            }
        });
        if (resultFeatures) {
            const vectorSource = new VectorSource();

            commit("setResultLayer", new VectorLayer({
                source: vectorSource,
                style: state.selectedTargetLayer.get("style")
            }));

            vectorSource.addFeatures(resultFeatures);
            rootGetters["Map/map"].addLayer(state.resultLayer);
            state.sourceOptions.forEach(option => {
                option.setIsSelected(false);
            });
            dispatch("clearBufferLayer");
        }
    }
};

export default actions;
