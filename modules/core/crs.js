define(function (require) {

    var Proj4 = require("proj4"),
        ol = require("openlayers"),
        Config = require("config"),
        CRS;

    CRS = Backbone.Model.extend({
        defaults: {
            namedProjections: [
                ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
            ]
        },

        initialize: function () {
            var channel = Radio.channel("CRS");

            channel.reply({
                "getProjection": this.getProjection,
                "getProjections": this.getProjections,
                "transformToMapProjection": this.transformToMapProjection,
                "transformFromMapProjection": this.transformFromMapProjection,
                "transform": this.transform
            }, this);

            if (Config.namedProjections) {
                this.setNamedProjections(Config.namedProjections);
            }
            this.assumeProjections();
        },

        assumeProjections: function () {
            var namedProjections = this.get("namedProjections");

            Proj4.defs(namedProjections);
            ol.proj.setProj4(Proj4);

            _.each(namedProjections, function (namedProjection) {
                var projection = ol.proj.get(namedProjection[0]);

                ol.proj.addProjection(projection);
            });
        },

        getProjection: function (name) {
            return Proj4.defs(name);
        },

        getProjections: function () {
            var namedProjections = this.get("namedProjections"),
                projections = [];

            _.each(namedProjections, function (namedProjection) {
                var projection = Proj4.defs(namedProjection[0]);

                _.extend(projection, {
                    name: namedProjection[0]
                });
                projections.push(projection);
            });

            return projections;
        },

        transformToMapProjection: function (sourceProjection, point) {
            var mapProjection = Radio.request("MapView", "getProjection"),
                targetProjection;

            if (mapProjection && sourceProjection && point) {
                targetProjection = this.getProjection(mapProjection.getCode());
                return Proj4(sourceProjection, targetProjection, point);
            }
            return undefined;
        },

        transformFromMapProjection: function (targetProjection, point) {
            var mapProjection = Radio.request("MapView", "getProjection"),
                sourceProjection;

            if (mapProjection && targetProjection && point) {
                sourceProjection = this.getProjection(mapProjection.getCode());
                return Proj4(sourceProjection, targetProjection, point);
            }
            return undefined;
        },

        transform: function (par) {
            if (!this.getProjection(par.fromCRS) || !this.getProjection(par.toCRS) || !par.point) {
                Radio.trigger("Alert", "alert", {text: "Koordinatentransformation mit ungültigen Eingaben wird abgebrochen.", kategorie: "alert-danger"});
                return "";
            }

            return Proj4(Proj4(par.fromCRS), Proj4(par.toCRS), par.point);

        },

        // setter for namedProjections
        setNamedProjections: function (value) {
            this.set("namedProjections", value);
        }
    });

    return CRS;
});
