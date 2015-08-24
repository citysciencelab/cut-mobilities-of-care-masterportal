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
        setMinResolution: function () {
            var minScale = parseInt(this.get("minScale"), 10),
                index,
                unionScales,
                scales = [250000, 100000, 60000, 40000, 20000, 10000, 5000, 2500, 1000, 500];

            if (_.contains(scales, minScale)) {
                index = _.indexOf(scales, minScale);
            }
            else {
                unionScales = _.union(scales, [minScale]);
                unionScales = _.sortBy(unionScales, function (number) {
                    return -number;
                });
                index = _.indexOf(unionScales, minScale) - 1;
            }
            this.set("minResolution", this.get("resolutions")[index]);
            this.get("layer").setMinResolution(this.get("minResolution"));
        },

        // Setzt die maximale Resolution für den Layer
        setMaxResolution: function () {
            var maxScale = parseInt(this.get("maxScale"), 10),
                index,
                unionScales,
                scales = [250000, 100000, 60000, 40000, 20000, 10000, 5000, 2500, 1000, 500];

            if (_.contains(scales, maxScale)) {
                index = _.indexOf(scales, maxScale);
            }
            else if (maxScale === 350000) {
                index = 0;
            }
            else {
                 unionScales = _.union(scales, [maxScale]);
                 unionScales = _.sortBy(unionScales, function (number) {
                     return -number;
                 });
                index = _.indexOf(unionScales, maxScale);
            }
            this.set("maxResolution", this.get("resolutions")[index]);
            this.get("layer").setMaxResolution(this.get("maxResolution"));
        },

        // Setzt die aktuelle Resolution.
        setViewResolution: function (resolution) {
            this.set("viewResolution", resolution);
        },

        // Prüft ob der Layer in der aktuellen Resolution zu sehen ist und setzt den Parameter "isResolutionInRange".
        setIsResolutionInRange: function () {
            if (this.get("viewResolution") < this.get("maxResolution") && this.get("viewResolution") >= this.get("minResolution")) {
                this.set("isResolutionInRange", true);
            }
            else {
                this.set("isResolutionInRange", false);
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
            if (this.get("singleTile") !== true) {
                this.set("source", new ol.source.TileWMS({
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
                }));
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
            this.get("source").updateParams({SLD_BODY: this.get("SLDBody")});
        }
    });

    return WMSLayer;
});
