define([
    "backbone",
    "openlayers",
    "eventbus",
    "modules/layer/Layer"
], function (Backbone, ol, EventBus, Layer) {

    var WMSLayer = Layer.extend({

        // Setzt die Resolutions für das TileGrid.
        setResolutions: function (resolutions) {
            this.set("resolutions", resolutions);
        },

        // Setzt die minimale Resolution für den Layer
        setMinResolution: function (resolution) {
            resolution = Math.floor(resolution * 100000000000000) / 100000000000000;
            this.get("layer").setMinResolution(resolution);
        },

        // Setzt die maximale Resolution für den Layer
        setMaxResolution: function (resolution) {
            resolution = Math.floor(resolution * 100000000000) / 100000000000 + 0.00000000001;
            this.get("layer").setMaxResolution(resolution);
        },

        // Setzt die aktuelle Resolution.
        setViewResolution: function (obj) {
            this.set("viewResolution", obj.resolution);
        },

        // Prüft ob der Layer in der aktuellen Resolution zu sehen ist und setzt den Parameter "isResolutionInRange".
        setIsResolutionInRange: function () {
            var maxResolution = this.get("layer").getMaxResolution(),
                minResolution = this.get("layer").getMinResolution();

            if (this.get("viewResolution") < maxResolution && this.get("viewResolution") >= minResolution) {
                this.set("isResolutionInRange", true);
            }
            else {
                this.set("isResolutionInRange", false);
            }
        },

        // Wenn der Parameter "legendURL" leer ist, wird er auf GetLegendGraphic gesetzt.
        setLegendURL: function () {
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
         *
         */
        setAttributionLayerSource: function () {
            EventBus.trigger("mapView:getResolutions");
            var version,
                format,
                params;

            if (this.get("version") && this.get("version") !== "" && this.get("version") !== "nicht vorhanden") {
                version = this.get("version");
            }
            else {
                version = "1.3.0";
            }
            if (this.get("format") && this.get("format") !== "" && this.get("format") !== "nicht vorhanden") {
                format = this.get("format");
            }
            else {
                format = "image/png";
            }
            params = {
                t: new Date().getMilliseconds(),
                zufall: Math.random(),
                LAYERS: this.get("layers"),
                FORMAT: format,
                VERSION: version,
                TRANSPARENT: this.get("transparent").toString()
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
                        resolutions: this.get("resolutions"),
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

                this.set("source", source);
            }
            else {
                this.set("source", new ol.source.ImageWMS({
                    url: this.get("url"),
                    attributions: this.get("olAttribution"),
                    params: params,
                    resolutions: this.get("resolutions")
                }));
            }
        },

        /**
         * Erzeugt ein Layerobject abhängig von "singleTile"
         */
        setAttributionLayer: function () {
            var layerobjects = {
                    source: this.get("source"),
                    name: this.get("name"),
                    typ: this.get("typ"),
                    gfiAttributes: this.get("gfiAttributes"),
                    legendURL: this.get("legendURL"),
                    routable: this.get("routable"),
                    gfiTheme: this.get('gfiTheme'),
                    infoFormat: this.get("infoFormat")
            };

            if (this.get("singleTile") !== true) {
                this.set("layer", new ol.layer.Tile(layerobjects));
            }
            else {
                this.set("layer", new ol.layer.Image(layerobjects));
            }
        },

        updateSourceSLDBody: function () {
            this.get("source").updateParams({SLD_BODY: this.get("SLDBody"), STYLES: this.get("paramStyle")});
        }
    });

    return WMSLayer;
});
