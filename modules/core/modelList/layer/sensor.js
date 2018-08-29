define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        ol = require("openlayers"),
        Config = require("config"),
        mqtt = require("mqtt"),
        moment = require("moment"),
        $ = require("jquery"),
        SensorLayer;

    SensorLayer = Layer.extend({

        defaults: _.extend({}, Layer.prototype.defaults,
            {
                epsg: "EPSG:4326",
                utc: "+1",
                version: "1.0"
            }),

        initialize: function () {
            if (!this.get("isChildLayer")) {
                Layer.prototype.initialize.apply(this);
            }

            // change language from moment.js to german
            moment.locale("de");
        },

        /**
         * creates ol.source.Vector as LayerSource
         * @returns {void}
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
            if (this.has("clusterDistance")) {
                this.createClusterLayerSource();
            }
        },

        /**
         * creates the layer and trigger to updateData
         * @returns {void}
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: this.has("clusterDistance") ? this.get("clusterLayerSource") : this.get("layerSource"),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                gfiTheme: _.isObject(this.get("gfiTheme")) ? this.get("gfiTheme").name : this.get("gfiTheme"),
                routable: this.get("routable"),
                id: this.get("id")
            }));

            this.updateData();

            Radio.trigger("HeatmapLayer", "loadInitialData", this.get("id"), this.get("layerSource").getFeatures());
        },

        /**
         * create ClusterLayerSourc
         * @returns {void}
         */
        createClusterLayerSource: function () {
            this.setClusterLayerSource(new ol.source.Cluster({
                source: this.get("layerSource"),
                distance: this.get("clusterDistance")
            }));
        },

        /**
         * initial loading of sensor data function
         * differences by subtypes
         * @returns {void}
         */
        updateData: function () {
            var sensorData,
                features,
                typ = this.get("typ").toUpperCase(),
                isClustered = this.has("clusterDistance"),
                url = this.get("url"),
                version = this.get("version"),
                urlParams = this.get("urlParameter"),
                epsg = this.get("epsg");

            // check for subtypes
            if (typ === "SENSORTHINGS") {
                sensorData = this.loadSensorThings(url, version, urlParams);
                features = this.drawPoints(sensorData, epsg);

                // Add features to vectorlayer
                if (!_.isEmpty(features)) {
                    this.get("layerSource").addFeatures(features);
                }

                // connection to live update
                this.createMqttConnectionToSensorThings(features);
            }
            else if (typ === "ESRISTREAMLAYER") {
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
                this.get("layer").setStyle(this.get("style"));
            }
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
                error: function () {
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
         * @return {Ol.Features} feature to draw
         */
        drawPoints: function (sensorData, epsg) {
            var features = [];

            _.each(sensorData, function (data, index) {
                var xyTransfrom,
                    feature;

                if (_.has(data, "location") && !_.isUndefined(epsg)) {
                    xyTransfrom = ol.proj.transform(data.location, epsg, Config.view.epsg);
                    feature = new ol.Feature({
                        geometry: new ol.geom.Point(xyTransfrom)
                    });
                }
                else {
                    return;
                }

                feature.setId(index);
                feature.setProperties(data.properties);

                // for a special theme
                if (_.isObject(this.get("gfiTheme"))) {
                    feature.set("gfiParams", this.get("gfiTheme").params);
                    feature.set("utc", this.get("utc"));
                }

                features.push(feature);
            }, this);

            // only features with geometry
            features = _.filter(features, function (feature) {
                return !_.isUndefined(feature.getGeometry());
            });

            return features;
        },

        /**
         * change time zone by given UTC-time
         * @param  {String} phenomenonTime - time of measuring a phenomenon
         * @param  {String} utc - timezone (default +1)
         * @return {String} phenomenonTime converted with UTC
         */
        changeTimeZone: function (phenomenonTime, utc) {
            var utcAlgebraicSign,
                utcNumber,
                utcSub,
                time = "";

            if (_.isUndefined(phenomenonTime)) {
                return "";
            }
            else if (!_.isUndefined(utc) && (_.includes(utc, "+") || _.includes(utc, "-"))) {
                utcAlgebraicSign = utc.substring(0, 1);

                if (utc.length === 2) {
                    // check for winter- and summertime
                    utcSub = parseInt(utc.substring(1, 2), 10);
                    utcSub = moment(phenomenonTime).isDST() ? utcSub + 1 : utcSub;
                    utcNumber = "0" + utcSub + "00";
                }
                else if (utc.length > 2) {
                    utcSub = parseInt(utc.substring(1, 3), 10);
                    utcSub = moment(phenomenonTime).isDST() ? utcSub + 1 : utcSub;
                    utcNumber = utc.substring(1, 3) + "00";
                }

                time = moment(phenomenonTime).utcOffset(utcAlgebraicSign + utcNumber).format("DD MMMM YYYY, HH:mm:ss");
            }

            return time;
        },

        /**
         * load SensorThings by
         * @param  {String} url - url to service
         * @param  {String} version - version from service
         * @param  {String} urlParams - url parameters
         * @return {array} all things with attributes and location
         */
        loadSensorThings: function (url, version, urlParams) {
            var allThings = [],
                thingsMerge = [],
                requestURL = this.buildSensorThingsURL(url, version, urlParams),
                things = this.getResponseFromRequestURL(requestURL),
                thingsCount = _.isUndefined(things["@iot.count"]) ? 0 : things["@iot.count"], // count of all things
                thingsbyOneRequest = things.value.length, // count of things on one request
                aggregateArrays,
                thingsRequestURL,
                index;

            allThings.push(things.value);
            for (index = thingsbyOneRequest; index < thingsCount; index += thingsbyOneRequest) {
                thingsRequestURL = requestURL + "&$skip=" + index;

                things = this.getResponseFromRequestURL(thingsRequestURL);
                allThings.push(things.value);
            }

            allThings = _.flatten(allThings);
            allThings = this.mergeByCoordinates(allThings);

            _.each(allThings, function (thing) {
                aggregateArrays = this.aggregateArrays(thing);
                if (!_.isUndefined(aggregateArrays.location)) {
                    thingsMerge.push(this.aggregateArrays(thing));
                }

            }, this);

            return thingsMerge;
        },

        /**
         * build SensorThings URL
         * @param  {String} url - url to service
         * @param  {String} version - version from service
         * @param  {String} urlParams - url parameters
         * @return {String} URL to request sensorThings
         */
        buildSensorThingsURL: function (url, version, urlParams) {
            var requestURL,
                and = "$",
                versionAsString = version;

            if (_.isNumber(version)) {
                versionAsString = version.toFixed(1);
            }

            requestURL = url + "/v" + versionAsString + "/Things?";

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
                indices = [],
                things,
                xy,
                xy2;

            _.each(allThings, function (thing, index) {
                // if the thing was assigned already
                if (!_.contains(indices, index)) {
                    things = [];
                    xy = this.getCoordinates(thing);

                    // if no datastream exists
                    if (_.isEmpty(thing.Datastreams)) {
                        return;
                    }

                    _.each(allThings, function (thing2, index2) {
                        xy2 = this.getCoordinates(thing2);

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
         * @param  {object} thing - thing
         * @return {array} coordinates
         */
        getCoordinates: function (thing) {
            var xy;

            if (!_.isUndefined(thing) && !_.isEmpty(thing.Locations)) {
                if (thing.Locations[0].location.type === "Feature" &&
                    !_.isUndefined(thing.Locations[0].location.geometry) &&
                    !_.isUndefined(thing.Locations[0].location.geometry.coordinates)) {

                    xy = thing.Locations[0].location.geometry.coordinates;
                }
                else if (thing.Locations[0].location.type === "Point" &&
                    !_.isUndefined(thing.Locations[0].location.coordinates)) {

                    xy = thing.Locations[0].location.coordinates;
                }
            }

            return xy;
        },

        /**
         * aggregate a given array into an object with location and properties
         * @param  {array} thingsArray - contain things with the same location
         * @return {object} contains location and properties
         */
        aggregateArrays: function (thingsArray) {
            var obj = {},
                properties,
                thingsProperties,
                keys;

            if (_.isEmpty(thingsArray)) {
                return obj;
            }
            else if (_.has(thingsArray[0], "properties")) {
                keys = _.keys(thingsArray[0].properties);
            }
            else {
                keys = [];
            }
            keys.push("state");
            keys.push("phenomenonTime");
            keys.push("dataStreamId");

            // add more properties
            thingsProperties = this.addProperties(thingsArray);

            // combine properties
            properties = this.combineProperties(keys, thingsProperties);

            // set URL and version to properties, to build on custom theme with analytics
            properties.requestURL = this.get("url");
            properties.versionURL = this.get("version");

            // add to Object
            obj.location = this.getCoordinates(thingsArray[0]);
            obj.properties = properties;

            return obj;
        },

        /**
         * add properties to previous properties
         * @param  {array} thingsArray - contain things with the same location
         * @return {array} contains location and properties
         */
        addProperties: function (thingsArray) {
            var thingsObservationsLength,
                thingsProperties = [],
                utc = this.get("utc");

            _.each(thingsArray, function (thing) {
                // if no datastream exists
                if (_.isEmpty(thing.Datastreams)) {
                    return;
                }

                thingsObservationsLength = thing.Datastreams[0].Observations.length;

                if (!_.has(thing, "properties")) {
                    thing.properties = {};
                }
                // get newest observation if existing
                if (thingsObservationsLength > 0) {
                    thing.properties.state = String(thing.Datastreams[0].Observations[0].result);
                    thing.properties.phenomenonTime = this.changeTimeZone(thing.Datastreams[0].Observations[0].phenomenonTime, utc);
                }
                else {
                    thing.properties.state = "undefined";
                    thing.properties.phenomenonTime = "undefined";
                }

                thing.properties.dataStreamId = thing.Datastreams[0]["@iot.id"];
                thingsProperties.push(thing.properties);
            }, this);

            return thingsProperties;
        },

        /**
         * combine various properties with a Pipe (|)
         * @param  {array} keys - contains propertie fields
         * @param  {array} thingsProperties - contains location and properties
         * @return {object} contains location and properties
         */
        combineProperties: function (keys, thingsProperties) {
            var properties = {},
                propList,
                propString;

            _.each(keys, function (key) {
                propList = _.pluck(thingsProperties, key);
                propString = propList.join(" | ");
                properties[key] = propString;
            }, this);

            return properties;
        },

        /**
         * parses the required elements from the specified url
         * and returns the sensordata as esriJSON
         * @return {esriJSON} sensorData
         */
        loadStreamLayer: function () {
            var layerUrl = this.get("url") + "?f=pjson",
                streamData = this.getResponseFromRequestURL(layerUrl),
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

            streamDataJSON = JSON.parse(streamData);
            streamId = streamDataJSON.displayField;
            // streamId = streamDataJSON.timeInfo.trackIdField;
            epsg = _.isUndefined(streamDataJSON.spatialReference) ? "EPSG:4326" : streamDataJSON.spatialReference.wkid;
            wssUrl = streamDataJSON.streamUrls[0].urls[0];

            // only if there is a URL
            if (!_.isUndefined(streamDataJSON.keepLatestArchive)) {
                featuresUrl = _.isUndefined(streamDataJSON.keepLatestArchive.featuresUrl) ? "" : streamDataJSON.keepLatestArchive.featuresUrl;
                featuresUrlWithQuery = featuresUrl + "/query?f=json&where=1%3D1&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&outSR=" + epsg;
                response = this.getResponseFromRequestURL(featuresUrlWithQuery);
                responseJSON = JSON.parse(response);
                sensorData = responseJSON.features;
            }

            this.setWssUrl(wssUrl);
            this.setStreamId(streamId);
            this.setEpsg("EPSG:" + epsg);

            return sensorData;
        },

        /**
         * draw features from esriJSON
         * @param  {esriJSON} sensorData - features
         * @return {array} olFeaturesArray
         */
        drawESRIGeoJson: function (sensorData) {
            var streamId = this.get("streamId"),
                epsgCode = this.get("epsg"),
                esriFormat = new ol.format.EsriJSON(),
                olFeaturesArray = [];

            _.each(sensorData, function (data) {
                var dataToString = this.changeValueToString(data),
                    id = dataToString.attributes[streamId],
                    olFeature;

                olFeature = esriFormat.readFeature(dataToString, {
                    dataProjection: epsgCode,
                    featureProjection: Config.view.epsg
                });

                olFeature.setId(id);
                olFeaturesArray.push(olFeature);
            }, this);

            this.get("layerSource").addFeatures(olFeaturesArray);

            return olFeaturesArray;
        },

        /**
         * change all numbers from features from StreamLayer to String
         * this is necessary to draw the gfi
         * @param  {Object} data - feature
         * @returns {Object} data
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
         * @param  {boolean} isClustered - should
         * @returns {void}
         */
        styling: function (isClustered) {
            var stylelistmodel = Radio.request("StyleList", "returnModelById", this.get("styleId"));

            if (!_.isUndefined(stylelistmodel)) {
                this.setStyle(function (feature) {
                    return stylelistmodel.createStyle(feature, isClustered);
                });
            }
        },

        /**
         * create connection to a given MQTT-Broker
         * this must be passes this as a context to call the updateFromMqtt function
         * @param {array} features - features with DatastreamID
         * @returns {void}
         */
        createMqttConnectionToSensorThings: function (features) {
            var dataStreamIds = this.getDataStreamIds(features),
                client = mqtt.connect({
                    host: this.get("url").split("/")[2],
                    protocol: "wss",
                    path: "/mqtt",
                    context: this
                });

            client.on("connect", function () {
                var version = this.options.context.get("version");

                _.each(dataStreamIds, function (id) {
                    client.subscribe("v" + version + "/Datastreams(" + id + ")/Observations");
                });
            });

            // messages from the server
            client.on("message", function (topic, payload) {
                var jsonData = JSON.parse(payload),
                    regex = /\((.*)\)/; // search value in chlich, that represents the datastreamid on position 1

                jsonData.dataStreamId = topic.match(regex)[1];
                this.options.context.updateFromMqtt(jsonData);
            });
        },

        /**
         * update the phenomenontime and states of the Feature
         * this function is triggerd from MQTT
         * @param  {json} thing - thing contains a new observation and accompanying topic
         * @returns {void}
         */
        updateFromMqtt: function (thing) {
            var thingToUpdate = !_.isUndefined(thing) ? thing : {},
                dataStreamId = thingToUpdate.dataStreamId,
                features = this.get("layerSource").getFeatures(),
                featureArray = this.getFeatureByDataStreamId(dataStreamId, features),
                thingResult = String(thingToUpdate.result),
                utc = this.get("utc"),
                thingPhenomenonTime = this.changeTimeZone(thingToUpdate.phenomenonTime, utc);

            this.liveUpdate(featureArray, thingResult, thingPhenomenonTime);
        },

        /**
         * performs the live update
         * @param  {Array} featureArray - contains the and index and feature which should be updates
         * @param  {String} thingResult - the new state
         * @param  {String} thingPhenomenonTime - the new phenomenonTime
         * @returns {void}
         */
        liveUpdate: function (featureArray, thingResult, thingPhenomenonTime) {
            var itemNumber = featureArray[0],
                feature = featureArray[1],
                datastreamStates = feature.get("state"),
                datastreamPhenomenonTime = feature.get("phenomenonTime");

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
            Radio.trigger("HeatmapLayer", "loadupdateHeatmap", this.get("id"), feature);
            Radio.trigger("GFI", "changeFeature", feature);
        },

        /**
         * get DataStreamIds
         * @param  {Array} features - features with datastreamids
         * @return {Array} dataStreamIdsArray - contains all ids from this layer
         */
        getDataStreamIds: function (features) {
            var dataStreamIdsArray = [];

            _.each(features, function (feature) {
                var dataStreamIds = _.isUndefined(feature.get("dataStreamId")) ? "" : feature.get("dataStreamId");

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
         * @param  {number} id - the if from examined feature
         * @param  {array} features - features to seacrh for
         * @return {array} featureArray
         */
        getFeatureByDataStreamId: function (id, features) {
            var featureArray = [];

            _.each(features, function (feature) {
                var datastreamIds = feature.get("dataStreamId");

                if (_.contains(datastreamIds, "|")) {
                    datastreamIds = datastreamIds.split(" | ");

                    _.each(datastreamIds, function (thingsId, index) {
                        if (parseInt(id, 10) === parseInt(thingsId, 10)) {
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
         * create a connection to a websocketserver,
         * which fire new observation using MQTT
         * thingPhenomenonTime
         * @returns {void}
         */
        createWebSocketConnectionToStreamLayer: function () {
            var that = this,
                websocketURL = this.get("wssUrl") + "/subscribe",
                connection = new WebSocket(websocketURL);

            // errors
            connection.onerror = function () {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Ein Fehler bei der WebSocket Verbindung ist aufgetreten!</strong>",
                    kategorie: "alert-danger"
                });
            };

            // messages from the server
            connection.onmessage = function (ev) {
                var jsonData = JSON.parse(ev.data);

                that.updateFromWebSocketStreamLayer(jsonData);
            };
        },

        /**
         * function updates the features when an event comes from ESRI-StreamLayer
         * one stream deliver only one feature
         * @param  {JSON} esriJson - contains the updated feature
         * @returns {void}
         */
        updateFromWebSocketStreamLayer: function (esriJson) {
            var streamId = this.get("streamId"),
                id = esriJson.attributes[streamId],
                features = this.get("layerSource").getFeatures(),
                existingFeature = this.getFeatureById(features, id),
                epsgCode = this.get("epsg"),
                esriFormat,
                olFeature,
                isClustered,
                location,
                xyTransform;

            // if the feature does not exist, then draw it otherwise update it
            if (_.isUndefined(existingFeature)) {
                esriFormat = new ol.format.EsriJSON();
                olFeature = esriFormat.readFeature(esriJson, {
                    dataProjection: epsgCode,
                    featureProjection: Config.view.epsg
                });
                isClustered = this.has("clusterDistance");

                olFeature.setId(id);
                this.get("layerSource").addFeature(olFeature);
                this.styling(isClustered);
                this.get("layer").setStyle(this.get("style"));

                Radio.trigger("HeatmapLayer", "loadupdateHeatmap", this.get("id"), olFeature);
            }
            else {
                location = [esriJson.geometry.x, esriJson.geometry.y];
                xyTransform = ol.proj.transform(location, epsgCode, Config.view.epsg);

                if (!(xyTransform[0] < 0 || xyTransform[1] < 0 || xyTransform[0] === Infinity || xyTransform[1] === Infinity)) {
                    existingFeature.setProperties(esriJson.attributes);
                    existingFeature.getGeometry().setCoordinates(xyTransform);

                    // trigger the heatmap and gfi to update them
                    Radio.trigger("HeatmapLayer", "loadupdateHeatmap", this.get("id"), existingFeature);
                    Radio.trigger("GFI", "changeFeature", existingFeature);
                }
            }
        },

        /**
         * returns a feature for a given id, if it exists
         * @param  {[Ol.Feature]} features - features from map
         * @param  {String} id - id from Stream-Feature
         * @return {Ol.Feature} feature - feature from map with the same id as Stream-Feature
         */
        getFeatureById: function (features, id) {
            var feature;

            _.each(features, function (feat) {
                var featureId = feat.get("id");

                if (featureId === id) {
                    feature = feat;
                }
            });

            return feature;
        },

        /**
         * create legend
         * @returns {void}
         */
        createLegendURL: function () {
            var style;

            if (!_.isUndefined(this.get("LegendURL")) && !this.get("LegendURL").length) {
                style = Radio.request("StyleList", "returnModelById", this.get("styleId"));

                if (!_.isUndefined(style)) {
                    this.setLegendURL([style.get("imagePath") + style.get("imageName")]);
                }
            }
        },

        /**
        * Prüft anhand der Scale ob der Layer sichtbar ist oder nicht
        * @param {object} options -
        * @returns {void}
        **/
        checkForScale: function (options) {
            if (parseFloat(options.scale, 10) <= this.get("maxScale") && parseFloat(options.scale, 10) >= this.get("minScale")) {
                this.setIsOutOfRange(false);
            }
            else {
                this.setIsOutOfRange(true);
            }
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
