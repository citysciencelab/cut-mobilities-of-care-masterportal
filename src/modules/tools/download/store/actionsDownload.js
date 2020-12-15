const actions = {
    back ({dispatch}) {
        dispatch("setActive", false);
        dispatch("reset");

        // TODO(roehlipa): Not sure if this works and if this would do the right thing
        dispatch("Tools/Draw/setIsActive", true, {root: true});
    },
    download () {
        // TODO: Not sure if this function is actually needed as it currently only does DOM magic (from the view)
    },
    reset ({commit}) {
        // TODO(roehlipa): Rather use a deep copy of the initial state to reset the values?
        commit("setDataString", "");
        commit("setFeatures", []);
        commit("setFileName", "");
        commit("setFormats", []);
        commit("setSelectedFormat", "");
    },
    setActive ({commit}, active) {
        commit("setActive", active);

        // if (active) {}
    },
    setFileName ({commit}, evt) {
        const val = evt.currentTarget.value;

        commit("setFileName", val);
        // TODO prepareDownloadButton
    },
    setSelectedFormat ({commit}, evt) {
        const val = evt.currentTarget.value;

        commit("setSelectedFormat", val);
        // TODO: prepareData
        // TODO: prepareDownloadButton
    }
};

export default actions;
