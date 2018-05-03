define(function (require) {
    var proj = new ol.proj.Projection({
        code: "EPSG:25832",
        units: "m",
        axisOrientation: "enu",
        global: false
    }),
    Backbone = require("backbone"),
    Util;

    ol.proj.addProjection(proj);


    Util = Backbone.Model.extend({
        initialize: function () {},
        createTestFeatures: function() {
            var format = new ol.format.WFS({
                featureNS: "http://www.deegree.org/app"
            }),
            features;
            $.ajax({
                url: "resources/testFeatures.xml",
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
        getGeoJsonTestFeatures: function() {
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
        }
    });

    return Util;
});
