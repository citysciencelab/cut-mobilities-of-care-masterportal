define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Config = require("config"),
        mqtt = require("mqtt"),
        moment = require("moment"),
        SensorThingsLayer;

    SensorThingsLayer = Layer.extend({

        defaults: _.extend({}, Layer.prototype.defaults,
            {
                webSocketPortSTS: 9876,
                epsg: "EPSG:4326"
            }
        ),
        initialize: function () {
            this.superInitialize();
            var channel = Radio.channel("SensorThingsLayer"),
                subtyp = this.get("subTyp").toUpperCase();

            channel.on({
                "updateFromWebSocket": this.updateFromWebSocket,
                "updateFromWebSocketStreamLayer": this.updateFromWebSocketStreamLayer
            }, this);

            // start connection to liveUpdate
            if (subtyp === "SENSORTHINGS") {
                this.createMqttConnection();
                // this.createWebSocketConnection();
            }
            else if (subtyp === "STREAMLAYER") {
            this.createWebSocketConnectionToStreamLayer();
            }
        },

        /**
         * creates ol.source.Vector as LayerSource
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
        },

        /**
         * creates the layer and trigger to updateData
         * @return {[type]} [description]
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: this.getLayerSource(),
                source: this.has("clusterDistance") ? this.getClusterLayerSource() : this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                gfiTheme: this.get("gfiTheme"),
                id: this.getId()
            }));

            this.updateData();
        },

        /**
         * create ClusterLayerSource
         */
        createClusterLayerSource: function () {
            this.setClusterLayerSource(new ol.source.Cluster({
                source: this.getLayerSource(),
                distance: this.get("clusterDistance")
            }));
        },

        /**
         * initial loading of sensor data function
         * differences by subtypes
         */
        updateData: function () {
            if (this.get("subTyp") === "StreamLayer") {
                return;
            }

            var sensorData,
                // todo: bei ESRI StreamLayer kann der epsg-code ausgelesen werden
                epsg = this.get("epsg"),
                features,
                subtyp = this.get("subTyp").toUpperCase(),
                isClustered = this.has("clusterDistance") ? true : false;

            if (this.checkRequiredParameter()) {
                // check for subtypes
                if (subtyp === "SENSORTHINGS") {
                    sensorData = this.loadSensorThings();
                    features = this.drawPoints(sensorData, epsg);
                }
                else if (subtyp === "STREAMLAYER") {
                    features = this.drawESRIGeoJson();
                }
            }

            this.set("loadend", "ready");
            Radio.trigger("SensorThingsLayer", "featuresLoaded", this.getId(), features);
            this.styling(isClustered);
            this.getLayer().setStyle(this.getStyle());
        },

        drawESRIGeoJson: function () {

        },

        /**
         * check required parameter from services-internet.json
         * @return {boolean} true if all required parameters set
         */
        checkRequiredParameter: function () {
            var boolean = true;

            if (_.isUndefined(this.get("id"))) {
                boolean = false;
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Der Parameter: id fehlt in der Konfiguration!</strong>",
                    kategorie: "alert-danger"
                });
            }
            if (_.isUndefined(this.get("name"))) {
                boolean = false;
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Der Parameter: name fehlt in der Konfiguration!</strong>",
                    kategorie: "alert-danger"
                });
            }
            if (_.isUndefined(this.get("url"))) {
                boolean = false;
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Der Parameter: url fehlt in der Konfiguration!</strong>",
                    kategorie: "alert-danger"
                });
            }
            if (_.isUndefined(this.get("subTyp"))) {
                boolean = false;
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Der Parameter: subTyp fehlt in der Konfiguration!</strong>",
                    kategorie: "alert-danger"
                });
            }
            // if (_.isUndefined(this.get("version"))) {
            //     boolean = false;
            //     Radio.trigger("Alert", "alert", {
            //         text: "<strong>Der Parameter: version fehlt in der Konfiguration!</strong>",
            //         kategorie: "alert-danger"
            //     });
            // }
            return boolean;
        },

         /**
         * get response from a given URL
         * @param  {String} requestURL - to request sensordata
         * @return {objects} response with sensorObjects
         */
        getResponseFromRequestURL: function (requestURL) {
            var response;

            Radio.trigger("Util", "showLoader");
            $.ajax({
                url: requestURL,
                async: false,
                type: "GET",
                context: this,

                // handling response
                success: function (resp) {
                    Radio.trigger("Util", "hideLoader");
                    response = resp;
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Util", "hideLoader");
                }
            });

            return response;
        },

        /**
         * draw points on the map
         * @param  {array} sensorData - sensor with location and properties
         * @param  {Sting} epsg - from Sensortype
         */
        drawPoints: function (sensorData, epsg) {
            var features = [];

            _.each(sensorData, function (thisSensorData) {
                var xyTransfrom = ol.proj.transform(thisSensorData.location, epsg, Config.view.epsg),
                    feature = new ol.Feature({
                        geometry: new ol.geom.Point(xyTransfrom)
                    });

                feature.setProperties(thisSensorData.properties);
                features.push(feature);
            }, this);

            // only features with geometry
            features = _.filter(features, function (feature) {
                return !_.isUndefined(feature.getGeometry());
            });

            // Add features to vectorlayer
            this.getLayerSource().addFeatures(features);

            return features;
        },

        /**
         * create style, function triggers to style_v2.json
         * @param  {boolean} isClustered
         */
        styling: function (isClustered) {
            var stylelistmodel = Radio.request("StyleList", "returnModelById", this.getStyleId());

            if (!_.isUndefined(stylelistmodel)) {
                this.setStyle(function (feature) {
                    return stylelistmodel.createStyle(feature, isClustered);
                });
            }
        },

        /**
         * getter for StyleId
         * @return {number} styleId
         */
        getStyleId: function () {
            return this.get("styleId");
        },

        /**
         * change time zone by given UTC-time
         * @param  {String} phenomenonTime
         * @return {String} phenomenonTime converted with UTC
         */
        changeTimeZone: function (phenomenonTime) {
            var time = phenomenonTime;

            if (!_.isUndefined(this.get("utc"))) {
                var utc = this.get("utc"),
                    utcAlgebraicSign = utc.substring(0, 1),
                    utcNumber;

                if (utc.length === 2) {
                    utcNumber = "0" + utc.substring(1, 2) + "00";
                }
                else if (utc.length > 2) {
                    utcNumber = utc.substring(1, 3) + "00";
                }

                time = moment(phenomenonTime).utcOffset(utcAlgebraicSign + utcNumber).format("DD MMMM YYYY, HH:mm:ss");
            }
            return time;
        },

