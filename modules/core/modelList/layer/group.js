define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "modules/core/modelList/layer/model"
], function (Backbone, Radio, ol, Layer) {

    var GroupLayer = Layer.extend({
        initialize: function () {
            this.superInitialize();
        },

        /**
         *
         */
        setAttributes: function () {
            var gfiParams = [];

            _.each(this.get("layerdefinitions"), function (layerdef) {
                if (layerdef.gfiAttributes !== "ignore") {
                    gfiParams.push({
                        featureCount: layerdef.featureCount ? layerdef.featureCount : 1,
                        infoFormat: layerdef.infoFormat ? layerdef.infoFormat : "text/xml",
                        gfiAttributes: layerdef.gfiAttributes,
                        name: layerdef.name,
                        typ: layerdef.typ,
                        gfiTheme: layerdef.gfiTheme
                    });
                }
            }, this);

            this.setGfiParams(gfiParams);
        },

        /**
         *
         */
        createLayerSource: function () {
            // TODO noch keine Typ unterscheidung -> nur WMS
            this.createChildLayerSources(this.get("layerdefinitions"));
            this.createChildLayers(this.get("layerdefinitions"));
            this.setMaxScale(this.get("id"));
            this.setMinScale(this.get("id"));
            this.createLayer();
        },

        /**
         * [createChildLayerSource description]
         * @return {[type]} [description]
         */
        createChildLayerSources: function (childlayers) {
            var sources = [];

            _.each(childlayers, function (child) {
                var source = new ol.source.TileWMS({
                    url: child.url,
                    params: {
                        LAYERS: child.layers,
                        FORMAT: child.format,
                        VERSION: child.version,
                        TRANSPARENT: true
                    }
                });

                sources.push(source);
                child.source = source;
            });
            this.setChildLayerSources(sources);
        },

        /**
         * [createChildLayer description]
         * @return {[type]} [description]
         */
        createChildLayers: function (childlayers) {
            var layer = new ol.Collection();

            _.each(childlayers, function (childLayer, index) {
                layer.push(new ol.layer.Tile({
                    source: this.getChildLayerSources()[index]
                }));
            }, this);
            this.setChildLayers(layer);
        },

        /**
         *
         */
        createLayer: function () {
            var groupLayer = new ol.layer.Group({
                layers: this.getChildLayers()
            });

            this.setLayer(groupLayer);
        },

        /**
         * [createLegendURL description]
         * @return {[type]} [description]
         */
        createLegendURL: function () {
            var legendURL = [];

            _.each(this.get("layerdefinitions"), function (layer) {
                if (layer.legendURL === "" || layer.legendURL === undefined) {
                    var layerNames = layer.layers.split(",");

                    if (layerNames.length === 1) {
                        legendURL.push(layer.url + "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layer.layers);
                    }
                    else if (layerNames.length > 1) {
                        _.each(layerNames, function (layerName) {
                            legendURL.push(this.get("url") + "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layerName);
                        }, this);
                    }
                }
                else {
                    legendURL.push(layer.legendURL);
                }
            }, this);
            this.set("legendURL", legendURL);
        },

        /**
         * Diese Funktion initiiert für den abgefragten Layer die Darstellung der Information und Legende.
         */
        showLayerInformation: function () {
            var metaID = [],
                legendParams = Radio.request("Legend", "getLegendParams"),
                name = this.get("name"),
                legendURL = !_.isUndefined(_.findWhere(legendParams, {layername: name})) ? _.findWhere(legendParams, {layername: name}) : null;

            _.each(this.get("layerdefinitions"), function (layer) {
                var layerMetaId = layer.datasets && layer.datasets[0] ? layer.datasets[0].md_id : null;

                if (layerMetaId) {
                    metaID.push(layerMetaId);
                }
            });

            Radio.trigger("LayerInformation", "add", {
                "id": this.getId(),
                "legendURL": legendURL,
                "metaID": metaID,
                "layername": name
            });

            this.setLayerInfoChecked(true);
        },

        /**
         * Setter für das Attribut "childLayerSources"
         * @param {ol.source[]} value
         */
        setChildLayerSources: function (value) {
            this.set("childLayerSources", value);
        },

        /**
         * Setter für das Attribut "childlayers"
         * @param {ol.Collection} - Eine ol.Collection mit ol.layer Objekten
         */
        setChildLayers: function (value) {
            this.set("childlayers", value);
        },

        /**
        * Getter für das Attribute "childLayerSources"
        * @return {ol.source[]}
        */
        getChildLayerSources: function () {
            return this.get("childLayerSources");
        },

        /**
         * Getter für das Attribut "childlayers"
         * @return {ol.Collection} - Eine ol.Collection mit ol.layer Objekten
         */
        getChildLayers: function () {
            return this.get("childlayers");
        },

        /**
         *
         *
         */
        setMaxScale: function (layerId) {
            var layer = Radio.request("RawLayerList", "getLayerAttributesWhere", {"id": layerId});

            this.set("maxScale", layer.maxScale);
        },

        /**
         *
         *
         */
        setMinScale: function (layerId) {
            var layer = Radio.request("RawLayerList", "getLayerAttributesWhere", {"id": layerId});

            this.set("minScale", layer.minScale);
        },

        setGfiParams: function (value) {
            this.set("gfiParams", value);
        },

        getGfiParams: function () {
            return this.get("gfiParams");
        },

        getGfiUrl: function (index) {
            var resolution = Radio.request("MapView", "getResolution").resolution,
                projection = Radio.request("MapView", "getProjection"),
                coordinate = Radio.request("GFI", "getCoordinate"),
                gfiParams = this.getGfiParams()[index],
                childLayer = this.getChildLayers().item(index);

            return childLayer.getSource().getGetFeatureInfoUrl(coordinate, resolution, projection, {INFO_FORMAT: gfiParams.infoFormat, FEATURE_COUNT: gfiParams.featureCount});
        }

    });

    return GroupLayer;
});
