define(function (require) {

    var Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Layer = require("modules/core/modelList/layer/model"),
        WMSLayer = require("modules/core/modelList/layer/wms"),
        WFSLayer = require("modules/core/modelList/layer/wfs"),
        GeoJSONLayer = require("modules/core/modelList/layer/geojson"),
        SensorLayer = require("modules/core/modelList/layer/sensor"),
        HeatmapLayer = require("modules/core/modelList/layer/heatmap"),
        GroupLayer;

    GroupLayer = Layer.extend({
        defaults: _.extend({}, Layer.prototype.defaults, {
            childLayer: []
        }),

        initialize: function () {
            Layer.prototype.initialize.apply(this);
            // this.setLayerdefinitions(this.groupLayerObjectsByUrl(this.get("layerdefinitions")));
            // this.setAttributes();
        },

        /**
         * Bei GruppenLayern sind die LayerSource die childLayers.
         * Damit die childLayer nicht die layer.initialize() durchlaufen,
         * wird isChildLayer: true gesetzt.
         * 
         * @return {void}
         */
        createLayerSource: function () {
            _.each(this.get("layerdefinitions"), function(childLayerDefinition) {
                // ergänze isChildLayer für initialize
                _.extend(childLayerDefinition, {
                    isChildLayer: true
                });

                if (childLayerDefinition.typ === "WMS") {
                    this.get("childLayer").push(new WMSLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "WFS") {
                    if (childLayerDefinition.outputFormat === "GeoJSON") {
                        this.get("childLayer").push(new GeoJSONLayer(childLayerDefinition));
                    }
                    this.get("childLayer").push(new WFSLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "GeoJSON") {
                    this.get("childLayer").push(new GeoJSONLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "SensorThings" || childLayerDefinition.typ === "ESRIStreamLayer") {
                    this.get("childLayer").push(new SensorLayer(childLayerDefinition));
                }
                else if (childLayerDefinition.typ === "Heatmap") {
                    this.get("childLayer").push(new HeatmapLayer(childLayerDefinition));
                }

                _.last(this.get("childLayer")).prepareLayerObject();
            }, this);
        },

        /**
         * Erzeugt einen Gruppenlayer mit den childLayern
         * 
         * @return {void}
         */
        createLayer: function () {
            var layers = _.map(this.get("childLayer"), function (layer) {
                    return layer.get("layer");
                }),
                groupLayer = new ol.layer.Group({
                    layers: layers
                });

            this.setLayer(groupLayer);
        },

        // setAttributes: function () {
        //     var gfiParams = [];

        //     _.each(this.get("layerdefinitions"), function (layerdef, index) {
        //         if (layerdef.gfiAttributes !== "ignore") {
        //             gfiParams.push({
        //                 featureCount: layerdef.featureCount ? layerdef.featureCount : 1,
        //                 infoFormat: layerdef.infoFormat ? layerdef.infoFormat : "text/xml",
        //                 gfiAttributes: layerdef.gfiAttributes,
        //                 name: layerdef.name,
        //                 typ: layerdef.typ,
        //                 gfiTheme: layerdef.gfiTheme,
        //                 childLayerIndex: index
        //             });
        //         }
        //     }, this);

        //     this.setGfiParams(gfiParams);
        // },
        /**
         * Groups layerdefinitions by url.
         * If gfiAttributes is set on group layer-object,
         *     then the gfi-Attributes for sublayers are overwitten and can be grouped.
         * Else the gfiAttributes of all layers are taken.
         *
         * If the gfiAttributes of all layers are equal, then the layers can be aggregated.
         * Otherwise the layers can not be grouped by url.
         * @param {array} layerDefinitions - definitions from all layers
         * @returns {array} newLayerDefs
         */
        // groupLayerObjectsByUrl: function (layerDefinitions) {
        //     var groupByUrl = _.groupBy(layerDefinitions, "url"),
        //         newLayerDefs = [];

        //     _.each(groupByUrl, function (layerGroup) {
        //         var newLayerObj = _.clone(layerGroup[0]),
        //             gfiAttributes = this.get("gfiAttributes");
        //         gfiAttributes = this.groupGfiAttributes(gfiAttributes, layerGroup);

        //         if (_.isObject(gfiAttributes) && !_.isString(gfiAttributes)) {
        //             // get all layers for service
        //             newLayerObj.layers = _.pluck(layerGroup, "layers").toString();
        //             // calculate maxScale from all Layers
        //             newLayerObj.maxScale = _.max(_.pluck(layerGroup, "maxScale"), function (scale) {
        //                 return parseInt(scale, 10);
        //             });
        //             // calculate minScale from all Layers
        //             newLayerObj.minScale = _.min(_.pluck(layerGroup, "minScale"), function (scale) {
        //                 return parseInt(scale, 10);
        //             });
        //             newLayerObj.gfiAttributes = gfiAttributes;
        //             newLayerDefs.push(newLayerObj);
        //         }
        //         else {
        //             _.each(layerGroup, function (layer) {
        //                 layer.gfiAttributes = gfiAttributes;
        //                 newLayerDefs.push(layer);
        //             });
        //         }
        //     }, this);

        //     return newLayerDefs;
        // },

        /**
         * get the attributes from layergroup
         * is gfiAttributes not undefined then returns the input gfiAttributes
         * @param {undefined|object} gfiAttributes - default is undefined
         * @param {array} layerGroup - contains the params from the layers
         * @returns {string|object} attr
         */
        // groupGfiAttributes: function (gfiAttributes, layerGroup) {
        //     var attr = gfiAttributes;

        //     if (_.isUndefined(attr)) {
        //         attr = _.pluck(layerGroup, "gfiAttributes");

        //         if (_.isArray(attr)) {
        //             attr = attr.length === 1 ? attr[0] : _.uniq(attr).toString();
        //         }
        //     }

        //     return attr;
        // },

        // createLayerSource: function () {
        //     // TODO noch keine Typ unterscheidung -> nur WMS
        //     // this.createChildLayerSources(this.get("layerdefinitions"));
        //     // this.createChildLayers(this.get("layerdefinitions"));
        //     this.setMaxScale(this.get("id"));
        //     this.setMinScale(this.get("id"));
        //     this.createLayer();
        // },

        // createChildLayerSources: function (childlayers) {
        //     var sources = [];

        //     _.each(childlayers, function (child) {
        //         var source = new ol.source.TileWMS({
        //             url: child.url,
        //             params: {
        //                 LAYERS: child.layers,
        //                 FORMAT: child.format,
        //                 VERSION: child.version,
        //                 TRANSPARENT: true
        //             }
        //         });

        //         sources.push(source);
        //         child.source = source;
        //     });
        //     this.setChildLayerSources(sources);
        // },

        // createChildLayers: function (childlayers) {
        //     var layer = new ol.Collection();

        //     _.each(childlayers, function (childLayer, index) {
        //         layer.push(new ol.layer.Tile({
        //             source: this.get("childLayerSources")[index]
        //         }));
        //     }, this);
        //     this.setChildLayers(layer);
        // },

        // createLayer: function () {
        //     var groupLayer = new ol.layer.Group({
        //         layers: this.get("childlayers")
        //     });

        //     this.setLayer(groupLayer);
        // },

        /**
         * Erzeugt das legendenURL-Array des Gruppenlayers durch Abfrage und 
         * Zusammenführungder der child-Rückgaben
         * @return {void}
         */
        createLegendURL: function () {
            _.each(this.get("childLayer"), function (childLayer) {
                childLayer.createLegendURL();
            }, this);
        },

        /**
         * Diese Funktion initiiert für den abgefragten Layer die Darstellung der Information und Legende.
         * @returns {void}
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
                "id": this.get("id"),
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
         * @param {Ol.source[]} value - value
         * @returns {void}
         */
        // setChildLayerSources: function (value) {
        //     this.set("childLayerSources", value);
        // },

        /**
         * Setter für das Attribut "childlayers"
         * @param {Ol.Collection} value - Eine Ol.Collection mit Ol.layer Objekten
         * @returns {void}
         */
        // setChildLayers: function (value) {
        //     this.set("childlayers", value);
        // },

        setMaxScale: function (layerId) {
            var layer = Radio.request("RawLayerList", "getLayerAttributesWhere", {"id": layerId});

            this.set("maxScale", layer.maxScale);
        },

        setMinScale: function (layerId) {
            var layer = Radio.request("RawLayerList", "getLayerAttributesWhere", {"id": layerId});

            this.set("minScale", layer.minScale);
        },

        setGfiParams: function (value) {
            this.set("gfiParams", value);
        },

        getGfiUrl: function (gfiParams, coordinate, index) {
            var resolution = Radio.request("MapView", "getResolution").resolution,
                projection = Radio.request("MapView", "getProjection"),
                childLayer = this.get("childlayers").item(index);

            return childLayer.getSource().getGetFeatureInfoUrl(coordinate, resolution, projection, {INFO_FORMAT: gfiParams.infoFormat, FEATURE_COUNT: gfiParams.featureCount});
        },

        /**
        * Prüft anhand der Scale aller childLayer, ob der Layer sichtbar ist oder nicht
        * @param {object} options
        * @returns {void}
        **/
        checkForScale: function (options) {
            var isOutOfRange = false;

            _.each(this.get("childLayer"), function (childLayer) {
                if (parseFloat(options.scale, 10) >= childLayer.get("maxScale") || parseFloat(options.scale, 10) <= childLayer.get("minScale")) {
                    isOutOfRange = true                    
                }
            });
            this.setIsOutOfRange(isOutOfRange);
        },

        // setter for layerdefinitions
        setLayerdefinitions: function (value) {
            this.set("layerdefinitions", value);
        }

    });

    return GroupLayer;
});
