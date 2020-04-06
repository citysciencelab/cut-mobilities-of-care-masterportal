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
        const format = new WFS({
                featureNS: "http://www.deegree.org/app"
            }),
            data = fs.readFileSync(this.get("basepath") + path, "utf8"),
            features = format.readFeatures(data);

        return features;
    },
    getGeoJsonTestFeatures: function () {
        const geojson = JSON.parse(fs.readFileSync(this.get("basepath") + "resources/testFeatures.json", "utf8"));

        return geojson;
    },
    getCswResponse: function () {
        const xml = fs.readFileSync(this.get("basepath") + "resources/testCswResponse.xml", "utf8");

        return xml;
    },
    getDescribeFeatureTypeResponse: function () {
        const xml = fs.readFileSync(this.get("basepath") + "resources/testDescribeFeatureTypeResponse.xml", "utf8"),
            xmlObject = new window.DOMParser().parseFromString(xml, "text/xml");

        return xmlObject;
    }
});

export default Util;
