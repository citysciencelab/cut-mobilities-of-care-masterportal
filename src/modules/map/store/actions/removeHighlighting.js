/**
 * reset highlighted feature style
 * @param {Function} commit commit function
 * @param {Function} state state function
 * @returns {void}
 */
function removeHighlightFeature ({commit, state}) {
    const highlightedFeature = state.highlightedFeature,
        highlightedFeatureStyle = state.highlightedFeatureStyle;

    if (highlightedFeature) {
        highlightedFeature.setStyle(highlightedFeatureStyle);
        commit("setHighlightedFeature", null);
        commit("setHighlightedFeatureStyle", null);
    }
}

export {removeHighlightFeature};

