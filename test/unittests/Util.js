define(function (require) {
    var ol = require("openlayers"),
        $ = require("jquery"),
        proj = new ol.proj.Projection({
            code: "EPSG:25832",
            units: "m",
            axisOrientation: "enu",
            global: false
        }),
        Backbone = require("backbone"),
        Util;

    ol.proj.addProjection(proj);


    Util = Backbone.Model.extend({
        defaults: {},
        initialize: function () {},
        createTestFeatures: function (path) {
            var format = new ol.format.WFS({
                    featureNS: "http://www.deegree.org/app"
                }),
                features;

            $.ajax({
                url: path,
                async: false,
                success: function (data) {
                    features = format.readFeatures(data);
                },
                error: function (jqXHR, errorText, error) {
                    // Radio.trigger("Util", "hideLoader");
                }
            });
            return features;
        },
        getGeoJsonTestFeatures: function () {
            var geojson;

            $.ajax({
                url: "resources/testFeatures.json",
                async: false,
                success: function (data) {
                    geojson = data;
                },
                error: function (jqXHR, errorText, error) {
                    // Radio.trigger("Util", "hideLoader");
                }
            });
            return geojson;
        },
        getCswResponse: function () {
            var xml;

            $.ajax({
                url: "resources/testCswResponse.xml",
                async: false,
                success: function (data) {
                    xml = data;
                }
            });
            return xml;
        }
    });

    return Util;
});
