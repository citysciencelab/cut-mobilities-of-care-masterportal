define([
    "backbone",
    "openlayers",
    "eventbus",
    "config",
    "modules/layer/Layer"
], function (Backbone, ol, EventBus, Config, Layer) {

    var WMSLayer = Layer.extend({

        /**
         *
         */
        setAttributionLayerSource: function () {
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
                        resolutions: [
                            66.14614761460263,
                            26.458319045841044,
                            15.874991427504629,
                            10.583327618336419,
                            5.2916638091682096,
                            2.6458319045841048,
                            1.3229159522920524,
                            0.6614579761460262,
                            0.2645831904584105
                        ],
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
                    resolutions: [
                        66.14614761460263,
                        26.458319045841044,
                        15.874991427504629,
                        10.583327618336419,
                        5.2916638091682096,
                        2.6458319045841048,
                        1.3229159522920524,
                        0.6614579761460262,
                        0.2645831904584105
                    ]
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
        }
    });

    return WMSLayer;
});
