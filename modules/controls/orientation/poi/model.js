const POIModel = Backbone.Model.extend({
    defaults: {
        poiDistances: [],
        poiFeatures: [],
        activeCategory: ""
    },

    /**
     * Leert die Attribute
     * @returns {void}
     */
    reset: function () {
        this.setPoiFeatures([]);
        this.setActiveCategory("");
    },

    /**
     * Ermittelt die Informationen, die fürs Fenster notwendig sind und speichert sie in diesem Model
     * @returns {void}
     */
    calcInfos: function () {
        this.getFeatures();
        this.calcActiveCategory();
    },

    /**
     * Ermittelt die Features für POI, indem es für das Array an Distanzen die Features ermittelt und abspeichert.
     * @returns {void}
     */
    getFeatures: function () {
        var poiDistances = Radio.request("geolocation", "getPoiDistances"),
            poiFeatures = [],
            featInCircle = [],
            sortedFeatures = [];

        _.each(poiDistances, function (distance) {
            featInCircle = Radio.request("geolocation", "getFeaturesInCircle", distance);
            sortedFeatures = _.sortBy(featInCircle, function (feature) {
                return feature.dist2Pos;
            });
            poiFeatures.push({
                "category": distance,
                "features": sortedFeatures
            });
        }, this);

        _.each(poiFeatures, function (category) {
            _.each(category.features, function (feat) {
                _.extend(feat, {
                    imgPath: this.getImgPath(feat),
                    name: this.getFeatureTitle(feat)
                });
            }, this);
        }, this);

        this.setPoiFeatures(poiFeatures);
    },

    /**
     * Geht das Array an POI-Features durch und gibt ersten Eintrag zurück, der Features enthält und setzt diese Kategorie (Distanz)
     * @returns {void}
     */
    calcActiveCategory: function () {
        var poi = this.get("poiFeatures"),
            first = _.find(poi, function (dist) {
                return dist.features.length > 0;
            });

        this.setActiveCategory(first ? first.category : poi[0].category);
    },

    /**
     * Ermittelt den Titel, der im Fenster für das Feature angezeigt werden soll.
     * @param  {ol.feature} feature Feature, für das der Titel ermittelt werden soll
     * @return {string}         Name
     */
    getFeatureTitle: function (feature) {
        if (feature.get("name")) {
            return feature.get("name");
        }
        else if (feature.layerName) {
            return feature.layerName;
        }

        return feature.getId();

    },

    /**
     * Ermittelt zum Feature den img-Path und gibt ihn zurück.
     * @param  {ol.feature} feat Feature
     * @return {string}      imgPath
     */
    getImgPath: function (feat) {
        var imagePath = "",
            style = Radio.request("StyleList", "returnModelById", feat.styleId),
            styleClass = style.get("class"),
            styleSubClass = style.get("subClass");

        if (styleClass === "POINT") {
            // Custom Point Styles
            if (styleSubClass === "CUSTOM") {
                imagePath = style.get("imagePath") + this.createStyleFieldImageName(feat, style);
            }
            // Circle Point Style
            if (styleSubClass === "CIRCLE") {
                imagePath = this.createCircleSVG(style);
            }
            else if (style.get("imageName") !== "blank.png") {
                imagePath = style.get("imagePath") + style.get("imageName");
            }
        }
        // Simple Line Style
        if (styleClass === "LINE") {
            imagePath = this.createLineSVG(style);
        }
        // Simple Polygon Style
        if (styleClass === "POLYGON") {
            imagePath = this.createPolygonSVG(style);
        }

        return imagePath;
    },

    /**
     * Sucht nach dem ImageName bei styleField-Angaben im Style
     * @param  {ol.feature} feature      Feature mit allen Angaben
     * @param  {object} style       Style des Features
     * @return {string}                  Name des Bildes
     */
    createStyleFieldImageName: function (feature, style) {
        var styleField = style.get("styleField"),
            styleFields = style.get("styleFieldValues"),
            value = feature.get(styleField),
            image = _.find(styleFields, function (field) {
                return field.styleFieldValue === value;
            });

        return image.imageName;
    },

    /**
     * Triggert das Zommen auf das geklickte Feature
     * @param  {string} id featureId
     * @returns {void}
     */
    zoomFeature: function (id) {
        var poiFeatures = this.get("poiFeatures"),
            activeCategory = this.get("activeCategory"),
            selectedPoiFeatures = _.find(poiFeatures, function (poi) {
                return poi.category === activeCategory;
            }),
            feature = _.find(selectedPoiFeatures.features, function (feat) {
                return feat.getId() === id;
            }),
            extent = feature.getGeometry().getExtent();

        Radio.trigger("MapMarker", "zoomTo", {
            type: "POI",
            coordinate: extent
        });
    },

    /**
     * Erzeugt ein SVG eines Kreises
     * @param  {object} style Style des Features
     * @return {string}       SVG
     */
    createCircleSVG: function (style) {
        var svg = "",
            circleStrokeColor = style.returnColor(style.get("circleStrokeColor"), "hex"),
            circleStrokeOpacity = style.get("circleStrokeColor")[3].toString() || 0,
            circleStrokeWidth = style.get("circleStrokeWidth"),
            circleFillColor = style.returnColor(style.get("circleFillColor"), "hex"),
            circleFillOpacity = style.get("circleFillColor")[3].toString() || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<circle cx='17.5' cy='17.5' r='15' stroke='";
        svg += circleStrokeColor;
        svg += "' stroke-opacity='";
        svg += circleStrokeOpacity;
        svg += "' stroke-width='";
        svg += circleStrokeWidth;
        svg += "' fill='";
        svg += circleFillColor;
        svg += "' fill-opacity='";
        svg += circleFillOpacity;
        svg += "'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Erzeugt ein SVG einer Line
     * @param  {object} style Style des Features
     * @return {string}       SVG
     */
    createLineSVG: function (style) {
        var svg = "",
            strokeColor = style.returnColor(style.get("lineStrokeColor"), "hex"),
            strokeWidth = parseInt(style.get("lineStrokeWidth"), 10),
            strokeOpacity = style.get("lineStrokeColor")[3].toString() || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<path d='M 05 30 L 30 05' stroke='";
        svg += strokeColor;
        svg += "' stroke-opacity='";
        svg += strokeOpacity;
        svg += "' stroke-width='";
        svg += strokeWidth;
        svg += "' fill='none'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Erzeugt ein SVG eines Polygons
     * @param  {object} style Style des Features
     * @return {string}       SVG
     */
    createPolygonSVG: function (style) {
        var svg = "",
            fillColor = style.returnColor(style.get("polygonFillColor"), "hex"),
            strokeColor = style.returnColor(style.get("polygonStrokeColor"), "hex"),
            strokeWidth = parseInt(style.get("polygonStrokeWidth"), 10),
            fillOpacity = style.get("polygonFillColor")[3].toString() || 0,
            strokeOpacity = style.get("polygonStrokeColor")[3].toString() || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
        svg += fillColor;
        svg += ";fill-opacity:";
        svg += fillOpacity;
        svg += ";stroke:";
        svg += strokeColor;
        svg += ";stroke-opacity:";
        svg += strokeOpacity;
        svg += ";stroke-width:";
        svg += strokeWidth;
        svg += ";'/>";
        svg += "</svg>";

        return svg;
    },

    // setter for poiDistances
    setPoiDistances: function (value) {
        this.set("poiDistances", value);
    },

    // setter for poiFeatures
    setPoiFeatures: function (value) {
        this.set("poiFeatures", value);
    },

    // setter for activeCategory
    setActiveCategory: function (value) {
        this.set("activeCategory", value);
    }
});

export default new POIModel();
