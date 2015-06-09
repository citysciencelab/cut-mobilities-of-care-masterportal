define ([
    "backbone",
    "openlayers",
    "config",
    "eventbus"
], function (Backbone, ol, Config, EventBus) {

    var MapView = Backbone.Model.extend({

        /**
         *
         */
        defaults: {
            startExtent: [510000.0, 5850000.0, 625000.4, 6000000.0],
            startResolution: 15.874991427504629,
            startCenter: [565874, 5934140],
            units: "m",
            DOTS_PER_INCH: $("#dpidiv").outerWidth() // Hack um die Bildschirmauflösung zu bekommen
        },

        /**
         *
         */
        initialize: function () {
            this.setStartExtent();
            this.setStartResolution();
            this.setStartCenter();
            this.setProjection();
            this.setView();

            // View listener
            this.get("view").on("change:resolution", function () {
                EventBus.trigger("currentMapScale", Math.round(this.getScale()));
            }, this);
            this.get("view").on("change:center", function () {
                EventBus.trigger("currentMapCenter", this.get("view").getCenter());
            }, this);
            EventBus.on("setCenter", this.setCenter, this);
            EventBus.on("setZoomLevelUp", this.setZoomLevelUp, this);
            EventBus.on("setZoomLevelDown", this.setZoomLevelDown, this);
        },

        /**
         *
         */
        setStartExtent: function () {
            if (Config.view.extent && _.isArray(Config.view.extent) && Config.view.extent.length === 4) {
                this.set("startExtent", Config.view.extent);
            }
        },

        /**
         *
         */
        setStartResolution: function () {
            if (Config.view.resolution && _.isNumber(Config.view.resolution)) {
                this.set("startResolution", Config.view.resolution);
            }
        },

        /**
         *
         */
        setStartCenter: function () {
            if (Config.view.center && _.isArray(Config.view.resolution) && Config.view.extent.length === 2) {
                this.set("startCenter", Config.view.resolution);
            }
        },

        /**
         *
         */
        setProjection: function () {
            var proj = new ol.proj.Projection({
                code: "EPSG:25832",
                units: this.get("units"),
                extent: this.get("startExtent"),
                axisOrientation: "enu",
                global: false
            });

            this.set("projection", proj);
        },

        /**
         *
         */
        setView: function () {
            var view = new ol.View({
                projection: this.get("projection"),
                center: Config.view.center,
                extent: this.get("startExtent"),
                resolution: this.get("startResolution"),
                resolutions: [66.14579761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105]
            });

            this.set("view", view);
        },

        /**
         *
         */
        setCenter: function (coords, zoomLevel) {
            this.get("view").setCenter(coords);
            if (!_.isUndefined(zoomLevel)) {
                this.get("view").setZoom(zoomLevel);
            }
        },

        /**
         *
         */
        setZoomLevelUp: function () {
            this.get("view").setZoom(this.getZoom() + 1);
        },

        /**
         *
         */
        setZoomLevelDown: function () {
            this.get("view").setZoom(this.getZoom() - 1);
        },

        /**
         *
         * @return {[type]} [description]
         */
        getScale: function () {
            var resolution = this.get("view").getResolution(),
                units = this.get("units"),
                mpu = ol.proj.METERS_PER_UNIT[units],
                dpi = this.get("DOTS_PER_INCH"),
                scale = resolution * mpu * 39.37 * dpi;

            return scale;
        },

        /**
         *
         * @return {[type]} [description]
         */
        getZoom: function () {
            return this.get("view").getZoom();
        }
    });

    return new MapView();
});
