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
            background: "",
            backgroundImage: "",
            startExtent: [510000.0, 5850000.0, 625000.4, 6000000.0],
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
            this.setOptions();
            this.setScales();
            this.setResolutions();
            this.setZoomLevels();

            this.setExtent();
            this.setResolution();
            this.setProjection();
            this.setStartCenter();
            this.setView();

            // Listener für ol.View
            this.get("view").on("change:resolution", function () {
                this.set("resolution", this.get("view").constrainResolution(this.get("view").getResolution()));
                channel.trigger("changedZoomLevel", this.getZoom());
            }, this);
            this.get("view").on("change:center", function () {
                this.set("center", this.get("view").getCenter());
            }, this);
        },
        resetView: function () {
            this.get("view").setCenter(this.get("startCenter"));
            this.get("view").setZoom(2);
            Radio.trigger("MapMarker","hideMarker");
        },

        /*
        * Finalisierung der Initialisierung für config.json
        */
        setConfig: function () {
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
                }
            }, this);
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

        setOptions: function () {
            if (_.has(Config.view, "options")) {
                this.set("options", []);
                _.each(Config.view.options, function (opt) {
                    this.pushHits("options", opt);
                }, this);
            }
        },

        setScales: function () {
            this.set("scales", _.pluck(this.get("options"), "scale"));
        },

        getScales: function () {
            return this.get("scales");
        },

        setResolutions: function () {
            if (Config.view.resolutions && _.isArray(Config.view.resolutions)) {
                this.set("resolutions", Config.view.resolutions);
            }
            else {
                this.set("resolutions", _.pluck(this.get("options"), "resolution"));
            }
        },

        setZoomLevels: function () {
            this.set("zoomLevels", _.pluck(this.get("options"), "zoomLevel"));
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
                var resolution = this.get("resolutions")[Config.view.zoomLevel];
                if(!resolution) {
                    resolution = this.get("resolutions")[Math.round(Config.view.zoomLevel)];
                }
                if(resolution) {
                    this.set("resolution", resolution);
                }
            }
        },

        // Setzt den Maßstab.
        setScale: function (scale) {
            this.set("scale", scale);
        },

        /**
         *
         */
        setStartCenter: function () {
            var center = Radio.request("ParametricURL", "getCenter");

            if (center) {
                var fromCRSName = center.crs,
                    position = [center.x, center.y],
                    toCRSName = this.get("projection").getCode();

                if (fromCRSName !== "" && fromCRSName !== toCRSName) {
                    // transform
                    var fromCRS = Radio.request("CRS", "getProjection", fromCRSName);

                    if (!fromCRS) {
                        Radio.trigger("Alert", "alert", {text: "<strong>" + fromCRSName + " des <i>CENTER</i>-Parameters unbekannt.</strong> Default wird verwendet.", kategorie: "alert-info"});
                    }
                    else {
                        position = Radio.request("CRS", "transform", {fromCRS: fromCRSName, toCRS: toCRSName, point: position});
                    }
                }
                this.set("startCenter", position);
            }
        },

        /**
         *
         */
        setProjection: function () {
            // check for crs
            var epsgCode = Config.view.epsg ? Config.view.epsg : "EPSG:25832",
                proj = Radio.request("CRS", "getProjection", epsgCode);

            if (!proj) {
                Radio.trigger("Alert", "alert", "Unknown CRS " + epsgCode + ". Can't set projection.");
                return;
            }

            var proj = new ol.proj.Projection({
                code: epsgCode,
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
            if(!_.isUndefined(coords)){
                if(coords.length > 2) {
                    coords = coords.slice(0,2);
                }
                this.get("view").setCenter(coords);
            }
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
                        return this.getResolutions()[index - 1];
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
