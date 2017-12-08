define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Config = require("config"),
        SensorThingsLayer;

    SensorThingsLayer = Layer.extend({

        initialize: function () {
            this.superInitialize();
            var channel = Radio.channel("sensorThings");

            channel.on({
                "updateFromWebSocket": this.updateFromWebSocket
            }, this);

            var connection = new WebSocket("ws://127.0.0.1:1234");

            // The connection ist open
            connection.onopen = function () {
                console.log("Websocket is open");
            };

            // Log errors
            connection.onerror = function (error) {
                console.log("Websocket Error: " + error);
            };

            // Log messages from the server
            connection.onmessage = function (ev) {
                console.log("Server: " + ev.data);
                Radio.trigger("sensorThings", "updateData", JSON.parse(ev.data));
            };

            // The connection is terminated
            connection.onclose = function () {
                console.log("Websocket ist beendet");
            }

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

        /**
         * [initial request to sensorthings-api]
         * @return {[type]} [description]
         */
        updateData: function () {
            var things = this.getResponse();
            this.drawPoints(things);
            Radio.trigger("Util", "hideLoader");
        },

        /**
         * [updates by event from Websocket]
         * @param  {[type]} things [description]
         * @return {[type]}        [description]
         */
        updateFromWebSocket: function (things) {
            console.log(things);
            this.drawPoints(things);
            Radio.trigger("Util", "hideLoader");
        },

        /**
         * [drawPoints by given response]
         * @param  {[type]} things [description]
         * @return {[type]}        [description]
         */
        drawPoints: function (things) {
            var points = [];
            // Iterate over things
            for (var i = 0; i < things.value.length; i++) {
                var xy = things.value[i].Locations[0].location.geometry.coordinates,
                    obsLen = things.value[i].Datastreams[0].Observations.length, // newest observation
                    res = things.value[i].Datastreams[0].Observations[obsLen - 1].result, //charging or available
                    prop = things.value[i].properties,
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
                        point.setStyle(this.getFaileStyle);
                        // console.log("False Type" + res);
                    };
                points.push(point);
            };

            // Add features to vectorlayer
            this.getLayerSource().addFeatures(points);
        },

        getChargingStyle: function () {
            var featureStyle = new ol.style.Style({
                image:  new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: "rgba(255, 0, 0, 1.0)"
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
                    })
                })
            });

            return featureStyle;
        },

        getFaileStyle: function () {
            var featureStyle = new ol.style.Style({
                image:  new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: "rgba(0, 0, 255, 1.0)"
                    })
                })
            });

            return featureStyle;
        },

        /**
         * [call to sensorthings by initial]
         * @return {[type]} [description]
         */
        getResponse: function () {
            var response;
            Radio.trigger("Util", "showLoader");
            $.ajax({
                url: this.get("url"),
                contentType: "application/json; charset=utf-8",
                async: false,
                type: "GET",
                context: this,

                // Behandlung des Response
                success: function (resp) {
                    response = resp;
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Util", "hideLoader");
                }
            });

            return response;
        },

        setAttributes: function () {

        }
    });

    return SensorThingsLayer;
});
