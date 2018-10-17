import proj4 from "proj4";
import * as Proj from "ol/proj.js";
import {register} from "ol/proj/proj4.js";

const CRS = Backbone.Model.extend({
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

        proj4.defs(namedProjections);
        register(proj4);

        _.each(namedProjections, function (namedProjection) {
            var projection = Proj.get(namedProjection[0]);

            Proj.addProjection(projection);
        }, this);
    },

    getProjection: function (name) {
        return proj4.defs(name);
    },

    getProjections: function () {
        var namedProjections = this.get("namedProjections"),
            projections = [];

        _.each(namedProjections, function (namedProjection) {
            var projection = proj4.defs(namedProjection[0]);

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
            return proj4(sourceProjection, targetProjection, point);
        }
        return undefined;
    },

    transformFromMapProjection: function (targetProjection, point) {
        var mapProjection = Radio.request("MapView", "getProjection"),
            sourceProjection;

        if (mapProjection && targetProjection && point) {
            sourceProjection = this.getProjection(mapProjection.getCode());
            return proj4(sourceProjection, targetProjection, point);
        }
        return undefined;
    },

    transform: function (par) {
        if (!this.getProjection(par.fromCRS) || !this.getProjection(par.toCRS) || !par.point) {
            Radio.trigger("Alert", "alert", {text: "Koordinatentransformation mit ungültigen Eingaben wird abgebrochen.", kategorie: "alert-danger"});
            return "";
        }

        return proj4(proj4(par.fromCRS), proj4(par.toCRS), par.point);

    },

    // setter for namedProjections
    setNamedProjections: function (value) {
        this.set("namedProjections", value);
    }
});

export default CRS;
