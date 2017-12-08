define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Config = require("config"),
        SensorThingsLayer;

    SensorThingsLayer = Layer.extend({

        initialize: function () {
            this.superInitialize();
        },

        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
        },

        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
                id: this.getId()
            }));

            this.updateData();
        },

        // createLegendURL: function () {
        // },

        // setAttributes: function () {
        // },

        updateData: function () {
            Radio.trigger("Util", "showLoader");
            $.ajax({
                url: this.get("url"),
                // data: params,
                contentType: "application/json; charset=utf-8",
                async: true,
                type: "GET",
                context: this,

                // Behandlung des Response
                success: function (response) {
                    var points = [];

                    for (var i = 0; i < response.value.length; i++) {

                        // **********************************************************
                        // Für Abfragen nach Locations
                        // var xy = response.value[i].location.coordinates,
                        // *********************************************************

                        // Request with filter
                        var xy = response.value[i].Locations[0].location.geometry.coordinates,
                            res = response.value[i].Datastreams[0].Observations[0].result, //charging or available
                            prop = response.value[0].properties,
                            xyTransfrom = ol.proj.transform(xy, "EPSG:4326", Config.view.epsg),
                            point = new ol.Feature({
                                geometry: new ol.geom.Point(xyTransfrom)
                            });

                            // set color
                            if (res === "available") {
                                point.setStyle(this.getAvailableStyle);
                            }
                            else if (res === "charging") {
                                point.setStyle(this.getChargingStyle);
                            }
                            else {
                                console.log("False Type" + res);
                            };

                        points.push(point);
                    };

                    console.log(points);
                    // Features zum Vektorlayer hinzufuegen
                    this.getLayerSource().addFeatures(points);

                    Radio.trigger("Util", "hideLoader");
                    try {
                        // this.set("loadend", "ready");
                        Radio.trigger("SensorThingsLayer", "featuresLoaded", this.getId(), points);


                        // this.getLayer().setStyle(this.get("style"));
                        // this.getLayer().setStyle(this.getChargingStyle);
                        // this.getLayer().setStyle(this.getAvailableStyle);
                    }
                    catch (err) {
                        console.log(err.message);
                    }
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Util", "hideLoader");
                }
            });
        },

        getChargingStyle: function () {
            var featureStyle = new ol.style.Style({
                image:  new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: "rgba(255, 0, 0, 1.0)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(255, 0, 0, 0.6)",
                        width: 3
                    })
                })
            });

            return featureStyle;
        },

        getAvailableStyle: function () {
            var featureStyle = new ol.style.Style({
                image:  new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: "rgba(0, 255, 0, 1.0)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(0, 255, 0, 0.6)",
                        width: 3
                    })
                })
            });

            return featureStyle;
        },
    });

    return SensorThingsLayer;
});
