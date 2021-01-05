import {extractEventCoordinates} from "../../../../src/utils/extractEventCoordinates";

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
        this.initActiveCategory();
    },

    /**
     * Ermittelt die Features für POI, indem es für das Array an Distanzen die Features ermittelt und abspeichert.
     * @returns {void}
     */
    getFeatures: function () {
        /**
         * Selector for old or new way to set vector legend
         * @deprecated with new vectorStyle module
         * @type {Boolean}
         */
        const isNewVectorStyle = Config.hasOwnProperty("useVectorStyleBeta") && Config.useVectorStyleBeta ? Config.useVectorStyleBeta : false,
            poiDistances = Radio.request("geolocation", "getPoiDistances"),
            poiFeatures = [];
        let featInCircle = [];

        poiDistances.forEach(distance => {
            featInCircle = Radio.request("geolocation", "getFeaturesInCircle", distance);

            featInCircle.sort((featureA, featureB) => featureA.dist2Pos - featureB.dist2Pos);

            poiFeatures.push({
                "category": distance,
                "features": featInCircle
            });
        });

        poiFeatures.forEach(category => {
            category.features.forEach(feat => {
                feat.imgPath = isNewVectorStyle ? this.getImgPath(feat) : this.getImgPathOld(feat);
                feat.name = this.getFeatureTitle(feat);
            });
        });

        this.setPoiFeatures(poiFeatures);
    },

    /**
     * Geht das Array an POI-Features durch und gibt ersten Eintrag zurück, der Features enthält und setzt diese Kategorie (Distanz)
     * @returns {void}
     */
    initActiveCategory: function () {
        let poi,
            first;

        if (typeof this.get("activeCategory") !== "number") {
            poi = this.get("poiFeatures");
            first = poi.find(function (dist) {
                return dist.features.length > 0;
            });

            this.setActiveCategory(first ? first.category : poi[0].category);
        }
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
     * @deprecated with new vectorStyle module
     * @param  {ol.feature} feat Feature
     * @return {string}      imgPath
     */
    getImgPathOld: function (feat) {
        let imagePath = "",
            styleClass,
            styleSubClass;
        const style = Radio.request("StyleList", "returnModelById", feat.styleId);

        if (style) {
            styleClass = style.get("class");
            styleSubClass = style.get("subClass");
            if (styleClass === "POINT") {
                if (styleSubClass === "CUSTOM") {
                    imagePath = style.get("imagePath") + this.createStyleFieldImageName(feat, style);
                }
                if (styleSubClass === "CIRCLE") {
                    imagePath = this.createCircleSVG(style);
                }
                else if (style.get("imageName") !== "blank.png") {
                    imagePath = style.get("imagePath") + style.get("imageName");
                }
            }
            if (styleClass === "LINE") {
                imagePath = this.createLineSVG(style);
            }
            if (styleClass === "POLYGON") {
                imagePath = this.createPolygonSVG(style);
            }
        }

        return imagePath;
    },

    /**
     * Ermittelt zum Feature den img-Path und gibt ihn zurück.
     * @param  {ol.feature} feat Feature
     * @return {string}      imgPath
     */
    getImgPath: function (feat) {
        let imagePath = "";
        const style = Radio.request("StyleList", "returnModelById", feat.styleId);

        if (style) {
            style.getLegendInfos().forEach(legendInfo => {
                if (legendInfo.geometryType === "Point") {
                    const type = legendInfo.styleObject.get("type");

                    if (type === "icon") {
                        const featureStyle = style.createStyle(feat, false);

                        imagePath = featureStyle.getImage().getSrc();
                    }
                    else if (type === "circle") {
                        imagePath = this.createCircleSVG(style);
                    }
                }
                else if (legendInfo.geometryType === "LineString") {
                    imagePath = this.createLineSVG(legendInfo.styleObject);
                }
                else if (legendInfo.geometryType === "Polygon") {
                    imagePath = this.createPolygonSVG(legendInfo.styleObject);
                }
            });
        }

        return imagePath;
    },

    /**
     * Sucht nach dem ImageName bei styleField-Angaben im Style
     * @deprecated with new vectorStyle module
     * @param  {ol.feature} feature      Feature mit allen Angaben
     * @param  {object} style       Style des Features
     * @return {string}                  Name des Bildes
     */
    createStyleFieldImageName: function (feature, style) {
        const styleField = style.get("styleField"),
            styleFields = style.get("styleFieldValues"),
            value = feature.get(styleField),
            image = styleFields.find(function (field) {
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
        const poiFeatures = this.get("poiFeatures"),
            activeCategory = this.get("activeCategory"),
            selectedPoiFeatures = poiFeatures.find(function (poi) {
                return poi.category === activeCategory;
            }),
            feature = selectedPoiFeatures.features.find(function (feat) {
                return feat.getId() === id;
            }),
            extent = feature.getGeometry().getExtent(),
            coordinate = extractEventCoordinates(extent),
            resolutions = Radio.request("MapView", "getResolutions"),
            index = resolutions.indexOf(0.2645831904584105) === -1 ? resolutions.length : resolutions.indexOf(0.2645831904584105);

        Radio.trigger("Map", "zoomToExtent", coordinate, {maxZoom: index});
    },

    /**
     * Erzeugt ein SVG eines Kreises
     * @param  {object} style Style des Features
     * @return {string}       SVG
     */
    createCircleSVG: function (style) {
        let svg = "";
        const circleStrokeColor = style.returnColor(style.get("circleStrokeColor"), "hex"),
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
        let svg = "";
        const strokeColor = style.returnColor(style.get("lineStrokeColor"), "hex"),
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
        let svg = "";
        const fillColor = style.returnColor(style.get("polygonFillColor"), "hex"),
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
