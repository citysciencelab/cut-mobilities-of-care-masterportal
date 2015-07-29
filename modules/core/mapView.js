define([
    "backbone",
    "openlayers",
    "config",
    "eventbus",
    "proj4"
], function (Backbone, ol, Config, EventBus, proj4) {
    "use strict";
    var MapView = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            startExtent: [510000.0, 5850000.0, 625000.4, 6000000.0],
            resolutions: [
                66.145965625264583, // 1:250000
                26.458386250105834, // 1:100000
                15.875031750063500, // 1:60000
                10.583354500042333, // 1:40000
                5.2916772500211667, // 1:20000
                2.6458386250105834, // 1:10000
                1.3229193125052917, // 1:5000
                0.6614596562526458, // 1:2500
                0.2645838625010583 // 1:1000
            ],
            startResolution: 15.875031750063500,
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
            this.setStartScale();
            this.setResolutions();
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
            EventBus.on("mapView:requestProjection", this.replyProjection, this);
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
        setStartScale: function () {
            var resolution = this.get("startResolution"),
                units = this.get("units"),
                mpu = ol.proj.METERS_PER_UNIT[units],
                dpi = this.get("DOTS_PER_INCH"),
                scale = resolution * mpu * 39.37 * dpi;

            this.set("startScale", Math.round(scale));
        },

        /**
         *
         */
        setResolutions: function () {
            if (Config.view.resolutions && _.isArray(Config.view.resolutions)) {
                this.set("resolutions", Config.view.resolutions);
            }
        },

        /**
         *
         */
        setStartCenter: function () {
            if (Config.view.center && _.isArray(Config.view.center)) {
                this.set("startCenter", Config.view.center);
            }
        },

        /**
         *
         */
        setProjection: function () {
            // supported projections
            switch (Config.view.epsg){
                case "EPSG:25833": {
                    proj4.defs("EPSG:25833", "+proj=utm +zone=33 +ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs");
                    break;
                }
                default: {
                    proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
                }
            }

            var proj = new ol.proj.Projection({
                code: Config.view.epsg || "EPSG:25832",
                units: this.get("units"),
                extent: this.get("startExtent"),
                axisOrientation: "enu",
                global: false
            });

            ol.proj.addProjection(proj);

            this.set("projection", proj);
        },

        /**
         *
         */
        setView: function () {
            var view = new ol.View({
                projection: this.get("projection"),
                center: this.get("startCenter"),
                extent: this.get("startExtent"),
                resolution: this.get("startResolution"),
                resolutions: this.get("resolutions")
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
        },

        replyProjection: function () {
            EventBus.trigger("mapView:replyProjection", this.get("view").getProjection());
        }
    });

    return new MapView();
});
