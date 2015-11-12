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
            options: [
                {
                    resolution: 66.14579761460263,
                    scale: "250000",
                    zoomLevel: 0
                },
                {
                    resolution: 26.458319045841044,
                    scale: "100000",
                    zoomLevel: 1
                },
                {
                    resolution: 15.874991427504629,
                    scale: "60000",
                    zoomLevel: 2
                },
                {
                    resolution: 10.583327618336419,
                    scale: "40000",
                    zoomLevel: 3
                },
                {
                    resolution: 5.2916638091682096,
                    scale: "20000",
                    zoomLevel: 4
                },
                {
                    resolution: 2.6458319045841048,
                    scale: "10000",
                    zoomLevel: 5
                },
                {
                    resolution: 1.3229159522920524,
                    scale: "5000",
                    zoomLevel: 6
                },
                {
                    resolution: 0.6614579761460262,
                    scale: "2500",
                    zoomLevel: 7
                },
                {
                    resolution: 0.2645831904584105,
                    scale: "1000",
                    zoomLevel: 8
                },
                {
                    resolution: 0.13229159522920521,
                    scale: "500",
                    zoomLevel: 9
                }
            ],
            resolutions: [
                66.14579761460263, // 1:250000
                26.458319045841044, // 1:100000
                15.874991427504629, // 1:60000
                10.583327618336419, // 1:40000
                5.2916638091682096, // 1:20000
                2.6458319045841048, // 1:10000
                1.3229159522920524, // 1:5000
                0.6614579761460262, // 1:2500
                0.2645831904584105, // 1:1000
                0.13229159522920521 // 1:500
            ],
            zoomLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // zoomLevel 0 = 1:250000
            resolution: 15.874991427504629,
            startCenter: [565874, 5934140],
            units: "m",
            DOTS_PER_INCH: $("#dpidiv").outerWidth() // Hack um die Bildschirmauflösung zu bekommen
        },

        /**
         *
         */
        initialize: function () {
            this.listenTo(EventBus, {
                "mapView:getResolutions": function () {
                    EventBus.trigger("mapView:sendResolutions", this.get("resolutions"));
                },
                "mapView:getMinResolution": function (scale) {
                    EventBus.trigger("mapView:sendMinResolution", this.getResolution(scale));
                },
                "mapView:getMaxResolution": function (scale) {
                    EventBus.trigger("mapView:sendMaxResolution", this.getResolution(scale));
                },
                "mapView:getOptions": function () {
                    EventBus.trigger("mapView:sendOptions", _.findWhere(this.get("options"), {resolution: this.get("resolution")}));
                },
                "mapView:getCenterAndZoom": function () {
                    EventBus.trigger("mapView:sendCenterAndZoom", this.getCenter(), this.getZoom());
                },
                "mapView:setScale": this.setScale,
                "mapView:setZoomLevelUp": this.setZoomLevelUp,
                "mapView:setZoomLevelDown": this.setZoomLevelDown,
                "mapView:setCenter": this.setCenter
            });

            this.listenTo(this, {
                "change:resolution": function () {
                    EventBus.trigger("mapView:sendOptions", _.findWhere(this.get("options"), {resolution: this.get("resolution")}));
                },
                "change:center": function () {
                    EventBus.trigger("mapView:sendCenter", this.get("center"));
                },
                "change:scale": function () {
                    var params = _.findWhere(this.get("options"), {scale: this.get("scale")});

                    this.set("resolution", params.resolution);
                    this.get("view").setResolution(this.get("resolution"));
                }
            });

            this.setOptions();
            this.setExtent();
            this.setResolution();
            this.setResolutions();
            this.setStartCenter();
            this.setProjection();
            this.setView();

            // Listener für ol.View
            this.get("view").on("change:resolution", function () {
                this.set("resolution", this.get("view").getResolution());
            }, this);
            this.get("view").on("change:center", function () {
                this.set("center", this.get("view").getCenter());
            }, this);
        },

        setOptions: function () {
            if (_.has(Config.view, "options")) {
                _.each(Config.view.options, function (opt) {
                    this.pushHits("options", opt);
                }, this);
            }
        },

        /**
         *
         */
        setExtent: function () {
            if (Config.view.extent && _.isArray(Config.view.extent) && Config.view.extent.length === 4) {
                this.set("extent", Config.view.extent);
            }
        },

        // Setzt die Resolution.
        setResolution: function () {
            if (Config.view.resolution && _.isNumber(Config.view.resolution)) {
                this.set("resolution", Config.view.resolution);
            }
            if (_.has(Config.view, "zoomLevel")) {
                this.set("resolution", this.get("resolutions")[Config.view.zoomLevel]);
            }
        },

        // Setzt den Maßstab.
        setScale: function (scale) {
            this.set("scale", scale);
        },

        /**
         *
         */
        setResolutions: function () {
            if (_.has(Config.view, "options")) {
                this.set("resolutions", _.pluck(Config.view.options, "resolution"));
            }
            else if (Config.view.resolutions && _.isArray(Config.view.resolutions)) {
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
                extent: this.get("extent"),
                axisOrientation: "enu",
                global: false
            });

            ol.proj.addProjection(proj);

            // attach epsg and projection object to Config.view for further access by other modules
            Config.view.epsg = proj.getCode();
            Config.view.proj = proj;

            this.set("projection", proj);
        },

        /**
         *
         */
        setView: function () {
            var view = new ol.View({
                projection: this.get("projection"),
                center: this.get("startCenter"),
                extent: this.get("extent"),
                resolution: this.get("resolution"),
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

        getCenter: function () {
            return this.get("view").getCenter();
        },

        getResolution: function (scale) {
            var units = this.get("units"),
                mpu = ol.proj.METERS_PER_UNIT[units],
                dpi = this.get("DOTS_PER_INCH"),
                resolution = scale / (mpu * 39.37 * dpi);

            return resolution;
        },

        /**
         *
         * @return {[type]} [description]
         */
        getZoom: function () {
            console.log(this.get("view").getZoom());
            return this.get("view").getZoom();
        },

        pushHits: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        }
    });

    return new MapView();
});
