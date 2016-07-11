define([
    "backbone",
    "openlayers",
    "modules/core/modelList/layer/model",
    "modules/core/modelList/layer/wms",
    "modules/core/modelList/layer/wfs",
    "backbone.radio"
], function (Backbone, ol, Layer, WMSLayer, WFSLayer, Radio) {

    /**
     *
     */
    var GroupLayer = Layer.extend({
        /**
         *
         */
        createLayerSource: function () {
            // Erzeuge Layers-Objekt
            var layerdefinitions = this.get("layerdefinitions"),
                childlayers = new ol.Collection(),
                newlayer;
            //
            _.each(layerdefinitions, function (childLayer) {
                this.getChildLayerSource(childLayer);
                    newlayer = new ol.layer.Tile({
                        source: this.getChildLayerSource(childLayer)
                    });

                childlayers.push(newlayer);
                // console.log(newlayer);
            }, this);
            // console.log(childlayers);
            // this.unset("layerdefinitions");
            this.setChildLayers(childlayers);
            this.createLayer();
        },

        /**
         *
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Group({
                layers: this.getChildLayers()
            }));
        },

        getChildLayerSource: function (child) {

            var params = {
                LAYERS: child.layers,
                FORMAT: child.format,
                VERSION: child.version,
                TRANSPARENT: true
            };
            var source = new ol.source.TileWMS({
                url: child.url,
                params: params,
                // tileGrid: new ol.tilegrid.TileGrid({
                //     resolutions: Radio.request("MapView", "getResolutions"),
                //     origin: [
                //         442800,
                //         5809000
                //     ],
                //     tileSize: parseInt(child.tilesize, 10)
                // })
            });
            return source;
        },

        setLegendURL: function () {
            var legendURL = [];

            _.each(this.get("backbonelayers"), function (layer) {
                legendURL.push(layer.get("legendURL")[0]);
            });
            this.set("legendURL", legendURL);
        },

        /**
         * Setter für das Attribut "childlayers"
         * @param {ol.Collection} - Eine ol.Collection mit ol.layer Objekten
         */
        setChildLayers: function (value) {
            this.set("childlayers", value);
        },

        /**
         * Getter für das Attribut "childlayers"
         * @return {ol.Collection} - Eine ol.Collection mit ol.layer Objekten
         */
        getChildLayers: function () {
            return this.get("childlayers");
        },

        showLayerInformation: function () {console.log(this);
                Radio.trigger("LayerInformation", "add", {
                    "id": this.getId(),
                    "legendURL": this.get("legendURL"),
                    // "metaURL": this.get("dt"),
                    "metaID": this.get("datasets")[0].md_id,
                    "name": this.get("datasets")[0].md_name
                });
                // window.open(this.get("metaURL"), "_blank");
        },
    });

    return GroupLayer;
});
