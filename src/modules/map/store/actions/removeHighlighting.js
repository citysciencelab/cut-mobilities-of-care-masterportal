/**
 * remove increased feature highlight
 * @param {Function} commit commit function
 * @param {Function} state state function
 * @returns {void}
 */
function removeHighlighting (commit, state) {
    const highlightedFeature = state.highlightedFeature,
        highlightedFeatureStyle = state.getHighlightedFeatureStyle;


    if (highlightedFeature) {
        highlightedFeature.setStyle(highlightedFeatureStyle);
        commit("setHighlightedFeature", null);
        commit("setHighlightedFeatureStyle", null);
    }
}

export default removeHighlighting;

