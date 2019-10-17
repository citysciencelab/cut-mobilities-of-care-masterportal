const HighlightFeaturesModel = Backbone.Model.extend(/** @lends HighlightFeaturesModel.prototype */{
    /**
     * @class HighlightFeaturesModel
     * @description Class to highlight via gfi selected vector features.
     * @extends Backbone.Model
     * @memberof Tools.GFI
     * @constructs
     * @property {object} fill="null" Styling rules for fills
     * @property {ol/color} fill.color ol color
     * @property {object} image="null" Styling rules for images
     * @property {integer} image.scale image scale
     * @property {object} stroke="null" Styling rules strokes
     * @property {integer} stroke.width width of stroke
     * @property {object} text="null" Styling rules for text
     * @property {integer} text.scale text scale
     */
    defaults: {
        fill: null,
        image: null,
        stroke: null,
        text: null,
        highlightedFeatures: null
    },

    /**
     * Handling to highlight or lowlight vector features on gfi
     * @param {ThemeModel} model Model of GFI Theme
     * @returns {void}
     */
    highlight: function (model) {
        const themes = model.get("themeList"),
            index = model.get("themeIndex"),
            theme = this.getValueInArray(themes, index);

        let ollayer = null,
            features = null,
            layerStyle = null,
            style = null;

        this.lowlightFeatures();
        if (theme) {
            ollayer = this.getLayerOfTheme(theme);
        }
        if (theme) {
            features = this.getFeaturesOfTheme(theme);
        }
        if (ollayer) {
            layerStyle = this.getStyleOfLayer(ollayer);
        }
        if (layerStyle && Array.isArray(features) && features.length > 0) {
            style = this.createStyle(features[0], layerStyle);
            this.highlightFeatures(features, style);
            this.setHighlightedFeatures(features);
        }
    },

    /**
     * return theme
     * @param   {Tools.GFI.Themes[]} list  Array of opened Themes
     * @param   {integer} index index of visible theme
     * @returns {Tools.GFI.Theme} theme
     */
    getValueInArray: function (list, index) {
        if (list.length > index) {
            return list.models[index];
        }

        return false;
    },

    /**
     * return layer
     * @param   {Tools.GFI.Theme} theme opened theme
     * @returns {ol.Layer} layer
     */
    getLayerOfTheme: function (theme) {
        if (theme.get("layer")) {
            return theme.get("layer");
        }

        return false;
    },

    /**
     * returns layerstyle
     * @param   {ol/Layer} layer ol layer
     * @returns {ol/Style} ol style
     */
    getStyleOfLayer: function (layer) {
        if (layer.getStyle()) {
            return layer.getStyle();
        }

        return false;
    },

    /**
     * returns selected features
     * @param   {Tools.GFI.Theme} theme opened theme
     * @returns {ol/Features[]} features
     */
    getFeaturesOfTheme: function (theme) {
        if (theme.get("gfiFeatureList") && theme.get("gfiFeatureList").length > 0) {
            return theme.get("gfiFeatureList");
        }

        return false;
    },

    /**
     * Removes the feature style for all highlighted features
     * @returns {void}
     */
    lowlightFeatures: function () {
        const features = this.get("highlightedFeatures");

        if (features) {
            features.forEach(function (feature) {
                feature.setStyle(null);
            });
        }
        this.setHighlightedFeatures(null);
    },

    /**
     * Sets the feature style for given features with given style
     * @param   {ol/Features[]} features Array of ol features
     * @param   {ol/Style} style ol style
     * @returns {void}
     */
    highlightFeatures: function (features, style) {
        features.forEach(function (feature) {
            feature.setStyle(style);
        });
    },

    /**
     * Clones and manipultes a given style
     * @param   {ol/Feature} feature openlayers vector feature
     * @param   {function} styleFunction stylefunction
     * @returns {ol/Style} ol Style
     */
    createStyle: function (feature, styleFunction) {
        const style = styleFunction(feature).clone(),
            fill = style.getFill(),
            image = style.getImage(),
            stroke = style.getStroke(),
            text = style.getText(),
            rFill = this.get("fill"),
            rImage = this.get("image"),
            rStroke = this.get("stroke"),
            rText = this.get("text");

        if (rFill && fill) {
            const newFill = this.highlightFill(fill, rFill);

            style.setFill(newFill);
        }
        if (rImage && image) {
            const newImage = this.highlightImage(image, rImage);

            style.setImage(newImage);
        }
        if (rStroke && stroke) {
            const newStroke = this.highlightStroke(stroke, rStroke);

            style.setStroke(newStroke);
        }
        if (rText && text) {
            const newText = this.highlightText(text, rText);

            style.setText(newText);
        }

        return style;
    },

    /**
     * Clone and overwrite fill
     * @param   {ol/style/Fill} fill fill to change
     * @param   {object} rFill rule to change fill
     * @returns {ol/style/Fill} cloned fill
     */
    highlightFill: function (fill, rFill) {
        const newFill = fill.clone();

        if (rFill.color) {
            newFill.setColor(rFill.color);
        }

        return newFill;
    },

    /**
     * Clone and overwrite image
     * @param   {ol/style/Image} image image to change
     * @param   {object} rImage rule to change image
     * @returns {ol/style/Image} cloned image
     */
    highlightImage: function (image, rImage) {
        const newImage = image.clone();

        if (rImage.scale) {
            newImage.setScale(rImage.scale);
        }

        return newImage;
    },

    /**
     * Clone and overwrite stroke
     * @param   {ol/style/Stroke} stroke stroke to change
     * @param   {object} rStroke rule to change stroke
     * @returns {ol/style/Stroke} cloned stroke
     */
    highlightStroke: function (stroke, rStroke) {
        const newStroke = stroke.clone();

        if (rStroke.width) {
            newStroke.setWidth(rStroke.width);
        }

        return newStroke;
    },

    /**
     * Clone and overwrite text
     * @param   {ol/style/Text} text text to change
     * @param   {object} rText rule to change text
     * @returns {ol/style/Text} cloned text
     */
    highlightText: function (text, rText) {
        const newText = text.clone();

        if (rText.scale) {
            newText.setScale(rText.scale);
        }

        return newText;
    },

    /**
     * Setter for highlightedFeatures
     * @param {ol/Feature} feature value
     * @returns {void}
     */
    setHighlightedFeatures: function (feature) {
        this.set("highlightedFeatures", feature);
    }
});

export default HighlightFeaturesModel;
