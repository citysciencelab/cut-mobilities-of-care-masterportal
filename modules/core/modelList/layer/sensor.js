define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Config = require("config"),
        mqtt = require("mqtt"),
        moment = require("moment"),
        SensorLayer;

    SensorLayer = Layer.extend({

        defaults: _.extend({}, Layer.prototype.defaults,
            {
                webSocketPortSTS: 9876,
                epsg: "EPSG:4326"
            }
        ),
        initialize: function () {
            this.superInitialize();
            var channel = Radio.channel("SensorLayer");

            // change language from moment.js to german
            moment.locale("de");
        },

        /**
         * creates ol.source.Vector as LayerSource
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
        },

        /**
         * creates the layer and trigger to updateData
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: this.has("clusterDistance") ? this.getClusterLayerSource() : this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                gfiTheme: this.get("gfiTheme"),
                routable: this.get("routable"),
                id: this.getId()
            }));

            this.updateData();

            Radio.trigger("HeatmapLayer", "loadInitialData", this.getId(), this.getLayerSource().getFeatures());
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
            var sensorData,
                features = undefined,
                subTyp = this.get("subTyp").toUpperCase(),
                isClustered = this.has("clusterDistance") ? true : false,
                startTime = new Date().getTime(),
                endTime;

            // check for subtypes
            if (subTyp === "SENSORTHINGS") {
                sensorData = this.loadSensorThings();
                features = this.drawPoints(sensorData);
                this.createMqttConnectionToSensorThings();
                // this.createWebSocketConnection();
            }
            else if (subTyp === "ESRISTREAMLAYER") {
                sensorData = this.loadStreamLayer();
                if (!_.isUndefined(sensorData)) {
                    features = this.drawESRIGeoJson(sensorData);
                }
                if (!_.isUndefined(this.get("wssUrl"))) {
                    this.createWebSocketConnectionToStreamLayer();
                }
            }

            if (!_.isUndefined(features)) {
                this.styling(isClustered);
                this.getLayer().setStyle(this.getStyle());

                endTime = new Date().getTime();
                console.log(subTyp);
                console.log(this.attributes.name + ":");
                console.log("Parsen: " + (endTime - startTime) / 1000 + " Sekunden");
                console.log("Anzahl der Features: " + features.length);
                console.log("-----------------------");
            }
        },

         /**
         * get response from a given URL
         * @param  {String} requestURL - to request sensordata
         * @return {objects} response with sensorObjects
         */
        getResponseFromRequestURL: function (requestURL, asynchronous) {
            var response = undefined;

            Radio.trigger("Util", "showLoader");
            $.ajax({
                url: requestURL,
                async: asynchronous,
                type: "GET",
                context: this,

                // handling response
                success: function (resp) {
                    Radio.trigger("Util", "hideLoader");
                    response = resp;
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Util", "hideLoader");
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Unerwarteter Fehler beim Laden der Sensordaten des Layers " +
                            this.get("name") + " aufgetreten</strong>",
                        kategorie: "alert-danger"
                    });
                }
            });

            return response;
        },

        /**
         * draw points on the map
         * @param  {array} sensorData - sensor with location and properties
         * @param  {Sting} epsg - from Sensortype
         */
        drawPoints: function (sensorData) {
            var features = [],
                epsg = this.get("epsg");

            _.each(sensorData, function (thisSensorData, index) {
                var xyTransfrom = ol.proj.transform(thisSensorData.location, epsg, Config.view.epsg),
                    feature = new ol.Feature({
                        geometry: new ol.geom.Point(xyTransfrom)
                    });

                feature.setId(index);
                feature.setProperties(thisSensorData.properties);
                // for a special theme
                feature.set("gfiParams", this.get("gfiParams"));
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
         * change time zone by given UTC-time
         * @param  {String} phenomenonTime
         * @return {String} phenomenonTime converted with UTC
         */
        changeTimeZone: function (phenomenonTime) {
            var time = phenomenonTime,
                utc = this.get("utc");

            if (!_.isUndefined(utc)) {
                var utcAlgebraicSign = utc.substring(0, 1),
                    utcNumber,
                    utcSub;

                if (utc.length === 2) {
                    // check for winter- and summertime
                    utcSub = parseInt(utc.substring(1, 2), 10);
                    utcSub = (moment(phenomenonTime).isDST()) ? utcSub + 1 : utcSub;
                    utcNumber = "0" + utcSub + "00";
                }
                else if (utc.length > 2) {
                    utcSub = parseInt(utc.substring(1, 3), 10);
                    utcSub = (moment(phenomenonTime).isDST()) ? utcSub + 1 : utcSub;
                    utcNumber = utc.substring(1, 3) + "00";
                }

                time = moment(phenomenonTime).utcOffset(utcAlgebraicSign + utcNumber).format("DD MMMM YYYY, HH:mm:ss");
            }
            return time;
        },

        /**
         * load SensorThings by
         * @return {array} all things with attributes and location
         */
        loadSensorThings: function () {
            var allThings = [],
                thingsMerge = [],
                requestURL = this.buildSensorThingsURL(),
                things = this.getResponseFromRequestURL(requestURL, false),
                thingsCount = things["@iot.count"], // count of all things
                thingsbyOneRequest = things.value.length; // count of things on one request

            allThings.push(things.value);
            for (var i = thingsbyOneRequest; i < thingsCount; i += thingsbyOneRequest) {
                var thisRequestURL = requestURL + "&$skip=" + i;

                things = this.getResponseFromRequestURL(thisRequestURL, false);
                allThings.push(things.value);
            };

            allThings = _.flatten(allThings);
            allThings = this.mergeByCoordinates(allThings);

            _.each(allThings, function (things, index) {
                aggreateArrays = this.aggreateArrays(things);
                if (!_.isUndefined(aggreateArrays.location)) {
                    thingsMerge.push(this.aggreateArrays(things));
                }

            }, this);

            return thingsMerge;
        },

        /**
         * build SensorThings URL
         * @return {String} URL to request sensorThings
         */
        buildSensorThingsURL: function () {
            var requestURL = this.get("url") + "/v" + this.get("version") + "/Things?",
                and = "$",
                urlParams = this.get("urlParameter");

            if (!_.isUndefined(urlParams)) {
                _.each(urlParams, function (value, key) {
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

                    // if no datastream exists
                    if (_.isEmpty(thing.Datastreams)) {
                        return;
                    }

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

            if (_.isEmpty(thing.Locations)) {
                xy = undefined;
            }
            else if (thing.Locations[0].location.type === "Feature") {
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
                // if no datastream exists
                if (_.isEmpty(thing.Datastreams)) {
                    return;
                }

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

            // set URL and version to properties, to build on custom theme with analytics
            properties.requestURL = this.get("url");
            properties.versionURL = this.get("version");

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

        /**
         * parses the required elements from the specified url
         * and returns the sensordata as esriJSON
         * @return {esriJSON} sensorData
         */
        loadStreamLayer: function () {
            var layerUrl = this.get("url") + "?f=pjson",
                streamData = this.getResponseFromRequestURL(layerUrl, false),
                streamDataJSON,
                streamId,
                epsg,
                wssUrl,
                featuresUrl,
                featuresUrlWithQuery,
                response,
                responseJSON,
                sensorData;

            if (_.isUndefined(streamData)) {
                return streamData;
            }

            streamDataJSON = JSON.parse(streamData),
            streamId = streamDataJSON.displayField,
            // streamId = streamDataJSON.timeInfo.trackIdField,
            epsg = (_.isUndefined(streamDataJSON.spatialReference)) ? "EPSG:4326" : streamDataJSON.spatialReference.wkid,
            wssUrl = streamDataJSON.streamUrls[0].urls[0];

            // only if there is a URL
            if (!_.isUndefined(streamDataJSON.keepLatestArchive)) {
                featuresUrl = (_.isUndefined(streamDataJSON.keepLatestArchive.featuresUrl)) ? undefined : streamDataJSON.keepLatestArchive.featuresUrl;
                featuresUrlWithQuery = featuresUrl + "/query?f=json&where=1%3D1&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&outSR=" + epsg,
                response = this.getResponseFromRequestURL(featuresUrlWithQuery, false),
                responseJSON = JSON.parse(response),
                sensorData = responseJSON.features;
            }
            else {
                sensorData = undefined;
            }

            this.setWssUrl(wssUrl);
            this.setStreamId(streamId);
            this.setEpsg("EPSG:" + epsg);

            return sensorData;
        },

        /**
         * draw features from esriJSON
         * @param  {esriJSON} sensorData
         * @return {[ol.Feature]}
         */
        drawESRIGeoJson: function (sensorData) {
            var streamId = this.get("streamId"),
                epsgCode = this.get("epsg"),
                esriFormat = new ol.format.EsriJSON(),
                olFeaturesArray = [];

            _.each(sensorData, function (data) {
                if (this.get("fake")) {
                    data.geometry.x = 9.65 + Math.random() * 0.65;
                    data.geometry.y = 53.32 + Math.random() * 0.42;
                }

                data = this.changeValueToString(data);

                var olFeature = esriFormat.readFeature(data, {
                        dataProjection: epsgCode,
                        featureProjection: Config.view.epsg
                    }),
                    id = data.attributes[streamId];

                olFeature.setId(id);
                olFeaturesArray.push(olFeature);
            }, this);

            this.getLayerSource().addFeatures(olFeaturesArray);

            return olFeaturesArray;
        },

        /**
         * change all numbers from features from StreamLayer to String
         * this is necessary to draw the gfi
         * @param  {Object} data
         * @return {Object}
         */
        changeValueToString: function (data) {
            var attributes = data.attributes,
                values = _.values(attributes),
                keys = _.keys(attributes);

            _.each(keys, function (key, index) {
                if (_.isNumber(values[index])) {
                    attributes[key] = String(values[index]);
                }
            });

            return data;
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

// *************************************************************
// ***** live update via MQTT or websocket                 *****
// *************************************************************
    /**
     * create connection to a given MQTT-Broker
     * this must be passes this as a context to call the updateFromMqtt function
     */
        createMqttConnectionToSensorThings: function () {
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
            var thisSensor = this,
                connection = new WebSocket("ws://127.0.0.1:8767");

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

                thisSensor.updateFromWebSocket(jsonData);
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
                featureArray = this.getFeatureByDataStreamId(dataStreamId, features),
                thingResult = String(this.convertScaling(thing[dataStreamId].result)),
                thingPhenomenonTime = this.changeTimeZone(thing[dataStreamId].phenomenonTime);

                this.liveUpdate(featureArray, thingResult, thingPhenomenonTime);
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

            // trigger the heatmap and gfi to update them
            Radio.trigger("HeatmapLayer", "loadupdateHeatmap", this.getId(), feature);
            Radio.trigger("GFI", "changeFeature", feature);
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

// *************************************************************
// ***** Live update with ESRI-StreamLayer                 *****
// *************************************************************
        /**
         * create a connection to a websocketserver,
         * which fire new observation using MQTT
         */
        createWebSocketConnectionToStreamLayer: function () {
            var thisSensor = this,
                // websocketURL = this.getWebSocketURLByWindowProtocol(),
                websocketURL = this.get("wssUrl") + "/subscribe",
                connection = new WebSocket(websocketURL);

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

                thisSensor.updateFromWebSocketStreamLayer(jsonData);
            };
        },

        /**
         * check protocol from portal an get appropriate websocketURL
         * @return {String} websocketURL
         */
        getWebSocketURLByWindowProtocol: function () {
            var protocol = window.location.protocol,
                wssUrl = this.get("wssUrl"),
                wsUrl = this.get("wsUrl");

            if (protocol === "https:" && !_.isUndefined(wssUrl)) {
                return wssUrl + "/subscribe";
            }
            else if (protocol === "http:" && !_.isUndefined(wsUrl)) {
                return wsUrl + "/subscribe";
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Ein Fehler bei der WebSocket Verbindung ist aufgetreten! Bitte die Parameter überprüfen!</strong>",
                    kategorie: "alert-danger"
                });
                return undefined;
            }
        },

        /**
         * function updates the features when an event comes from ESRI-StreamLayer
         * one stream deliver only one feature
         * @param  {JSON} esriJson
         */
        updateFromWebSocketStreamLayer: function (esriJson) {
// ******** Fake coordinates for testing ********************************
            if (this.get("fake")) {
                esriJson.geometry.x = 9.65 + Math.random() * 0.65;
                esriJson.geometry.y = 53.32 + Math.random() * 0.42;
            }
// **********************************************************************
            var streamId = this.get("streamId"),
                id = esriJson.attributes[streamId],
                features = this.getLayerSource().getFeatures(),
                existingFeature = this.getFeatureById(features, id),
                epsgCode = this.get("epsg");

            // if the feature does not exist, then draw it otherwise update it
            if (_.isUndefined(existingFeature)) {
                var esriFormat = new ol.format.EsriJSON(),
                    olFeature = esriFormat.readFeature(esriJson, {
                        dataProjection: epsgCode,
                        featureProjection: Config.view.epsg
                    }),
                    isClustered = isClustered = this.has("clusterDistance") ? true : false;

                olFeature.setId(id);
                this.getLayerSource().addFeature(olFeature);
                this.styling(isClustered);
                this.getLayer().setStyle(this.getStyle());

                Radio.trigger("HeatmapLayer", "loadupdateHeatmap", this.getId(), olFeature);
            }
            else {
                var location = [esriJson.geometry.x, esriJson.geometry.y],
                    xyTransform = ol.proj.transform(location, epsgCode, Config.view.epsg);

                if (xyTransform[0] < 0 || xyTransform[1] < 0 || xyTransform[0] === Infinity || xyTransform[1] === Infinity) {
                    return;
                }
                else {
                    existingFeature.setProperties(esriJson.attributes);
                    existingFeature.getGeometry().setCoordinates(xyTransform);

                    // trigger the heatmap and gfi to update them
                    Radio.trigger("HeatmapLayer", "loadupdateHeatmap", this.getId(), existingFeature);
                    Radio.trigger("GFI", "changeFeature", existingFeature);
                }
            }
        },

        /**
         * returns a feature for a given id, if it exists
         * @param  {[ol.Feature]} features - features from map
         * @param  {String} id - id from Stream-Feature
         * @return {ol.Feature} feature - feature from map with the same id as Stream-Feature
         */
        getFeatureById: function (features, id) {
            var feature = undefined;

            _.each(features, function (feat) {
                var featureId = feat.getId();

                if (featureId === id) {
                    feature = feat;
                }
            });

            return feature;
        },

// *************************************************************
// ***** Getter- and Setter-Methods                        *****
// *************************************************************
        getStyle: function () {
            return this.get("style");
        },

        getClusterLayerSource: function () {
            return this.get("clusterLayerSource");
        },

        getStyleId: function () {
            return this.get("styleId");
        },

        setStyle: function (value) {
            this.set("style", value);
        },

        setClusterLayerSource: function (value) {
            this.set("clusterLayerSource", value);
        },

        setWssUrl: function (value) {
            this.set("wssUrl", value);
        },

        setStreamId: function (value) {
            this.set("streamId", value);
        },

        setEpsg: function (value) {
            this.set("epsg", value);
        }

    });

    return SensorLayer;
});
