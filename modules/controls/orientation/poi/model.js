define(function (require) {
    var Backbone = require("backbone"),
        Radio = require ("backbone.radio"),
        POIModel;

    POIModel = Backbone.Model.extend({
        defaults: {
            poiDistances: Radio.request("geolocation", "getPoiDistances"),
            poiFeatures: [],
            activeCategory: ""
        },

        /**
         * Leert die Attribute
         */
        reset: function () {
            this.setPoiFeatures([]);
            this.setActiveCategory("");
        },

        /**
         * Ermittelt die Informationen, die fürs Fenster notwendig sind und speichert sie in diesem Model
         */
        calcInfos: function () {
            this.getFeatures();
            this.calcActiveCategory();
        },

        /**
         * Ermittelt die Features für POI, indem es für das Array an Distanzen die Features ermittelt und abspeichert.
         */
        getFeatures: function () {
            var poiDistances = this.getPoiDistances(),
                poiFeatures = [],
                featInCircle = [];
                sortedFeatures = [];

            _.each(poiDistances, function (distance) {
                featInCircle = Radio.request("geolocation", "getFeaturesInCircle", distance);
                sortedFeatures = _.sortBy(featInCircle, function (feature) {
                    return feature.dist2Pos;
                });
                poiFeatures.push ({
                    "category": distance,
                    "features": sortedFeatures
                });
            });

            _.each(poiFeatures, function (category) {
                _.each(category.features, function (feat) {
                    feat = _.extend(feat, {
                        imgPath: this.getImgPath(feat),
                        name: this.getFeatureTitle(feat)
                    });
                }, this);
            }, this);

            this.setPoiFeatures(poiFeatures);
        },

        /**
         * Geht das Array an POI-Features durch und gibt ersten Eintrag zurück, der Features enthält und setzt diese Kategorie (Distanz)
         */
        calcActiveCategory: function () {
            var poi = this.getPoiFeatures(),
                first = _.find(poi, function (dist) {
                    return dist.features.length > 0;
                });

            this.setActiveCategory(first ? first.category : poi[0].category);
        },

        /**
         * Ermittelt den Titel, der im Fesnter für das Feature angezeigt werden soll.
         * @param  {ol.feature} feature Feature, für das der Titel ermittelt werden soll
         * @return {string}         Name
         */
        getFeatureTitle: function (feature) {
            if (feature.get("name")) {
                return feature.get("name");
            }
            else {
                return feature.getId();
            }
        },

        /**
         * Ermittelt zum Feature den img-Path und gibt ihn zurück.
         * @param  {ol.feature} feat Feature
         * @return {string}      imgPath
         */
        getImgPath: function (feat) {
            var style = Radio.request("StyleList", "returnModelById", feat.styleId),
                styleField = style.get("styleField") && style.get("styleField") !== "" ? style.get("styleField") : null,
                styleFieldValues = style.get("styleFieldValues") && style.get("styleFieldValues").length > 0 ? style.get("styleFieldValues") : null,
                imageName = style.get("imageName") && style.get("imageName") !== "" ? style.get("imageName") : null,
                imagePath = style.get("imagePath") && style.get("imagePath") !== "" ? style.get("imagePath") : null;

            if (styleField && styleFieldValues && imagePath) {
                return imagePath + this.getStyleFieldImageName(feat, styleField, styleFieldValues);
            }
            else if (imageName && imagePath) {
                return imagePath + imageName;
            }
            else {
                return "";
            }
        },

        /**
         * Sucht nach dem ImageName bei styleField-Angaben im Style
         * @param  {ol.feature} feature      Feature mit allen Angaben
         * @param  {string} styleField       Name des StyleFields
         * @param  {[Object]} StyleFields    Array aus Objekten mit styleFieldValues
         * @return {string}                  Name des Bildes
         */
        getStyleFieldImageName: function (feature, styleField, styleFields) {
            var value = feature.get(styleField),
                image = _.find(styleFields, function (style) {
                    return style.styleFieldValue === value;
                }),
                value = image.imageName;

                return value;
        },

        zoomFeature: function (id) {
            var poiFeatures = this.getPoiFeatures(),
                activeCategory = this.getActiveCategory(),
                selectedPoiFeatures = _.find(poiFeatures, function (poi) {
                    return poi.category === activeCategory;
                }),
                feature = _.find(selectedPoiFeatures.features, function (feature) {
                    return feature.getId() === id;
                }),
                extent = feature.getGeometry().getExtent();

            Radio.trigger("MapMarker", "zoomTo", {
                type: "POI",
                coordinate: extent
            });
        },

        // getter for poiDistances
        getPoiDistances: function () {
            return this.get("poiDistances");
        },
        // setter for poiDistances
        setPoiDistances: function (value) {
            this.set("poiDistances", value);
        },

        // getter for poiFeatures
        getPoiFeatures: function () {
            return this.get("poiFeatures");
        },
        // setter for poiFeatures
        setPoiFeatures: function (value) {
            this.set("poiFeatures", value);
        },

        // getter for activeCategory
        getActiveCategory: function () {
            return this.get("activeCategory");
        },
        // setter for activeCategory
        setActiveCategory: function (value) {
            this.set("activeCategory", value);
        }
    });

    return new POIModel();
});
