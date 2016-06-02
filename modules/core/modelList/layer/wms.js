define([
    "modules/core/modelList/layer/model",
    "backbone.radio",
    "openlayers"
], function () {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        WMSLayer;

    WMSLayer = Layer.extend({

        /**
         * [createLayerSource description]
         * @return {[type]} [description]
         */
        createLayerSource: function () {
            var params;

            params = {
                t: new Date().getMilliseconds(),
                zufall: Math.random(),
                LAYERS: this.getLayers(),
                FORMAT: (this.getImageFormat() === "nicht vorhanden") ? "image/png" : this.getImageFormat(),
                VERSION: this.getVersion(),
                TRANSPARENT: this.getTransparent().toString()
            };

            if (this.get("styles") && this.get("styles") !== "" && this.get("styles") !== "nicht vorhanden") {
                params = _.extend(params, {
                    STYLES: this.get("styles")
                });
            }
            this.set("tileloaderror", false);
            if (this.get("singleTile") !== true) {
                this.set("tileCountloaderror", 0);
                this.set("tileCount", 0);
                var source = new ol.source.TileWMS({
                    url: this.get("url"),
                    attributions: this.get("olAttribution"),
                    gutter: this.get("gutter"),
                    params: params,
                    tileGrid: new ol.tilegrid.TileGrid({
                        resolutions: Radio.request("MapView", "getResolutions"),
                        origin: [
                            442800,
                            5809000
                        ],
                        tileSize: parseInt(this.get("tilesize"), 10)
                    })
                });

                var context = this;

                source.on("tileloaderror", function(event) {
                  if (context.get("tileloaderror") === false) {
                    context.set("tileloaderror", true);
                    if (!navigator.cookieEnabled) {
                        if (context.get("url").indexOf("wms_webatlasde") !== -1) {
                            EventBus.trigger("alert", {text: "<strong>Bitte erlauben sie Cookies, damit diese Hintergrundkarte geladen werden kann.</strong>", kategorie: "alert-warning"});
                        }
                    }
                  }

                });

                this.setLayerSource(source);
            }
            else {
                this.setLayerSource(new ol.source.ImageWMS({
                    url: this.get("url"),
                    attributions: this.get("olAttribution"),
                    params: params,
                    resolutions: Radio.request("MapView", "getResolutions")
                }));
            }
        },

        /**
         * [createLayer description]
         * @return {[type]} [description]
         */
        createLayer: function () {
            var layerobjects = {
                id: this.getId(),
                source: this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                legendURL: this.get("legendURL"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
                infoFormat: this.get("infoFormat")
            };

            if (this.getSingleTile() !== true) {
                this.setLayer(new ol.layer.Tile(layerobjects));
            }
            else {
                this.setLayer(new ol.layer.Image(layerobjects));
            }
        },

        /**
         * Wenn der Parameter "legendURL" leer ist, wird er auf GetLegendGraphic gesetzt.
         * @return {[type]} [description]
         */
        createLegendURL: function () {
            if (this.get("legendURL") === "" || this.get("legendURL") === undefined) {
                var layerNames = this.get("layers").split(","),
                    legendURL = [];

                if (layerNames.length === 1) {
                    legendURL.push(this.get("url") + "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + this.get("layers"));
                }
                else if (layerNames.length > 1) {
                    _.each(layerNames, function (layerName) {
                        legendURL.push(this.get("url") + "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layerName);
                    }, this);
                }
                this.set("legendURL", legendURL);
            }
        },

        /**
         * [getLayers description]
         * @return {[type]} [description]
         */
        getLayers: function () {
            return this.get("layers");
        },

        getSingleTile: function () {
            return this.get("singleTile");
        }
    });

    return WMSLayer;
});
