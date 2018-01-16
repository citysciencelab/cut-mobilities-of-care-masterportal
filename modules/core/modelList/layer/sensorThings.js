define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Config = require("config"),
        mqtt = require("mqtt"),
        moment = require("moment"),
        SensorThingsLayer;

    SensorThingsLayer = Layer.extend({

        initialize: function () {
            this.superInitialize();
            var channel = Radio.channel("sensorThings");

            channel.on({
                "updateFromWebSocket": this.updateFromWebSocket
            }, this);

            // start socket-connection
            this.createWebSocket();

            // start mqtt-connection
            // this.getMQTT();

        },

        /**
         * create ol.source.Vector as LayerSource
         */
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
         * initial loading of sensor data function
         * differences by subtypes
         */
        updateData: function () {
            var sensorData,
                epsg,
                features,
                subtyp = this.get("subtyp"),
                geometry = this.get("geometry").toUpperCase(),
                isClustered = this.has("clusterDistance") ? true : false;

            if (this.checkRequiredParameter()) {
                // check for subtypes
                if (subtyp === "SensorThings") {
                    sensorData = this.loadSensorThings();
                    epsg = "EPSG:4326";
                }
            }

            if (geometry === "POINT") {
                features = this.drawPoints(sensorData, epsg);
            }

            this.styling(isClustered, features);
        },

        /**
         * check required parameter from services-internet.json
         * @return {boolean} true if all required parameters set
         */
        checkRequiredParameter: function () {
            var boolean = true;

            if (_.isUndefined(this.get("id"))) {
                boolean = false;
                console.log("id is undefined");
            }
            if (_.isUndefined(this.get("name"))) {
                boolean = false;
                console.log("name is undefined");
            }
            if (_.isUndefined(this.get("url"))) {
                boolean = false;
                console.log("url is undefined");
            }
            if (_.isUndefined(this.get("typ"))) {
                boolean = false;
                console.log("typ is undefined");
            }
            if (_.isUndefined(this.get("subtyp"))) {
                boolean = false;
                console.log("subtyp is undefined");
            }
            if (_.isUndefined(this.get("version"))) {
                boolean = false;
                console.log("version is undefined");
            }
            if (_.isUndefined(this.get("gfiTheme"))) {
                boolean = false;
                console.log("gfiTheme is undefined");
            }
            if (_.isUndefined(this.get("gfiAttributes"))) {
                boolean = false;
                console.log("gfiAttributes is undefined");
            }
            return boolean;
        },

         /**
         * get response from a given url
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
         * [styling description]
         * @param  {Boolean} isClustered [description]
         * @return {[type]}              [description]
         */
        styling: function (isClustered, features) {
            var stylelistmodel = Radio.request("StyleList", "returnModelById", this.getStyleId());

            if (!_.isUndefined(stylelistmodel)) {
                _.each(features, function (feature) {
                    feature.setStyle(stylelistmodel.createStyle(feature, isClustered));
                }, this);
            }
        },

        /**
         * change time zone
         * @param  {String} phenomenonTime
         * @return {String} phenomenonTime in UTC+1
         */
        changeTimeZone: function (phenomenonTime) {
            return moment(phenomenonTime).utcOffset("+0100").format("DD MMMM YYYY, HH:mm:ss");
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
                things = this.getResponseFromRequestURL(requestURL),
                thingsCount = things["@iot.count"], // count of all things
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
                    propString = this.combinePropertiesAsString(propList);

                properties[key] = propString;
            }, this);

            // add to Object
            obj.location = this.getCoordinates(thingsArray[0]);
            obj.properties = properties;

            return obj;
        },

        /**
         * combine properties with equal key, seperate by "|"
         * @param  {array} properties - from things with same location
         * @return {String} properties as String
         */
        combinePropertiesAsString: function (properties) {
            var propString = properties[0];

            _.each(properties, function (prop, index) {
                if (index > 0) {
                    propString = propString + " | " + prop;
                }
            });

            return propString;
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
                state = state.toFixed(scalingDecimal);
            }
            if (!_.isUndefined(scalingUnit)) {
                state = state + " " + scalingUnit;
            }

            return state;
        },

