import {addProjection} from "ol/proj.js";
import Projection from "ol/proj/Projection.js";
import {WFS} from "ol/format.js";

const fs = require("fs"),

    proj = new Projection({
        code: "EPSG:25832",
        units: "m",
        axisOrientation: "enu",
        global: false
    }),
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
        },
        getFile: function (path) {
            const xml = fs.readFileSync(this.get("basepath") + path, "utf8");

            return xml;
        },
        parseXML: function (xmlStr) {
            return new window.DOMParser().parseFromString(xmlStr, "text/xml");
        }
    });

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
            console.log(features);
        return features;
    },



    createTestFeatures2: function (path) {
        const format = new WFS({
                featureNS: "http://www.deegree.org/app"
            }),
            data = fs.readFileSync(this.get("basepath") + path, "utf8"),
            features = format.readFeatures(data);

        return features;
    },
    getPolygonMembers: function (features) {
        // console.log(features);
        let typeName = "app:hh_hh_festgestellt";
        elements = features.getElementsByTagNameNS("*", typeName.split(":")[1]);

        console.log("Me gusta patatas");
        console.log(elements);
        console.log("Hello");

        const polygonMembers = features.getElementsByTagNameNS("*", "polygonMember");

        // console.log(polygonMembers);

        return polygonMembers;
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
    },
    getDescribeFeatureTypeResponse2: function () {
        const xml = fs.readFileSync(this.get("basepath") + "resources/testFeaturesBplanMultiPolygonWithInteriorPolygon.xml", "utf8"),
            // xmlObject = new window.DOMParser().parseFromString(xml, "application/html");
            xmlObject = new window.DOMParser().parseFromString(xml, "text/html");

        return xmlObject;
    }
});

export default Util;
