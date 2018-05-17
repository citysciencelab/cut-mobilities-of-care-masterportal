define([
    "backbone",
    "backbone.radio",
    "proj4",
    "openlayers",
    "config"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Proj4 = require("proj4"),
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
            Proj4.defs(Config.namedProjections);
            ol.proj.setProj4(Proj4);
            for(var i = 0; i < Config.namedProjections.length; i++){
                var projection =ol.proj.get(Config.namedProjections[i][0]);
                ol.proj.addProjection(projection);
            }
            var channel = Radio.channel("CRS");

            channel.reply({
                "getProjection": function (name) {
                    return this.getProjection(name);
                },
                "getProjections": this.getProjections,
                 "transformToMapProjection": this.transformToMapProjection,
                 "transformFromMapProjection": this.transformFromMapProjection,
                "transform": function (par) {
                    return this.transform(par);
                }
            }, this);

            if (Config.namedProjections) {
                this.setNamedProjections(Config.namedProjections);
            }
            this.assumeProjections();
        },

        assumeProjections: function () {
            var namedProjections = this.getNamedProjections();

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
            var namedProjections = this.getNamedProjections(),
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
        },

        transformFromMapProjection: function (targetProjection, point) {
            var mapProjection = Radio.request("MapView", "getProjection"),
                sourceProjection;

            if (mapProjection && targetProjection && point) {
                sourceProjection = this.getProjection(mapProjection.getCode());
                return Proj4(sourceProjection, targetProjection, point);
            }
        },
        transform: function (par) {
            if (!this.getProjection(par.fromCRS) || !this.getProjection(par.toCRS) || !par.point) {
                Radio.trigger("Alert", "alert", {text: "Koordinatentransformation mit ungültigen Eingaben wird abgebrochen.", kategorie: "alert-danger"});
                return "";
            }
            else {
                return Proj4(Proj4(par.fromCRS), Proj4(par.toCRS), par.point);
            }
        },

        // getter for namedProjections
        getNamedProjections: function () {
            return this.get("namedProjections");
        },
        // setter for namedProjections
        setNamedProjections: function (value) {
            this.set("namedProjections", value);
        }
    });

    return CRS;
});
