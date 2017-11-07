define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "config"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Config = require("config"),
        MapView;

    MapView = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            epsg: "EPSG:25832",
            background: "",
            backgroundImage: "",
            extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
            options: [
                {
                    resolution: 66.14579761460263,
                    scale: 250000,
                    zoomLevel: 0
                },
                {
                    resolution: 26.458319045841044,
                    scale: 100000,
                    zoomLevel: 1
                },
                {
                    resolution: 15.874991427504629,
                    scale: 60000,
                    zoomLevel: 2
                },
                {
                    resolution: 10.583327618336419,
                    scale: 40000,
                    zoomLevel: 3
                },
                {
                    resolution: 5.2916638091682096,
                    scale: 20000,
                    zoomLevel: 4
                },
                {
                    resolution: 2.6458319045841048,
                    scale: 10000,
                    zoomLevel: 5
                },
                {
                    resolution: 1.3229159522920524,
                    scale: 5000,
                    zoomLevel: 6
                },
                {
                    resolution: 0.6614579761460262,
                    scale: 2500,
                    zoomLevel: 7
                },
                {
                    resolution: 0.2645831904584105,
                    scale: 1000,
                    zoomLevel: 8
                },
                {
                    resolution: 0.13229159522920521,
                    scale: 500,
                    zoomLevel: 9
                }
            ],
            resolution: 15.874991427504629,
            startCenter: [565874, 5934140],
            units: "m",
            DOTS_PER_INCH: $("#dpidiv").outerWidth() // Hack um die Bildschirmauflösung zu bekommen
        },

        /**
         *
         */
        initialize: function () {
            var channel = Radio.channel("MapView");

            channel.reply({
                "getProjection": function () {
                    return this.get("projection");
                },
                "getOptions": function () {
                    return (_.findWhere(this.get("options"), {resolution: this.get("resolution")}));
                },
                "getCenter": function () {
                    return this.getCenter();
                },
                "getZoomLevel": function () {
                    return this.getZoom();
                },
                "getResolutions": function () {
                    return this.getResolutions();
                },
                "getResolution": function () {
                    return _.findWhere(this.get("options"), {resolution: this.get("resolution")});
                },
                "getResoByScale": this.getResoByScale,
                "getScales": this.getScales
            }, this);

            channel.on({
                "setCenter": this.setCenter,
                "toggleBackground": this.toggleBackground,
                "setZoomLevelUp": this.setZoomLevelUp,
                "setZoomLevelDown": this.setZoomLevelDown,
                "setScale": this.setScale,
                "resetView": this.resetView
            }, this);

            this.listenTo(this, {
                "change:resolution": function () {
                    channel.trigger("changedOptions", _.findWhere(this.get("options"), {resolution: this.get("resolution")}));

                    // triggert das Zoom in / out übers Mausrad / Touch
                    Radio.trigger("ClickCounter", "zoomChanged");
                },
                "change:center": function () {
                    channel.trigger("changedCenter", this.getCenter());
                },
                "change:scale": function () {
                    var params = _.findWhere(this.get("options"), {scale: this.get("scale")});

                    this.set("resolution", params.resolution);
                    this.get("view").setResolution(this.get("resolution"));
                },
                "change:background": function (model, value) {
                    if (value === "white") {
                        $("#map").css("background", "white");
                    }
                    else {
                        $("#map").css("background", "url('" + value + "') repeat scroll 0 0 rgba(0, 0, 0, 0)");
                    }
                }
            });

            this.setConfig();
            this.setResolutions();
            this.setUrlParams();
            this.setScales();
            this.setZoomLevels();
            this.setProjection();
            this.setView();

            // Listener für ol.View
            this.get("view").on("change:resolution", function () {
                 this.set("resolution", this.get("view").constrainResolution(this.get("view").getResolution()));
                // this.set("resolution", this.get("view").getResolution());
                channel.trigger("changedZoomLevel", this.getZoom());
            }, this);
            this.get("view").on("change:center", function () {
                this.set("center", this.get("view").getCenter());
            }, this);
        },
        resetView: function () {
            this.get("view").setCenter(this.get("startCenter"));
            this.get("view").setResolution(this.get("startResolution"));
            Radio.trigger("MapMarker", "hideMarker");
        },

        /*
        * Finalisierung der Initialisierung für config.json
        */
        setConfig: function () {
            /*
            *   Auslesen und Überschreiben durch Werte aus Config.json
            */
            _.each(Radio.request("Parser", "getItemsByAttributes", {type: "mapView"}), function (setting) {
                switch (setting.id) {
                    case "backgroundImage": {
                        this.set("backgroundImage", setting.attr);

                        this.setBackground(setting.attr);
                        break;
                    }
                    case "startCenter": {
                        this.set("startCenter", setting.attr);
                        break;
                    }
                    case "options": {
                        this.set("options", []);
                        _.each(setting.attr, function (opt) {
                            this.pushHits("options", opt);
                        }, this);
                        break;
                    }
                    case "extent": {
                        this.setExtent(setting.attr);
                        break;
                    }
                    case "resolution": {
                        this.setResolution(setting.attr);
                        this.set("startResolution", this.get("resolution"));
                        break;
                    }
                    case "zoomLevel": {
                        this.setResolution(this.get("options")[setting.attr].resolution);
                        this.set("startResolution", this.get("resolution"));
                        break;
                    }
                    case "epsg": {
                        this.setEpsg(setting.attr);
                        break;
                    }
                }
            }, this);
        },

        setUrlParams: function () {
            /*
            *   Auslesen und Überschreiben durch Werte aus ParamUrl
            */
            var centerFromParamUrl = Radio.request("ParametricURL", "getCenter"),
                zoomLevelFromParamUrl = Radio.request("ParametricURL", "getZoomLevel");

            if (!_.isUndefined(centerFromParamUrl)) {
                this.set("startCenter", centerFromParamUrl);
            }

            if (!_.isUndefined(zoomLevelFromParamUrl)) {
                this.setResolution(this.get("resolutions")[zoomLevelFromParamUrl]);
                this.set("startResolution", this.get("resolution"));
            }
        },

        // getter for epsg
        getEpsg: function () {
            return this.get("epsg");
        },
        // setter for epsg
        setEpsg: function (value) {
            this.set("epsg", value);
        },

        setBackground: function (value) {
            this.set("background", value);
        },

        getBackground: function () {
            return this.get("background");
        },

        toggleBackground: function () {
            if (this.getBackground() === "white") {
                this.setBackground(this.get("backgroundImage"));
            }
            else {
                this.setBackground("white");
            }
        },

        setScales: function () {
            this.set("scales", _.pluck(this.get("options"), "scale"));
        },

        getScales: function () {
            return this.get("scales");
        },

        setResolutions: function () {
            this.set("resolutions", _.pluck(this.get("options"), "resolution"));
        },

        setZoomLevels: function () {
            this.set("zoomLevels", _.pluck(this.get("options"), "zoomLevel"));
        },

        /**
         * Setzt die Resolution auf den Wert val
         * @param {float} val Resolution
         */
        setResolution: function (val) {
            this.set("resolution", val);
        },

        // Setzt den Maßstab.
        setScale: function (scale) {
            this.set("scale", scale);
        },
        // getter for extent
        getExtent: function () {
            return this.get("extent");
        },
        // setter for extent
        setExtent: function (value) {
            this.set("extent", value);
        },

        /**
         * Setzt die ol Projektion anhand des epsg-Codes
         */
        setProjection: function () {
            var epsgCode = this.getEpsg(),
                proj = Radio.request("CRS", "getProjection", epsgCode);

            if (!proj) {
                Radio.trigger("Alert", "alert", "Unknown CRS " + epsgCode + ". Can't set projection.");
                return;
            }

            var proj = new ol.proj.Projection({
                code: epsgCode,
                units: this.get("units"),
                extent: this.getExtent(),
                axisOrientation: "enu",
                global: false
            });

            ol.proj.addProjection(proj);

            // attach epsg and projection object to Config.view for further access by other modules
            Config.view = {
                epsg: proj.getCode(),
                proj: proj
            };

            this.set("projection", proj);
        },

        /**
         *
         */
        setView: function () {
            var view = new ol.View({
                projection: this.get("projection"),
                center: this.get("startCenter"),
                extent: this.getExtent(),
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

        /**
         * Gibt zur Scale die entsprechende Resolution zurück.
         * @param  {String|number} scale
         * @param  {String} scaleType - min oder max
         * @return {number} resolution
         */
        getResoByScale: function (scale, scaleType) {
            var mapViewScales = _.union(this.getScales(), [parseInt(scale, 10)]),
                index;

            mapViewScales = _.sortBy(mapViewScales, function (num) {
                return -num;
            });
            index = _.indexOf(mapViewScales, parseInt(scale, 10));
            if (mapViewScales.length === this.getScales().length) {
                if (scaleType === "max") {
                    return this.getResolutions()[index];
                }
                else if (scaleType === "min") {
                    return this.getResolutions()[index];
                }
            }
            else {
                if (scaleType === "max") {
                    if (index === 0) {
                        return this.getResolutions()[index];
                    }
                    else {
                        return this.getResolutions()[index];
                    }
                }
                else if (scaleType === "min") {
                    return this.getResolutions()[index - 1];
                }
            }
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

        getResolutions: function () {
            return this.get("resolutions");
        },

        /**
         *
         * @return {[type]} [description]
         */
        getZoom: function () {
            return this.get("view").getZoom();
        },

        pushHits: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        }
    });

    return MapView;
});