// *************************************************************
// ***** SensorThings                                      *****
// *************************************************************
        /**
         * load SensorThings by
         * @return {array} all things with attributes and location
         */
        loadSensorThings: function () {
            var allThings = [],
                thingsMerge = [],
                requestURL = this.buildSensorThingsURL(),
                things = this.getResponseFromRequestURL(requestURL);

                var thingsCount = things["@iot.count"], // count of all things
                thingsbyOneRequest = things.value.length; // count of things on one request

            allThings.push(things.value);
            for (var i = thingsbyOneRequest; i < thingsCount; i += thingsbyOneRequest) {
                var thisRequestURL = requestURL + "&$skip=" + i;

                things = this.getResponseFromRequestURL(thisRequestURL);
                allThings.push(things.value);
            };

            allThings = _.flatten(allThings);
            allThings = this.mergeByCoordinates(allThings);

            _.each(allThings, function (things, index) {
                thingsMerge.push(this.aggreateArrays(things));
            }, this);

            return thingsMerge;
        },

        /**
         * build SensorThings URL
         * @return {String} URL to request sensorThings
         */
        buildSensorThingsURL: function () {
            var requestURL = this.get("url") + "/v" + this.get("version") + "/Things?",
                and = "$";

            if (!_.isUndefined(this.get("urlParameter"))) {
                _.each(this.get("urlParameter"), function (value, key) {
                    requestURL = requestURL + and + key + "=" + value;
                    and = "&$";
                });
            }
            return requestURL;
        },

        /**
         * merge things with equal coordinates
         * @param  {array} allThings - contains all loaded Things
         * @return {array} merged things
         */
        mergeByCoordinates: function (allThings) {
            var mergeAllThings = [],
                indices = [];

            _.each(allThings, function (thing, index) {
                // if the thing was assigned already
                if (!_.contains(indices, index)) {
                    var things = [],
                        xy = this.getCoordinates(thing);

                _.each(allThings, function (thing2, index2) {
                    var xy2 = this.getCoordinates(thing2);

                    if (_.isEqual(xy, xy2)) {
                        things.push(thing2);
                        indices.push(index2);
                    }
                }, this);

                mergeAllThings.push(things);
                }
            }, this);

            return mergeAllThings;
        },

        /**
         * retrieves coordinates by different geometry types
         * @param  {object} thing
         * @return {array} coordinates
         */
        getCoordinates: function (thing) {
            var xy;

            if (thing.Locations[0].location.type === "Feature") {
                xy = thing.Locations[0].location.geometry.coordinates;
            }
            else if (thing.Locations[0].location.type === "Point") {
                xy = thing.Locations[0].location.coordinates;
            }

            return xy;
        },

        /**
         * aggregate a given array into an object with location and properties
         * @param  {array} thingsArray - contain things with the same location
         * @return {object} contains location and properties
         */
        aggreateArrays: function (thingsArray) {
            var obj = {},
                properties = {},
                thingsProperties = [],
                keys = _.keys(thingsArray[0].properties);

            keys.push("state");
            keys.push("phenomenonTime");
            keys.push("dataStreamId");

            // add more properties
            _.each(thingsArray, function (thing) {
                var thingsObservationsLength = thing.Datastreams[0].Observations.length;

                if (!_.has(thing, "properties")) {
                    thing.properties = {};
                }
                // get newest observation if existing
                if (thingsObservationsLength > 0) {
                    thing.properties.state = String(thing.Datastreams[0].Observations[0].result);
                    thing.properties.phenomenonTime = this.changeTimeZone(thing.Datastreams[0].Observations[0].phenomenonTime);
                }
                else {
                    thing.properties.state = "undefined";
                    thing.properties.phenomenonTime = "undefined";
                }

                thing.properties.state = this.convertScaling(thing.properties.state);

                thing.properties.dataStreamId = thing.Datastreams[0]["@iot.id"];
                thingsProperties.push(thing.properties);
            }, this);

            // combine properties
            _.each(keys, function (key) {
                var propList = _.pluck(thingsProperties, key),
                    propString = propList.join(" | ");

                properties[key] = propString;
            }, this);

            // add to Object
            obj.location = this.getCoordinates(thingsArray[0]);
            obj.properties = properties;

            return obj;
        },

        /**
         * convert Scaling with given factor and adds a unit
         * @param  {ol.Feature} feature
         * @return {String} state with converted value
         */
        convertScaling: function (state) {
            var conversionFactor = this.get("conversionFactor"),
                scalingUnit = this.get("scalingUnit"),
                scalingDecimal = this.get("scalingDecimal");

            if (!_.isUndefined(conversionFactor)) {
                state = state * conversionFactor;
            }
            if (!_.isUndefined(scalingDecimal)) {
                state = parseFloat(state);
                state = state.toFixed(scalingDecimal);
            }
            if (!_.isUndefined(scalingUnit)) {
                state = state + " " + scalingUnit;
            }

            return state;
        },

