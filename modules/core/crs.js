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
        /**
         *
         */
        defaults: {
            namedProjections: [
                ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
            ]
        },

        initialize: function () {
            if (Config.namedProjections) {
                Proj4.defs(Config.namedProjections);
            }
            else {
                Proj4.defs(this.get("namedProjections"));
            }
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
                 "transformToMapProjection": this.transformToMapProjection,
                 "transformFromMapProjection": this.transformFromMapProjection,
                "transform": function (par) {
                    return this.transform(par);
                }
            }, this);
        },

        getProjection: function (name) {
            return Proj4.defs(name);
        },
        transformToMapProjection: function(sourceProjection, point) {
            var mapProjection = Radio.request("MapView", "getProjection"),
                targetProjection;
            if(mapProjection && sourceProjection && point) {
                targetProjection = this.getProjection(mapProjection.getCode());
                return Proj4(sourceProjection, targetProjection, point);
            }
        },
        transformFromMapProjection: function (targetProjection, point) {
            var mapProjection = Radio.request("MapView", "getProjection"),
                sourceProjection;
            if(mapProjection && targetProjection && point) {
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
        }
    });

    return CRS;
});
