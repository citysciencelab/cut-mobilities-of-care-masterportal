define(function (require) {

    var Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Layer = require("modules/core/modelList/layer/model"),
        GroupLayer;

    GroupLayer = Layer.extend({
        initialize: function () {
            this.superInitialize();
            this.setLayerdefinitions(this.groupLayerObjectsByUrl(this.getLayerdefinitions()));
            this.setAttributes();
        },

        /**
         *
         */
        setAttributes: function () {
            var gfiParams = [];

            _.each(this.getLayerdefinitions(), function (layerdef, index) {
                if (layerdef.gfiAttributes !== "ignore") {
                    gfiParams.push({
                        featureCount: layerdef.featureCount ? layerdef.featureCount : 1,
                        infoFormat: layerdef.infoFormat ? layerdef.infoFormat : "text/xml",
                        gfiAttributes: layerdef.gfiAttributes,
                        name: layerdef.name,
                        typ: layerdef.typ,
                        gfiTheme: layerdef.gfiTheme,
                        childLayerIndex: index
                    });
                }
            }, this);
            this.setGfiParams(gfiParams);
        },
        /**
         * Groups layerdefinitions by url.
         * If gfiAttributes is set on group layer-object,
         *     then the gfi-Attributes for sublayers are overwitten and can be grouped.
         * Else the gfiAttributes of all layers are taken.
         *
         * If the gfiAttributes of all layers are equal, then the layers can be aggregated.
         * Otherwise the layers can not be grouped by url.
         *
         */
        groupLayerObjectsByUrl: function (layerDefinitions) {
            var groupByUrl = _.groupBy(layerDefinitions, "url"),
                newLayerDefs = [],
                gfiAttributes = this.getGfiAttributes();

            _.each(groupByUrl, function (layerGroup) {
                var newLayerObj = _.clone(layerGroup[0]),
                    isGroupable = false;

                gfiAttributes = this.groupGfiAttributes(gfiAttributes, layerGroup);
                if ((_.isObject(gfiAttributes) && !_.isString(gfiAttributes)) || (_.isString(gfiAttributes) && gfiAttributes.indexOf(",") === -1)) {
                    isGroupable = true;
                }
                if (isGroupable) {
                    // get all layers for service
                    newLayerObj.layers = _.pluck(layerGroup, "layers").toString();
                    // calculate maxScale from all Layers
                    newLayerObj.maxScale = _.max(_.pluck(layerGroup, "maxScale"), function (scale) {
                        return parseInt(scale, 10);
                    });
                    // calculate minScale from all Layers
                    newLayerObj.minScale = _.min(_.pluck(layerGroup, "minScale"), function (scale) {
                        return parseInt(scale, 10);
                    });
                    newLayerObj.gfiAttributes = gfiAttributes;
                    newLayerDefs.push(newLayerObj);
                }
                else {
                    _.each(layerGroup, function (layer) {
                        newLayerDefs.push(layer);
                    });
                }
            }, this);
            return newLayerDefs;
        },

        groupGfiAttributes: function (gfiAttributes, layerGroup) {
            if (_.isUndefined(gfiAttributes)) {
                gfiAttributes = _.pluck(layerGroup, "gfiAttributes");
                if (_.isArray(gfiAttributes)) {
                    gfiAttributes = _.uniq(gfiAttributes).toString();
                }
            }
            return gfiAttributes;
        },
        /**
         *
         */
        createLayerSource: function () {
            // TODO noch keine Typ unterscheidung -> nur WMS
            this.createChildLayerSources(this.getLayerdefinitions());
            this.createChildLayers(this.getLayerdefinitions());
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

            _.each(this.getLayerdefinitions(), function (layer) {
                if (layer.legendURL === "" || layer.legendURL === undefined) {
                    var layerNames = layer.layers.split(",");

                    if (layerNames.length === 1) {
                        legendURL.push(layer.url + "?VERSION=" + layer.version + "&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layer.layers);
                    }
                    else if (layerNames.length > 1) {
                        _.each(layerNames, function (layerName) {
                            legendURL.push(this.get("url") + "?VERSION=" + layer.version + "&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layerName);
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

            _.each(this.getLayerdefinitions(), function (layer) {
                var layerMetaId = layer.datasets && layer.datasets[0] ? layer.datasets[0].md_id : null;

                if (layerMetaId) {
                    metaID.push(layerMetaId);
                }
            });

            Radio.trigger("LayerInformation", "add", {
                "id": this.getId(),
                "legendURL": legendURL,
                "metaID": metaID,
                "layername": name,
                "url": null,
                "typ": null
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

        getGfiUrl: function (gfiParams, coordinate, index) {
            var resolution = Radio.request("MapView", "getResolution").resolution,
                projection = Radio.request("MapView", "getProjection"),
                childLayer = this.getChildLayers().item(index);

            return childLayer.getSource().getGetFeatureInfoUrl(coordinate, resolution, projection, {INFO_FORMAT: gfiParams.infoFormat, FEATURE_COUNT: gfiParams.featureCount});
        },
        // getter for layerdefinitions
        getLayerdefinitions: function () {
            return this.get("layerdefinitions");
        },
        // setter for layerdefinitions
        setLayerdefinitions: function (value) {
            this.set("layerdefinitions", value);
        }

    });

    return GroupLayer;
});
