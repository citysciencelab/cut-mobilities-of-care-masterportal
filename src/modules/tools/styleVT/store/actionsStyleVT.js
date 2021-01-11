import stateStyleVT from "./stateStyleVT";

const initialState = Object.assign({}, stateStyleVT),
    actions = {
        refreshVectorTileLayerList ({state, commit}) {
            const {layerModel} = state,
                layerModelList = Radio.request("ModelList", "getModelsByAttributes", {typ: "VectorTile", isSelected: true}),
                vectorTileLayerList = [];

            if (layerModelList) {
                layerModelList.forEach(
                    model => vectorTileLayerList.push(
                        {
                            id: model.get("id"),
                            name: model.get("name")
                        }
                    ));
            }

            commit("setVectorTileLayerList", vectorTileLayerList);

            if (layerModel !== null && layerModel !== undefined) {
                const id = layerModel.get("id"),
                    result = vectorTileLayerList.find(
                        vectorTileLayer => vectorTileLayer.id === id
                    );

                if (result === undefined) {
                    commit("setLayerModel", null);
                }
            }
        },
        resetModule ({commit}) {
            commit("setLayerModel", initialState.layerModel);
            commit("setVectorTileLayerList", initialState.vectorTileLayerList);
        },
        setActive ({commit, dispatch}, {active, layerModel}) {
            commit("setActive", active);

            if (active) {
                commit("setLayerModel", layerModel);
            }
            else {
                dispatch("resetModule");
            }
        },
        triggerStyleUpdate ({state}, event) {
            const styleId = event.target.value;

            state.layerModel.setStyleById(styleId);
        }
    };

export default actions;