// *************************************************************
// ***** live update via MQTT or websocket                 *****
// *************************************************************
    /**
     * create connection to a given MQTT-Broker
     * this must be passes this as a context to call the updateFromMqtt function
     */
        createMqttConnection: function () {
            //****************************************
            if (this.get("url").split("/")[2] == "geodienste.hamburg.de") {
                return;
            }
            //****************************************

            var dataStreamIds = this.getDataStreamIds(),
                client = mqtt.connect({
                    host: this.get("url").split("/")[2],
                    port: this.get("webSocketPortSTS"),
                    path: "/mqtt",
                    context: this
                });

            client.on("connect", function () {
                _.each(dataStreamIds, function (id) {
                     client.subscribe("v1.0/Datastreams(" + id + ")/Observations");
                });
            });

            // messages from the server
            client.on("message", function (topic, payload) {
                var jsonData = JSON.parse(payload);

                jsonData.dataStreamId = topic.split("(")[1].split(")")[0];
                this.options.context.updateFromMqtt(jsonData);
            });
        },

        /**
         * update the phenomenontime and states of the Feature
         * this function is triggerd from MQTT
         * @param  {json} thing
         */
        updateFromMqtt: function (thing) {
            var dataStreamId = thing.dataStreamId,
                features = this.getLayerSource().getFeatures(),
                featureArray = this.getFeatureByDataStreamId(dataStreamId, features),
                thingResult = String(this.convertScaling(thing.result)),
                thingPhenomenonTime = this.changeTimeZone(thing.phenomenonTime);

            this.liveUpdate(featureArray, thingResult, thingPhenomenonTime);
        },

        /**
         * create a connection to a websocketserver,
         * which fire new observation using MQTT
         */
        createWebSocketConnection: function () {
            var connection = new WebSocket("ws://127.0.0.1:8767");

            // errors
            connection.onerror = function (error) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Ein Fehler bei der WebSocket Verbindung ist aufgetreten!</strong>",
                    kategorie: "alert-danger"
                });
            };

            // messages from the server
            connection.onmessage = function (ev) {
                var jsonData = JSON.parse(ev.data);
                console.log(jsonData);
                Radio.trigger("SensorThingsLayer", "updateFromWebSocket", jsonData);
            };
        },

        /**
         * update the phenomenontime and states of the Feature
         * this function is triggerd from Websocket
         * @param  {json} thing
         */
        updateFromWebSocket: function (thing) {
            var dataStreamId = Object.keys(thing)[0],
                features = this.getLayerSource().getFeatures(),
                featureArray = this.getFeatureByDataStreamId(dataStreamId, features);

            // Change properties only in Layer witch contain the Datastream
            if (!_.isEmpty(featureArray)) {
                var thingResult = String(this.convertScaling(thing[dataStreamId].result)),
                    thingPhenomenonTime = this.changeTimeZone(thing[dataStreamId].phenomenonTime);

                this.liveUpdate(featureArray, thingResult, thingPhenomenonTime);
            }
        },

        /**
         * performs the live update
         * @param  {Array} featureArray
         * @param  {String} thingResult
         * @param  {String} thingPhenomenonTime
         */
        liveUpdate: function (featureArray, thingResult, thingPhenomenonTime) {
            var itemNumber = featureArray[0],
                feature = featureArray[1],
                datastreamStates = feature.get("state"),
                datastreamPhenomenonTime = feature.get("phenomenonTime"),
                isClustered = this.has("clusterDistance") ? true : false;

            if (_.contains(datastreamStates, "|")) {
                datastreamStates = datastreamStates.split(" | ");
                datastreamPhenomenonTime = datastreamPhenomenonTime.split(" | ");

                datastreamStates[itemNumber] = thingResult;
                datastreamPhenomenonTime[itemNumber] = thingPhenomenonTime;

                feature.set("state", datastreamStates.join(" | "));
                feature.set("phenomenonTime", datastreamPhenomenonTime.join(" | "));
            }
            else {
                feature.set("state", thingResult);
                feature.set("phenomenonTime", thingPhenomenonTime);
            }
        },

        /**
         * get DataStreamIds
         * @return {Array} dataStreamIdsArray - contains all ids from this layer
         */
        getDataStreamIds: function () {
            var dataStreamIdsArray = [],
                features = this.getLayerSource().getFeatures();

            _.each(features, function (feature) {
                var dataStreamIds = feature.get("dataStreamId");

                if (_.contains(dataStreamIds, "|")) {
                    dataStreamIds = dataStreamIds.split(" | ");

                    _.each(dataStreamIds, function (id) {
                        dataStreamIdsArray.push(id);
                    });
                }
                else {
                    dataStreamIdsArray.push(String(dataStreamIds));
                }
            });

            return dataStreamIdsArray;
        },

        /**
         * get feature by a given id
         * @param  {number} id
         * @param  {array} features
         * @return {array} featureArray
         */
        getFeatureByDataStreamId: function (id, features) {
            var featureArray = [];

            _.each(features, function (feature) {
                var datastreamIds = feature.get("dataStreamId");

                if (_.contains(datastreamIds, "|")) {
                    datastreamIds = datastreamIds.split(" | ");

                    _.each(datastreamIds, function (thisId, index) {
                        if (parseInt(id, 10) === parseInt(thisId, 10)) {
                            featureArray.push(index);
                            featureArray.push(feature);
                        }
                    });
                }
                else if (parseInt(id, 10) === parseInt(datastreamIds, 10)) {
                    featureArray.push(0);
                    featureArray.push(feature);
                }
            });

            return featureArray;
        },

        /**
         * getter for style
         * @return {}
         */
        getStyle: function () {
            return this.get("style");
        },

        /**
         * setter for style
         * @param {[type]} value
         */
        setStyle: function (value) {
            this.set("style", value);
        },

        /**
         * setClusterLayerSource
         * @param {ol.source.Cluster} value
         */
        setClusterLayerSource: function (value) {
            this.set("clusterLayerSource", value);
        },

        /**
         * getClusterLayerSource
         * @return {ol.source.Cluster}
         */
        getClusterLayerSource: function () {
            return this.get("clusterLayerSource");
        },


