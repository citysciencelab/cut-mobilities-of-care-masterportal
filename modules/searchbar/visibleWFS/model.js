define([
    "backbone",
    "backbone.radio"
    ], function (Backbone, Radio) {
    "use strict";
    return Backbone.Model.extend({
        /**
        *
        */
        defaults: {
            inUse: false,
            features: [],
            minChars: 3
        },
        /**
         * @description Initialisierung der visibleWFS Suche
         * @param {Object} config - Das Konfigurationsobjekt der Suche in sichtbaren WFS.
         * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         */
        initialize: function (config) {
            if (config.minChars) {
                this.set("minChars", config.minChars);
            }
            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.prepSearch
            });
        },
        /**
        *
        */
        prepSearch: function (searchString) {
            if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
                this.set("inUse", true);
                var searchStringRegExp = new RegExp(searchString.replace(/ /g, ""), "i"), // Erst join dann als regulärer Ausdruck
                    layers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
                    featureLayers = _.filter(layers, function (layer) {
                        return layer.get("layer").getSource().getFeatures().length > 0;
                    }),
                    filterLayers = _.filter(featureLayers, function (layer) {
                        return layer.get("searchField") && layer.get("searchField") !== "" && layer.get("searchField") !== undefined;
                    });

                this.setFeaturesForSearch(filterLayers);
                this.searchInFeatures(searchStringRegExp);
                Radio.trigger("Searchbar", "createRecommendedList");
                this.set("inUse", false);
            }
        },
        /**
        *
        */
        searchInFeatures: function (searchStringRegExp) {
            _.each(this.get("features"), function (feature) {
                var featureName = feature.name.replace(/ /g, "");

                // Prüft ob der Suchstring ein Teilstring vom Feature ist
                if (featureName.search(searchStringRegExp) !== -1) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", feature);
                }
            }, this);
        },
        /**
        *
        */
        setFeaturesForSearch: function (layermodels) {
            this.set("features", []);
            var featureArray = [];

            _.each(layermodels, function (layer) {
                if (_.has(layer.attributes, "searchField") === true && layer.get("searchField") !== "" && layer.get("searchField") !== undefined) {
                    var features = layer.get("layer").getSource().getFeatures();

                    _.each(features, function (feature) {
                        var layerStyle = layer.get("layer").getStyle(feature),
                            style,
                            imageSrc,
                            additionalInfo = undefined;

                            // layerStyle returns style
                            if (typeof layerStyle === "object") {
                                imageSrc = layerStyle[0].getImage().getSrc();
                            }
                            // layerStyle returns stylefunction
                            else {
                                style = layerStyle(feature);
                                imageSrc = style[0].getImage().getSrc();
                            }

                            if (!_.isUndefined(layer.get("additionalInfoField"))) {
                                additionalInfo = feature.getProperties()[layer.get("additionalInfoField")];
                            }
                        featureArray.push({
                            name: feature.get(layer.attributes.searchField),
                            type: layer.get("name"),
                            coordinate: feature.getGeometry().getCoordinates(),
                            imageSrc: imageSrc,
                            id: _.uniqueId(layer.get("name")),
                            additionalInfo: additionalInfo
                        });
                    });
                }
            });
            this.set("features", featureArray);
        }
    });
});
