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

            // start socket connection
            this.createWebSocket();

        },

        createWebSocket: function () {
            // WebSocket to MQTT-Broker
            var connection = new WebSocket("ws://127.0.0.1:8767");

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
                jsonData = JSON.parse(ev.data);
                Radio.trigger("sensorThings", "updateFromWebSocket", jsonData);
            };

            // The connection is terminated
            connection.onclose = function () {
                console.log("Websocket ist beendet");
            };
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
            if (!_.isUndefined(this.get("url"))) {
                var things = this.getResponse(0),
                    allThings = [];
                    thingsCount = things["@iot.count"], // count of all things
                    thingsLength = things.value.length; // count of things on one request

                for ( var j = 0; j < thingsCount; j += thingsLength) {
                    things = this.getResponse(j);
                    allThings.push(things.value);
                };

                allThings = _.flatten(allThings);
                this.drawPoints(allThings, this);
                Radio.trigger("Util", "hideLoader");
            }
        },

        /**
         * [updates by event from Websocket]
         * @param  {[type]} things [description]
         * @return {[type]}        [description]
         */
        updateFromWebSocket: function (things) {
            // console.log(things);
            console.log("updateFromWebSocket");
            // this.drawPoints(things);
            // Radio.trigger("Util", "hideLoader");
        },

        /**
         * [drawPoints by given response]
         * @param  {[type]} things [description]
         * @return {[type]}        [description]
         */
        drawPoints: function (allThings) {
            var points = [];

            // Iterate over things
            for (var i = 0; i < allThings.length; i++) {
                var xy = allThings[i].Locations[0].location.geometry.coordinates,
                    obsLen = allThings[i].Datastreams[0].Observations.length, // newest observation
                    prop = allThings[i].properties,
                    xyTransfrom = ol.proj.transform(xy, "EPSG:4326", Config.view.epsg),
                    point = new ol.Feature({
                        geometry: new ol.geom.Point(xyTransfrom)
                    });

                    point.setProperties(prop);

                    // Hinzufügen der Anzahl der Ladestationen
                    // point.setProperties({"count_station" : });

                    if (obsLen > 0) {
                        var res = allThings[i].Datastreams[0].Observations[obsLen - 1].result; // charging or available
                        point.setProperties({status: res});

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
                    };
                points.push(point);
            };

            // Add features to vectorlayer
            this.getLayerSource().addFeatures(points);
        },

        getChargingStyle: function () {
            var featureStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: "rgba(255, 0, 0, 1.0)"
                    })
                })
            });

            return featureStyle;
        },

        getAvailableStyle: function () {
            console.log("farbe");
            var featureStyle = new ol.style.Style({
                image: new ol.style.Circle({
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
                image: new ol.style.Circle({
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
        getResponse: function (skipCount) {
            var response,
                skipCountString;

            if (!_.isString(skipCount)) {
                skipCountString = String(skipCount);
            }
            else {
                skipCountString = skipCount;
            }

            Radio.trigger("Util", "showLoader");
            $.ajax({
                url: (this.get("url") + "&$skip=" + skipCount),
                async: false,
                type: "GET",
                context: this,

                // Behandlung des Response
                success: function (resp) {
                    response = resp;
                },
                error: function (jqXHR, errorText, error) {
                    console.log("Es konnte keine Verbindung zur URL hergetsellt werden");
                    Radio.trigger("Util", "hideLoader");
                }
            });

            return response;
        }
    });

    return SensorThingsLayer;
});