// *************************************************************
// ***** Stream Layer                                      *****
// *************************************************************

        /**
         * create a connection to a websocketserver,
         * which fire new observation using MQTT
         */
        createWebSocketConnectionToStreamLayer: function () {
            // todo die URL entsprechend zusammenfügen
            var connection = new WebSocket(this.get("url"));

            // errors
            connection.onerror = function (error) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Ein Fehler bei der WebSocket Verbindung ist aufgetreten!</strong>",
                    kategorie: "alert-danger"
                });
            };

            // messages from the server
            connection.onmessage = function (ev) {
                var jsonData = JSON.parse(ev.data);

                Radio.trigger("SensorThingsLayer", "updateFromWebSocketStreamLayer", jsonData);
            };
        },

        updateFromWebSocketStreamLayer: function (esriJson) {
            // esriJson.geometry.x = 9.93864 + Math.random() * 0.01;
            // esriJson.geometry.y = 53.5521 + Math.random() * 0.01;

            var id = esriJson.attributes.id,
                features = this.getLayerSource().getFeatures(),
                epsg = "EPSG:" + esriJson.geometry.spatialReference["wkid"],
                location = [esriJson.geometry.x, esriJson.geometry.y],
                xyTransfrom = ol.proj.transform(location, epsg, Config.view.epsg),
                removeFeature = this.getFeatureById(features, id),
                drawFeature,
                isClustered = isClustered = this.has("clusterDistance") ? true : false;

            esriJson.geometry.x = xyTransfrom[0];
            esriJson.geometry.y = xyTransfrom[1];

            if(!_.isUndefined(removeFeature)) {
                this.getLayerSource().removeFeature(removeFeature);
            }

            drawFeature = new ol.format.EsriJSON().readFeatures(esriJson);
            // set ID and add features to vectorlayer
            drawFeature[0].setId(id);
            this.getLayerSource().addFeatures(drawFeature);

            this.set("loadend", "ready");
            Radio.trigger("SensorThingsLayer", "featuresLoaded", this.getId(), drawFeature);
            this.styling(isClustered);
            this.getLayer().setStyle(this.getStyle());
        },

        getFeatureById: function (features, id) {
            var feature = undefined;

            _.each(features, function (feat) {
                var featureId = feat.getId();

                if (featureId === id) {
                    feature = feat;
                }
            });

            return feature;
        }
    });

    return SensorThingsLayer;
});
