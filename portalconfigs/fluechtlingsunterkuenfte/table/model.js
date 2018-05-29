define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        TableModel;

    TableModel = Backbone.Model.extend({
        defaults: {
            layerIds: ["4553", "4554", "10964","10965", "4556", "4557","9097"],
            // Attribute die in der Tabelle angezeigt werden
            featureAttributes: ["bemerkung", "bezirk", "platzzahl", "stadtteil", "bezeichnung", "geplante_inbetriebnahme", "pfad", "geom"],
            // Alle Standorte
            features: [],
            // Standorte eines Bezirks
            filteredFeatures: [],
            // ranking used for sorting
            ranking: [
                "zea_bestehend",
                "nur_ea_bestehend",
                "oeru_bestehend",
                "oeru_geplant",
                "perspektive_wohnen_bestehend",
                "perspektive_wohnen_geplant"]
        },

        initialize: function () {
            var channel = Radio.channel("RefugeesTable");

            this.listenTo(channel, {
                "showFeaturesByBezirk": this.filterFeaturesByBezirk,
                "showAllFeatures": this.sortAllFeatures
            }, this);

            this.requestRawLayerModels();
            Radio.trigger("ZoomToGeometry", "setIsRender", true);
        },

        /**
         * Ermittelt die Geometrie und zoomt auf Koordinate
         */
         zoomStandort: function (id) {
            var feature = _.findWhere(this.getFeatures(), {"id": id}),
                geom = feature.geom;

            Radio.trigger("MapView", "setCenter", geom, 4);
         },

         /**
         * Ermittelt die Geometrie und setzt den MapMarker
         */
         selectStandort: function (id) {
            var feature = _.findWhere(this.getFeatures(), {"id": id}),
                geom = feature.geom;

            Radio.trigger("MapMarker", "showMarker", geom);
         },

         /**
          * Entfernt den MapMarker
          */
         deselectStandort: function () {
            Radio.trigger("MapMarker", "hideMarker");
         },

        /**
         * Iteriert über die LayerIds und holt sich die entsprechenden Models aus der RawLayerList
         */
        requestRawLayerModels: function () {
            _.each(this.getLayerIds(), function (layerId) {
                var model = Radio.request("RawLayerList", "getLayerWhere", {id: layerId}),
                    getFeatureUrl = this.buildAndGetRequestUrl(model);

                this.sendRequest(getFeatureUrl, this.parseFeatures);
            }, this);
        },

        /**
         * Führt den WFS-GetFeature Request aus
         * @param  {String} url
         * @param  {function} successFunction
         */
        sendRequest: function (url, successFunction) {
            $.ajax({
                url: Radio.request("Util", "getProxyURL", url),
                context: this,
                async: false,
                type: "GET",
                success: successFunction,
                timeout: 6000,
                error: function () {
                    Radio.trigger("Alert", "alert", url + " nicht erreichbar.");
                }
            });
        },

        /**
         * Stellt die Url für den WFS-GetFeature Request zusammen und gibt sie zurück
         * @param  {Backbone.Model} model
         * @return {String}
         */
        buildAndGetRequestUrl: function (model) {
            var params = "?service=WFS&request=GetFeature&version=2.0.0&typeNames=",
                url = model.get("url"),
                featureType = model.get("featureType");

            return url + params + featureType;
        },

        /**
         * Holt sich die benötigten Attribute aus dem XML
         * @param  {XML} data
         */
        parseFeatures: function (data) {
            var hits = $("wfs\\:member,member", data),
                feature,
                featureType,
                element,
                coordEle,
                coord;

            _.each(hits, function (hit) {
                feature = {
                    id: _.uniqueId()
                };

                _.each(this.get("featureAttributes"), function (attr) {
                    element = $(hit).find("app\\:" + attr + "," + attr)[0];
                    if (_.isUndefined(element) === false) {
                        if (attr === "pfad") {
                            var pfadArray = $(element).text().split("|");

                            feature[attr] = pfadArray;
                        }
                        else if (attr === "geom") {
                            coordEle = $(element).find("gml\\:pos")[0];
                            coord = $(coordEle).text().split(" ");

                            feature[attr] = [parseFloat(coord[0]), parseFloat(coord[1])];
                        }
                        else {
                            feature[attr] = $(element).text();
                        }
                    }
                    // else {
                    //     feature[attr] = "DUMMY <a href='http://www.hamburg.de/contentblob/4594724/3696a6bc1f054a94eb559f274a8a9c04/data/flyer-notkestrasse.pdf' target='_blank'>Flyer </a>(PDF)";
                    // }
                }, this);
                featureType = $(hit).children()[0].localName;
                feature.featureType = featureType;
                feature.imgSrc = Radio.request("Util", "getPath", Config.wfsImgPath) + featureType + ".svg";
                this.getFeatures().push(feature);
            }, this);
        },

        /**
         * Sammelt alle Features aus einem Bezirk und
         * sortiert sie alphabetisch nach Stadtteil + Straße
         * Triggert das Event "render"
         * @param  {String} value - Name des Bezirks
         */
        filterFeaturesByBezirk: function (value) {
            var filteredFeatures = _.filter(this.getFeatures(), function (feature) {
                return feature.bezirk.toUpperCase().trim() === value.toUpperCase().trim();
            });

            filteredFeatures = this.sortFeatures(filteredFeatures, this.getRanking());

            this.setFilteredFeatures(filteredFeatures);
            this.trigger("render");
            Radio.trigger("ZoomToGeometry", "setIsRender", true);
            Radio.trigger("ZoomToGeometry", "zoomToGeometry", value);
        },
        /**
         *  Sorts features by given Ranking and bezirk and stadtteil
         * @param {olFeatures} Features to be sorted
         * @param {ranking} ranking used as first sort criteria
         */
        sortFeatures: function (features, ranking) {
                features = _.sortBy(features, function (obj) {
                    return [ranking.indexOf(obj.featureType.toLowerCase()), obj.stadtteil].join("_");
                });
            return features;
        },

        /**
         * Sortiert alle Features nach Stadtteil + Straße
         * Triggert das Event "render"
         * @return {[type]} [description]
         */
        sortAllFeatures: function () {
            var features = this.sortFeatures(this.getFeatures(), this.getRanking());

            this.setFilteredFeatures(features);
            this.trigger("render");
            Radio.trigger("ZoomToGeometry", "setIsRender", false);
            Radio.trigger("MapView", "resetView");
        },

        setFilteredFeatures: function (value) {
            this.set("filteredFeatures", value);
        },

        getFeatures: function () {
            return this.get("features");
        },

        getLayerIds: function () {
            return this.get("layerIds");
        },

        getRanking: function () {
            return this.get("ranking");
        }
    });

    return TableModel;
});
