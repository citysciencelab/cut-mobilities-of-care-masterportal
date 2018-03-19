define(function (require) {
    var Backbone = require("backbone"),
        Radio = require ("backbone.radio"),
        POIModel;

    POIModel = Backbone.Model.extend({
        defaults: {
            poiDistances: Radio.request("geolocation", "getPoiDistances"),
            styleModels: Radio.request("StyleList", "returnModels"),
            poiFeatures: [],
            activeCategory: ""
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
            var styleModels = this.getStyleModels(),
                style = _.find(styleModels, function (num) {
                    return num.get("layerId") === feat.styleId;
                });

            if (style && style.get("imagePath") && style.get("imageName")) {
                return style.get("imagePath") + style.get("imageName");
            }
            else {
                return null;
            }
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
        },

        // getter for styleModels
        getStyleModels: function () {
            return this.get("styleModels");
        },
        // setter for styleModels
        setStyleModels: function (value) {
            this.set("styleModels", value);
        }
    });

    return new POIModel();
});
