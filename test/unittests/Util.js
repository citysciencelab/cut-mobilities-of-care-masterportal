import {addProjection} from "ol/proj.js";
import Projection from "ol/proj/Projection.js";
import {WFS} from "ol/format.js";

const fs = require("fs");

var proj = new Projection({
        code: "EPSG:25832",
        units: "m",
        axisOrientation: "enu",
        global: false
    }),
    Util;


addProjection(proj);


Util = Backbone.Model.extend({
    defaults: {
        basepath: "./test/unittests/"
    },
    initialize: function () {
        return null;
    },
    createTestFeatures: function (path) {
        var format = new WFS({
                featureNS: "http://www.deegree.org/app"
            }),
            data = fs.readFileSync(this.get("basepath") + path, "utf8"),
            features = format.readFeatures(data);

        return features;
    },
    getGeoJsonTestFeatures: function () {
        var geojson = JSON.parse(fs.readFileSync(this.get("basepath") + "resources/testFeatures.json", "utf8"));

        return geojson;
    },
    getCswResponse: function () {
        var xml = fs.readFileSync(this.get("basepath") + "resources/testCswResponse.xml", "utf8");

        return xml;
    }
});

export default Util;
