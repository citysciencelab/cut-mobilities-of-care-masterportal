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
                epsg;

            this.setSimpleStyle();

            if (this.checkRequiredParameter()) {
                // check for subtypes
                if (this.get("subtyp") === "SensorThings") {
                    sensorData = this.loadSensorThings();
                    epsg = "EPSG:4326";
                }
            }

            if (this.get("geometry") === "point") {
                this.drawPoints(sensorData, epsg);
            }

            Radio.trigger("Util", "hideLoader");
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
            var points = [],
                scalingObject,
                svgPath;

            _.each(sensorData, function (thisSensor) {
                var xyTransfrom = ol.proj.transform(thisSensor.location, epsg, Config.view.epsg),
                    point = new ol.Feature({
                        geometry: new ol.geom.Point(xyTransfrom)
                    });

                point.setProperties(thisSensor.properties);

                // check scaling
                if (this.get("scaling") === "nominal") {
                    scalingObject = this.fillScalingAttributes(point);
                }
                else if (this.get("scaling") === "interval") {
                    // Aufruf für intervalskalierte Daten
                }

                // check shape
                if (this.get("scalingShape") === "circle") {
                    svgPath = this.createCircleSegments(scalingObject);
                }

                this.drawSvgAndIcon(point, svgPath);
                points.push(point);

            }, this);

            // Add features to vectorlayer
            this.getLayerSource().addFeatures(points);
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
                    thing.properties.phenomenonTime = thing.Datastreams[0].Observations[0].phenomenonTime;
                }
                else {
                    thing.properties.state = "undefined";
                    thing.properties.phenomenonTime = "undefined";
                }

                thing.properties.dataStreamId = thing.Datastreams[0]["@iot.id"];
                thingsProperties.push(thing.properties);
            });

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

