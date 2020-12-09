/**
 * check how to highlight
 * @param {Function} commit commit function
 * @param {Function} dispatch commit function
 * @param {Object} highlightObject to round
 * @returns {void}
 */
function highlightFeature ({commit, dispatch}, highlightObject) {
    if (highlightObject.type === "increase") {
        increaseFeature(commit, highlightObject);
    }
    else if (highlightObject.type === "viaLayerAndLayerId") {
        highlightViaParametricUrl(dispatch, highlightObject.LayerAndLayerId);
    }
    else if (highlightObject.type === "highlightPolygon") {
        highlightPolygon(commit, dispatch, highlightObject);
    }
}
/**
 * highlights a polygon feature
 * @param {Function} commit commit function
 * @param {Function} dispatch commit function
 * @param {Object} highlightObject to round
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function highlightPolygon (commit, dispatch, highlightObject) {
    if (highlightObject.style) {
        const newStyle = highlightObject.style,
            feature = highlightObject.feature,
            styleModelByLayerId = Radio.request("StyleList", "returnModelById", highlightObject.layer.id),
            style = styleModelByLayerId ? styleModelByLayerId.createStyle(feature, false) : undefined,
            clonedStyle = style ? style.clone() : undefined;

        if (clonedStyle) {
            commit("setHighlightedFeature", feature);
            commit("setHighlightedFeatureStyle", feature.getStyle());

            clonedStyle.getFill().setColor(newStyle.fill.color);
            clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            feature.setStyle(clonedStyle);
        }
    }
    else {
        dispatch("MapMarker/placingPolygonMarker", highlightObject.feature, {root: true});
    }

}
/**
 * highlights a feature via layer and layerid
 * @param {Function} dispatch commit function
 * @param {String} LayerAndLayerId to round
 * @fires ModelList#RadioRequestModelListGetModelByAttributes
 * @returns {void}
 */
function highlightViaParametricUrl (dispatch, LayerAndLayerId) {
    const featureToAdd = LayerAndLayerId ? LayerAndLayerId : Radio.request("ParametricURL", "getHighlightFeature");
    let temp,
        feature;

    if (featureToAdd) {
        temp = featureToAdd.split(",");
        feature = getHighlightFeature(temp[0], temp[1]);
    }
    if (feature) {
        dispatch("MapMarker/placingPolygonMarker", feature, {root: true});
    }
}
/**
     * Searches the feature which shall be hightlighted
     * @param {String} layerId Id of the layer, containing the feature to hightlight
     * @param {String} featureId Id of feature which shall be hightlighted
     * @fires ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {ol/feature} feature to highlight
     */
function getHighlightFeature (layerId, featureId) {
    const layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

    if (layer && layer.get("layerSource")) {
        return layer.get("layerSource").getFeatureById(featureId);
    }
    return undefined;
}
/**
 * increases the icon of the feature
 * @param {Function} commit commit function
 * @param {Object} highlightObject to round
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function increaseFeature (commit, highlightObject) {
    const scaleFactor = highlightObject.scale ? highlightObject.scale : 1.5,
        features = highlightObject.layer ? highlightObject.layer.features : undefined,
        feature = features ? features.find(feat => {
            return feat.id.toString() === highlightObject.id;
        }).feature : highlightObject.feature,
        styleModelByLayerId = Radio.request("StyleList", "returnModelById", highlightObject.layer.id),
        style = styleModelByLayerId ? styleModelByLayerId.createStyle(feature, false) : highlightObject.layer.style(feature),
        clonedStyle = style.clone(),
        clonedImage = clonedStyle.getImage();

    if (clonedImage) {
        commit("setHighlightedFeature", feature);
        commit("setHighlightedFeatureStyle", feature.getStyle());

        if (clonedStyle.getText()) {
            clonedStyle.getText().setScale(scaleFactor);
        }
        clonedImage.setScale(clonedImage.getScale() * scaleFactor);
        feature.setStyle(clonedStyle);
    }
}

export {highlightFeature};

