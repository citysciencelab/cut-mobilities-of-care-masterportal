define([
    "backbone",
    "backbone.radio",
    "proj4",
    "config"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Proj4 = require("proj4"),
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
            var channel = Radio.channel("CRS");

            channel.reply({
                "getProjection": function (name) {
                    return this.getProjection(name);
                },
                "transform": function (par) {
                    return this.transform(par);
                }
            }, this);
        },

        getProjection: function (name) {
            return Proj4.defs(name);
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