// *************************************************************
// ***** style for things as points                        *****
// *************************************************************

        /**
         * convert scalingAttribute to object
         * @return {object} scalingAttribute with value 0
         */
        getScalingAttributesAsObject: function () {
            var obj = {};

            _.each(this.get("scalingAttributes"), function (key, value) {
                obj[value] = 0;
            });

            return obj;
        },

        /**
         * fills the object with values
         * @param {ol.feature} feature
         */
        fillScalingAttributes: function (feature) {
            var scalingObject = this.getScalingAttributesAsObject(),
                states = feature.get("state");

            if (_.contains(states, "|")) {
                states = states.split(" | ");
            }

            _.each(states, function (state) {
                if (state) {
                    scalingObject[state] = scalingObject[state] + 1;
                }
            });
            return scalingObject;
        },

        /**
         * create a svg with colored circle segments
         * @param  {object} scalingObject - contains state and value
         * @return {String} svg with colored circle segments
         */
        createCircleSegments: function (scalingObject) {
            var svg = '<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
                n = _.reduce(_.values(scalingObject), function (memo, num) {
                        return memo + num;
                    }, 0),
                degreeSegment = 360 / n,
                startAngelDegree = 0,
                endAngelDegree = degreeSegment,
                strokeWidth = 4,
                fill = "none";

            svg = svg + '<circle cx="60" cy="60" r="23" stroke="white" stroke-width="4" fill="none"/>';

            _.each(scalingObject, function (value, key) {
                if (value) {
                    var strokeColor = this.get("scalingAttributes")[key];

                    for (var i = 0; i < value; i++) {
                        var d = this.calculateCircleSegment(startAngelDegree, endAngelDegree);

                        svg = this.extendsSVG(svg, fill, strokeWidth, strokeColor, d);

                        // set degree for next circular segment
                        startAngelDegree = startAngelDegree + degreeSegment;
                        endAngelDegree = endAngelDegree + degreeSegment;
                    };
                }
            }, this);

            svg = svg + '</svg>';

            return svg;
        },

        /**
         * create circle segments
         * @param  {number} startAngelDegree - start with circle segment
         * @param  {number} endAngelDegree - finish with circle segment
         * @return {String} all circle segments
         */
        calculateCircleSegment: function (startAngelDegree, endAngelDegree) {
            var rad = Math.PI / 180,
                radius = 23,
                x = 60,
                y = 60;

            // convert angle from degree to radiant
            startAngleRad = startAngelDegree * rad;
            endAngleRad = (endAngelDegree - 10) * rad;

            xStart = x + (Math.cos(startAngleRad) * radius);
            yStart = y - (Math.sin(startAngleRad) * radius);

            xEnd = x + (Math.cos(endAngleRad) * radius);
            yEnd = y - (Math.sin(endAngleRad) * radius);

            var d = [
                "M", xStart, yStart,
                "A", radius, radius, 0, 0, 0, xEnd, yEnd
            ].join(" ");

            return d;
        },

        /**
         * draw svg and and icon
         * @param  {String} svgPath
         * @return {[type]}     [description]
         */
        drawSvgAndIcon: function (point, svgPath) {
            styleSVG = new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'data:image/svg+xml;utf8,' + svgPath
                })
            });

            // add both styles (png, svg)
            styleIcon = this.getStyleAsFunction(this.get("style"));
            point.setStyle([styleIcon(point)[0], styleSVG]);
        },

        /**
         * extends the svg with given tags
         * @param  {String} svg
         * @param  {String} fill
         * @param  {String} strokeWidth
         * @param  {String} stroke
         * @param  {String} d
         * @return {String} extended svg
         */
        extendsSVG: function (svg, fill, strokeWidth, stroke, d) {
            svg = svg + '<path ';
            svg = svg + 'fill="' + fill + '" ';
            svg = svg + 'stroke-width="' + strokeWidth + '" ';
            svg = svg + 'stroke="' + stroke  + '" ';
            svg = svg + 'd="' + d + '"/>';

            return svg;
        },

        setSimpleStyle: function () {
            var styleId = this.get("styleId"),
                stylelistmodel = Radio.request("StyleList", "returnModelById", styleId);

            this.set("style", stylelistmodel.getSimpleStyle());
        },

        getStyleAsFunction: function (style) {
            if (_.isFunction(style)) {
                return style;
            }
            else {
                return function (feature) {
                    return style;
                };
            }
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
                thisFeatureArray = this.getFeatureById(dataStreamId, features);

            // Change properties only in Layer witch contain the Datastream
            if (!_.isEmpty(thisFeatureArray)) {
                var thisPlugIndex = thisFeatureArray[0],
                    thisFeature = thisFeatureArray[1],
                    // change state and phenomTime
                    datastreamStates = thisFeature.get("state"),
                    datastreamPhenomTime = thisFeature.get("phenomenonTime"),
                    scalingObject,
                    svgPath;

                if (_.contains(datastreamStates, "|")) {
                    datastreamStates = datastreamStates.split(" | ");
                    datastreamPhenomTime = datastreamPhenomTime.split(" | ");

                    datastreamStates[thisPlugIndex] = String(result);
                    datastreamPhenomTime[thisPlugIndex] = thisPhenomTime;
                }
                else {
                    datastreamStates = String(result);
                    datastreamPhenomTime = thisPhenomTime;
                }

                // update states in feature
                if (_.isArray(datastreamStates)) {
                    thisFeature.set("state", this.combinePropertiesAsString(datastreamStates));
                    thisFeature.set("phenomenonTime", this.combinePropertiesAsString(datastreamPhenomTime));
                }
                else {
                    thisFeature.set("state", datastreamStates);
                    thisFeature.set("phenomenonTime", datastreamPhenomTime);
                }

                // check geometry
                if (this.get("geometry") === "point") {
                    // check scaling
                    if (this.get("scaling") === "nominal") {
                        scalingObject = this.fillScalingAttributes(thisFeature);
                    }
                    else if (this.get("scaling") === "interval") {
                        // Aufruf für intervalskalierte Daten
                    }

                    // check shape
                    if (this.get("scalingShape") === "circle") {
                        svgPath = this.createCircleSegments(scalingObject);
                    }
                }

                console.log(thisFeature);
                this.drawSvgAndIcon(thisFeature, svgPath);
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
            var options = {
                    port: 1883,
                    keepalive: 60,
                    encoding: "utf8",
                    protocol: "mqtt"
                    // protocolId: "MQIsdp",
                    // protocolVersion: 3
                    // debug: true,
                    // clientId: "bgtestnodejs",
                    // ca: "MIICAzCCAWwCCQD04MY/0wjqfzANBgkqhkiG9w0BAQUFADBGMQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0ZTEQMA4GA1UEChMHR3J1bnRKUzEQMA4GA1UEAxMHMC4wLjAuMDAeFw0xNDAyMTkyMzE0NDZaFw0xNTAyMTkyMzE0NDZaMEYxCzAJBgNVBAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMRAwDgYDVQQKEwdHcnVudEpTMRAwDgYDVQQDEwcwLjAuMC4wMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDAaENBF2WVZ2dqU5sS8OVA2ZdT9J8kbhgIjxtL5DLjFL7s4/uF3dYPBCMSOjfFj37UXZcRZ8DTiX6YmXvnmw/Sqn7hp8QRqtXPtmP+pT6gLNJLVrlqAezDQCvrH+1hHInAmHyrrbYS3ydXiElt4ymyA2HdeIKsgrle66Z26YgHmQIDAQABMA0GCSqGSIb3DQEBBQUAA4GBAHpxr4nK7HIeyx4MN7QNqPSHA0CnNyb6E7MQGKCufZyAM7dTa2Pdc+P5MPlskm6HuPQy7BCGdr6lujlXkH6zzpjytGuXHq45BxiLq49ld3lUIj6W1cMVi2u/iIGE/fqU4vHO8yBBvgr9Cdz/X16jbjYCjRUEZxnarlNuVKn5nMlm",
                    // rejectUnuthorized: true,
                    // wsOptions: {
                    //                 port: 9001,
                    //                 host: "ws://localhost:9001/websocket"
                    // //                 server: "https.Server",
                    // //                 protocol: "wss"
                    //             }
                },
                vartopicList = [],
                // client  = mqtt.connect("ws://localhost:9001/websocket", options);
                client  = mqtt.connect("http://51.5.242.162", options);
                // client  = mqtt.connect("ws://localhost:9001/websocket");

            // subscribe
            client.on("connect", function () {
                console.log("mqtt is connected");
                for (var i = 2; i <= 758; i++) {
                    var thisTopic = {};

                    thisTopic.id = i;
                    thisTopic.topic = "v1.0/Datastreams(" + i + ")/Observations";
                    topicList.push(thisTopic);

                    client.subscribe(thisTopic.topic);
                }
                console.log("subscribe finished");
            });

            client.on("message", function (topic, message) {
                var datastreamNumber = _.findWhere(topicList, {topic: topic}).id;
                console.log(datastreamNumber);
                console.log(message.toString());
            });

            client.on("error", function (err) {
                console.log(err);
                client.end();
            });

            client.on("close", function () {
                console.log("Client disconnected");
                client.end();
            });
        }

    });

    return SensorThingsLayer;
});
