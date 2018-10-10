define(function (require) {
    var Radio = require("backbone.radio"),
        VisibleWFSModel;

    VisibleWFSModel = Backbone.Model.extend({
        /**
        *
        */
        defaults: {
            inUse: false,
            minChars: 3
        },
        /**
         * @description Initialisierung der visibleWFS Suche
         * @param {Object} config - Das Konfigurationsobjekt der Suche in sichtbaren WFS.
         * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         * @returns {void}
         */
        initialize: function (config) {
            if (config.minChars) {
                this.setMinChars(config.minChars);
            }
            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.prepSearch
            });

        },
        prepSearch: function (searchString) {
            var prepSearchString,
                wfsModels,
                filteredModels;

            if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
                this.setInUse(true);
                prepSearchString = searchString.replace(" ", "");
                wfsModels = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"});
                filteredModels = _.filter(_.union(wfsModels), function (model) {
                    return model.has("searchField") === true && model.get("searchField") !== "";
                });

                this.findMatchingFeatures(filteredModels, prepSearchString);
                Radio.trigger("Searchbar", "createRecommendedList", "visibleWFS");
                this.setInUse(false);
            }
        },
        findMatchingFeatures: function (models, searchString) {
            var featureArray = [];

            _.each(models, function (model) {
                var features = model.get("layer").getSource().getFeatures(),
                    filteredFeatures;

                if (_.isArray(model.get("searchField"))) {
                    _.each(model.get("searchField"), function (field) {
                        filteredFeatures = _.filter(features, function (feature) {
                            var value = feature.get(field).toString().toUpperCase();

                            return value.indexOf(searchString.toUpperCase()) !== -1;
                        });
                        // createFeatureObject for each feature
                        featureArray.push(this.getFeatureObject(field, filteredFeatures, model));
                    }, this);
                }
                else {
                    filteredFeatures = _.filter(features, function (feature) {
                        var value = feature.get(model.get("searchField")).toUpperCase();

                        return value.indexOf(searchString.toUpperCase()) !== -1;
                    });
                    // createFeatureObject for each feature
                    featureArray.push(this.getFeatureObject(model.get("searchField"), filteredFeatures, model));
                }
            }, this);

            Radio.trigger("Searchbar", "pushHits", "hitList", featureArray);
        },


        /**
         * gets a new feature object
         * @param  {string} searchField Attribute feature has to be searche through
         * @param  {ol.Feature} filteredFeatures openlayers feature
         * @param  {Backbone.Model} model model of visibleWFS
         * @return {array} array with feature objects
         */
        getFeatureObject: function (searchField, filteredFeatures, model) {
            var featureArray = [];

            _.each(filteredFeatures, function (feature) {
                featureArray.push({
                    name: feature.get(searchField),
                    type: model.get("name"),
                    coordinate: this.getCentroidPoint(feature.getGeometry()),
                    imageSrc: this.getImageSource(feature, model),
                    id: _.uniqueId(model.get("name")),
                    additionalInfo: this.getAdditionalInfo(model, feature),
                    feature: feature
                });
            }, this);
            return featureArray;
        },

        /**
         * gets centroid point for a openlayers geometry
         * @param  {ol.geom.Geometry} geometry geometry to get centroid from
         * @return {ol.Coordinate} centroid coordinate
         */
        getCentroidPoint: function (geometry) {
            if (geometry.getType() === "MultiPolygon") {
                return geometry.getExtent();
            }

            return geometry.getCoordinates();

        },

        /**
         * returns an image source of a feature style
         * @param  {ol.Feature} feature openlayers feature
         * @param  {Backbone.Model} model model to get layer to get style from
         * @return {string} imagesource
         */
        getImageSource: function (feature, model) {
            var layerStyle,
                layerTyp,
                style;

            if (feature.getGeometry().getType() === "Point" || feature.getGeometry().getType() === "MultiPoint") {
                layerStyle = model.get("layer").getStyle(feature);
                layerTyp = model.get("typ");

                // layerStyle returns style
                if (typeof layerStyle === "object") {
                    return layerStyle[0].getImage().getSrc();
                }
                // layerStyle returns stylefunction

                style = layerStyle(feature);

                return layerTyp === "WFS" ? style.getImage().getSrc() : undefined;

            }

            return undefined;

        },

        getAdditionalInfo: function (model, feature) {
            var additionalInfo;

            if (!_.isUndefined(model.get("additionalInfoField"))) {
                additionalInfo = feature.getProperties()[model.get("additionalInfoField")];
            }

            return additionalInfo;
        },

        // setter for minChars
        setMinChars: function (value) {
            this.set("minChars", value);
        },

        // setter for inUse
        setInUse: function (value) {
            this.set("inUse", value);
        }
    });

    return VisibleWFSModel;
});
