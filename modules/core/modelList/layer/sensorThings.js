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
                    allThings = [],
                    thingsCount = things["@iot.count"], // count of all things
                    thingsLength = things.value.length; // count of things on one request
                    thingsMerge = [];

                for (var j = 0; j < thingsCount; j += thingsLength) {
                    things = this.getResponse(j);
                    allThings.push(things.value);
                };

                allThings = _.flatten(allThings);
                allThings = this.mergeByCoordinates(allThings);
                allThings = this.removeDoublicates(allThings);

                _.each(allThings, function (things, index) {
                    thingsMerge.push(this.aggreateArrays(things));
                }, this);

                this.drawPoints(thingsMerge);
                Radio.trigger("Util", "hideLoader");
            }
        },

        /**
         * [updates by event from Websocket]
         * @param  {[type]} things [description]
         * @return {[type]}        [description]
         */
        updateFromWebSocket: function (things) {
            var keys = Object.keys(things),
                thisDataStreamId = keys[0],
                thisResult = things[thisDataStreamId].result,
                thisPhenomTime = things[thisDataStreamId].phenomenonTime,
                thisFeature,
                thisPlugIndex,
                datastreamStates,
                states,
                datastreamPhenomTime;

            thisFeatureArray = this.getFeatureById(thisDataStreamId, this.getLayerSource().getFeatures());
            thisPlugIndex = thisFeatureArray[0];
            thisFeature = thisFeatureArray[1];

            // change state and phenomTime
            datastreamStates = thisFeature.values_["state"];
            datastreamPhenomTime = thisFeature.values_["phenomenonTime"];

            if (_.contains(datastreamStates, "|")) {
                datastreamStates = datastreamStates.split(" | ");
                datastreamPhenomTime = datastreamPhenomTime.split(" | ");
            };

            datastreamStates[thisPlugIndex] = thisResult;
            datastreamPhenomTime[thisPlugIndex] = thisPhenomTime;

            states = this.buildPropertiesAsString(datastreamStates);
            phenomTime = this.buildPropertiesAsString(datastreamPhenomTime);

            // update states in feature
            thisFeature.values_.state = states;
            thisFeature.values_.phenomenonTime = phenomTime;

            this.setColor(thisFeature, thisResult);


            console.log(thisFeature);
            console.log(thisFeature.getGeometry().getCoordinates());
            console.log(thisResult);
        },

        /**
         * [drawPoints by given response]
         * @param  {[type]} things [description]
         * @return {[type]}        [description]
         */
        drawPoints: function (allThings) {
            var points = [];

            // Iterate over things
            _.each(allThings, function (thing) {
                var xyTransfrom = ol.proj.transform(thing.location, "EPSG:4326", Config.view.epsg),
                    state = thing.properties.state.split(" | ")[0],
                    point = new ol.Feature({
                        geometry: new ol.geom.Point(xyTransfrom)
                    });

                    point.setProperties(thing.properties);

            this.setColor(point, state);

                points.push(point);
            }, this);

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
        },

        removeDoublicates: function (mergeAllThings) {
            var mergeAllThingsCopy = mergeAllThings;

            for (var i = 0; i < mergeAllThings.length; i++) {
                for (var j = i + 1; j < mergeAllThings.length; j++) {
                    if (_.isEqual(mergeAllThings[i], mergeAllThings[j])) {
                        mergeAllThingsCopy.splice(j, 1);
                    };
                };
            };

            return mergeAllThingsCopy;
        },

        // merge things with equal coordinates
        mergeByCoordinates: function (allThings) {
            var mergeAllThings = [];

            for (var i = 0; i < allThings.length; i++) {
                var xyThing = allThings[i].Locations[0].location.geometry.coordinates,
                    equalThing = [];

                for (var j = 0; j < allThings.length; j++) {
                    var xyEqualThing = allThings[j].Locations[0].location.geometry.coordinates;

                    if (_.isEqual(xyThing, xyEqualThing)) {
                        equalThing.push(allThings[j]);
                    }
                };

                mergeAllThings.push(equalThing);
            };

            return mergeAllThings;
        },

        aggreateArrays: function (thingsArray) {
            var obj = {},
                properties = {},
                thingsProperties = [],
                keys = _.keys(thingsArray[0].properties);

            keys.push("state");
            keys.push("dataStreamId");
            keys.push("phenomenonTime");

            _.each(thingsArray, function (thing) {
                var thisProperties = thing.properties,
                    thingsObservationsLength = thing.Datastreams[0].Observations.length;

                // get newest observation, if existing
                if (thingsObservationsLength > 0) {
                    thisProperties.state = thing.Datastreams[0].Observations[0].result;
                    thisProperties.phenomenonTime = thing.Datastreams[0].Observations[0].phenomenonTime;
                }
                else {
                    thisProperties.state = "";
                    thisProperties.phenomenonTime = "";
                }
                thisProperties.dataStreamId = thing.Datastreams[0]["@iot.id"];
                thingsProperties.push(thisProperties);
            });

            _.each(keys, function (key) {
                var propList = _.pluck(thingsProperties, key),
                    propString = this.buildPropertiesAsString(propList);

                properties[key] = propString;
            }, this);

            // add to Object
            obj.location = thingsArray[0].Locations[0].location.geometry.coordinates;
            obj.properties = properties;

            return obj;
        },

        buildPropertiesAsString: function (properties) {
            propString = properties[0];
            _.each(properties, function (prop, index) {
                if (index > 0) {
                    propString = propString + " | " + prop;
                }
            });

            return propString;
        },

        getFeatureById: function (id, features) {
            var thisFeatureArray = [];

            _.each(features, function (feature) {
                var datastreamIds = feature.values_.dataStreamId;

                if (_.contains(datastreamIds, "|")) {
                    datastreamIds = datastreamIds.split(" | ");
                };

                _.each(datastreamIds, function (thisId, index) {
                    if (id === thisId) {
                        thisFeatureArray.push(index);
                        thisFeatureArray.push(feature);
                    }

                });
            });

            return thisFeatureArray;
        },

        setColor: function (point, state) {
            // set color
            if (state === "available") {
                point.setStyle(this.getAvailableStyle);
            }
            else if (state === "charging") {
                point.setStyle(this.getChargingStyle);
            }
            else {
                point.setStyle(this.getFaileStyle);
            };
        }

    });

    return SensorThingsLayer;
});