// *************************************************************
// ***** update via websockets                             *****
// *************************************************************
        /**
         * create a connection to a websocketserver,
         * which fire new observation using MQTT
         */
        createWebSocket: function () {
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
                console.log("Websocket is finished");
            };
        },

        /**
         * updates by event from Websocket
         * @param  {array} things
         */
        updateFromWebSocket: function (things) {
            var keys = Object.keys(things),
                dataStreamId = keys[0],
                features = this.getLayerSource().getFeatures(),
                result = things[dataStreamId].result,
                thisPhenomTime = things[dataStreamId].phenomenonTime,
                thisFeatureArray = this.getFeatureById(dataStreamId, features),
                isClustered = this.has("clusterDistance") ? true : false;

            // Change properties only in Layer witch contain the Datastream
            if (!_.isEmpty(thisFeatureArray)) {
                var thisPlugIndex = thisFeatureArray[0],
                    thisFeature = thisFeatureArray[1],
                    // change state and phenomenonTime
                    datastreamStates = thisFeature.get("state"),
                    datastreamPhenomenonTime = thisFeature.get("phenomenonTime"),
                    scalingObject,
                    svgPath;

                // change time zone
                thisPhenomenonTime = this.changeTimeZone(thisPhenomTime);

                if (_.contains(datastreamStates, "|")) {
                    datastreamStates = datastreamStates.split(" | ");
                    datastreamPhenomTime = datastreamPhenomenonTime.split(" | ");

                    datastreamStates[thisPlugIndex] = String(result);
                    datastreamPhenomTime[thisPlugIndex] = thisPhenomenonTime;
                }
                else {
                    datastreamStates = String(result);
                    datastreamPhenomTime = thisPhenomenonTime;
                }

                datastreamStates = this.convertScaling(datastreamStates);

                // update states in feature
                if (_.isArray(datastreamStates)) {
                    thisFeature.set("state", this.combinePropertiesAsString(datastreamStates));
                    thisFeature.set("phenomenonTime", this.combinePropertiesAsString(datastreamPhenomTime));
                }
                else {
                    thisFeature.set("state", datastreamStates);
                    thisFeature.set("phenomenonTime", datastreamPhenomTime);
                }

                this.styling(isClustered, [thisFeature]);
                console.log(thisFeature);
            }
        },

        /**
         * [getFeatureById description]
         * @param  {number} id       [description]
         * @param  {array} features -
         * @return {array}          [description]
         */
        getFeatureById: function (id, features) {
            var thisFeatureArray = [];

            _.each(features, function (feature) {
                var datastreamIds = feature.get("dataStreamId");

                if (_.contains(datastreamIds, "|")) {
                    datastreamIds = datastreamIds.split(" | ");

                    _.each(datastreamIds, function (thisId, index) {
                        if (id === thisId) {
                            thisFeatureArray.push(index);
                            thisFeatureArray.push(feature);
                        }
                    });
                }
                else if (id === String(datastreamIds)) {
                    thisFeatureArray.push(0);
                    thisFeatureArray.push(feature);
                }
            });

            return thisFeatureArray;
        },

// *************************************************************
// ***** update via MQTT                                   *****
// *************************************************************
        getMQTT: function () {
            console.log(mqtt);
            // var client = mqtt.connect({ host: "localhost", port: 1234 });
            // var client = mqtt.connect({host: "51.5.242.162", port : 1883, path : "/mqtt"});
            var client = mqtt.connect({host: "51.5.242.162", port : 9876, path : "/mqtt", protocolId : "MQTT"});
            // var client = mqtt.connect({host: "example.sensorup.com", port : 1883, path : "/mqtt"});

            console.log(client);

            // client.subscribe("presence");
            client.subscribe("v1.0/Datastreams(2)/Observations");
            // client.subscribe("v1.0/Datastreams(503254)/Observations");

            client.on("message", function (topic, payload) {
              console.log([topic, payload].join(": "));
              client.end();
            });

            client.publish("presence", "hello world!");
        },

        /**
         * getter for StyleId
         * @return {number} styleId
         */
        getStyleId: function () {
            return this.get("styleId");
        }
    });

    return SensorThingsLayer;
});
