const actions = {
    createUrlParams ({state, commit}) {
        const {layerList} = state,
            layerTransparencies = [],
            layerVisibilities = [];

        layerList.forEach(layerModel => {
            layerTransparencies.push(layerModel.get("transparency"));
            layerVisibilities.push(layerModel.get("isVisibleInMap"));
        });

        commit("setLayerIds", layerList.map(el => el.id));
        commit("setLayerTransparencies", layerTransparencies);
        commit("setLayerVisibilities", layerVisibilities);
    },
    filterExternalLayer ({commit, dispatch}, layerList) {
        let filteredLayerList = layerList.filter(model => !model.get("isExternal"));

        filteredLayerList = Radio.request("Util", "sortBy", filteredLayerList, model => model.get("selectionIDX"));

        commit("setLayerList", filteredLayerList);
        dispatch("createUrlParams");
    },
    getMapState ({dispatch, getters}) {
        dispatch("filterExternalLayer", Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, type: "layer"}));
        return getters.url;
    }
};

export default actions;
