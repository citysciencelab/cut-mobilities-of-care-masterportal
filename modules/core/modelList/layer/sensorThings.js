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
            this.getMQTT();

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
                point = this.drawByType(point);
                points.push(point);

            }, this);

            // Add features to vectorlayer
            this.getLayerSource().addFeatures(points);
        },

        /**
         * draw feature by given scaling- and shape-type
         * @param  {ol.Feature} feature which to draw
         * @return {ol.Feature} feature
         */
        drawByType: function (feature) {
            var scalingObject,
                svgPath;

            // check scaling
            if (this.get("scaling") === "nominal") {
                scalingObject = this.fillScalingAttributes(feature);
            }
            else if (this.get("scaling") === "interval") {
                scalingObject = this.convertScaling(feature);
            }

            // check shape
            if (this.get("scalingShape") === "circle") {
                svgPath = this.createNominalCircleSegments(scalingObject);
                this.drawSvgAndIcon(feature, svgPath);
            }
            else if (this.get("scalingShape") === "line") {
                svgPath = this.createIntervalLine(scalingObject);
                this.drawSvg(feature, svgPath);
            }

            return feature;
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
         * convert Scaling with given factor
         * @param  {ol.Feature} feature
         * @return {String} state with converted value
         */
        convertScaling: function (feature) {
            var state = feature.get("state");

            if (!_.isUndefined(this.get("conversionFactor"))) {
                state = state * this.get("conversionFactor");
                feature.set("state", state);
            }
            if (!_.isUndefined(this.get("scalingUnit"))) {
                feature.set("state", state + " " + this.get("scalingUnit"));
            }

            return state;
        },

        /**
         * create a svg line by interval scaling
         * @param  {object} scalingObject - contains state and value
         * @return {String} svg with colored line
         */
        createIntervalLine: function (scalingObject) {
            var size = 200,
                circleRadius = 6,
                lineStroke = 5,
                scalingFactor = 1,
                scalingUnit = "",
                scalingDecimal = 2,
                fontSize = 0,
                fontFamily = "Verdana",
                fontColor = "#000000",
                scalingColorPositiv = "#ff0000",
                scalingColorNegativ = "#0000ff",
                color,
                svg;

            if (!_.isUndefined(this.get("circleRadius"))) {
                circleRadius = this.get("circleRadius");
            }
            if (!_.isUndefined(this.get("lineStroke"))) {
                lineStroke = this.get("lineStroke");
            }
            if (!_.isUndefined(this.get("scalingFactor"))) {
                scalingFactor = this.get("scalingFactor");
            }
            if (!_.isUndefined(this.get("scalingUnit"))) {
                scalingUnit = this.get("scalingUnit");
            }
            if (!_.isUndefined(this.get("scalingDecimal"))) {
                scalingDecimal = this.get("scalingDecimal");
            }
            if (!_.isUndefined(this.get("fontSize"))) {
                fontSize = this.get("fontSize");
                size = size * scalingDecimal;
            }
            if (!_.isUndefined(this.get("fontFamily"))) {
                fontFamily = this.get("fontFamily");
            }
            if (!_.isUndefined(this.get("fontColor"))) {
                fontColor = this.get("fontColor");
            }
            if (!_.isUndefined(this.get("scalingColorPositiv"))) {
                scalingColorPositiv = this.get("scalingColorPositiv");
            }
            if (!_.isUndefined(this.get("scalingColorNegativ"))) {
                scalingColorNegativ = this.get("scalingColorNegativ");
            }

            // set color
            if (scalingObject >= 0) {
                color = scalingColorPositiv;
            }
            else if (scalingObject < 0) {
                color = scalingColorNegativ;
            }

            // calculate size
            if (((scalingObject * scalingFactor) + lineStroke) >= size) {
                size = size + ((scalingObject * scalingFactor) + lineStroke);
            }

            svg = "<svg width='" + size + "' height='" + size + "' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>";
            svg = svg + "<line x1='" + (size / 2) + "' y1='" + (size / 2) + "' x2='" + (size / 2) + "' y2='" + (size / 2 - circleRadius - scalingObject * scalingFactor) + "' stroke='" + color + "' stroke-width='" + lineStroke + "' />";
            svg = svg + "<circle cx='" + (size / 2) + "' cy='" + (size / 2) + "' r='" + circleRadius + "' fill='" + color + "' />";
            svg = svg + "<text fill='" + fontColor + "' font-family='" + fontFamily + "' font-size='" + fontSize + "' x='" + (size / 2 + circleRadius + 5) + "' y='" + (size / 2 + 6) + "'>" + scalingObject.toFixed(scalingDecimal) + scalingUnit + "</text>";
            svg = svg + "</svg>";

            return svg;
        },

        /**
         * create a svg with colored circle segments by nominal scaling
         * @param  {object} scalingObject - contains state and value
         * @return {String} svg with colored circle segments
         */
        createNominalCircleSegments: function (scalingObject) {
            var size = 10,
                circleRadius = 23,
                circleStrokeWidth = 4,
                circleBackgroundColor = "#ffffff",
                n = _.reduce(_.values(scalingObject), function (memo, num) {
                        return memo + num;
                    }, 0),
                degreeSegment = 360 / n,
                startAngelDegree = 0,
                endAngelDegree = degreeSegment,
                svg;

            if (!_.isUndefined(this.get("circleRadius"))) {
                circleRadius = this.get("circleRadius");
            }
            if (!_.isUndefined(this.get("circleStrokeWidth"))) {
                circleStrokeWidth = this.get("circleStrokeWidth");
            }
            if (!_.isUndefined(this.get("circleBackgroundColor"))) {
                circleBackgroundColor = this.get("circleBackgroundColor");
            }

            // calculate size
            if (((circleRadius + circleStrokeWidth) * 2) >= size) {
                size = size + ((circleRadius + circleStrokeWidth) * 2);
            }

            // create svg
            svg = "<svg width='" + size + "' height='" + size + "' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
            svg = svg + "<circle cx='" + (size / 2) + "' cy='" + (size / 2) + "' r='" + circleRadius + "' stroke='" + circleBackgroundColor + "' stroke-width='" + circleStrokeWidth + "' fill='none'/>";

            _.each(scalingObject, function (value, key) {
                if (value) {
                    var strokeColor = this.get("scalingAttributes")[key];

                    for (var i = 0; i < value; i++) {
                        var d = this.calculateCircleSegment(startAngelDegree, endAngelDegree, circleRadius, size);

                        svg = this.extendsSVG(svg, circleStrokeWidth, strokeColor, d);

                        // set degree for next circular segment
                        startAngelDegree = startAngelDegree + degreeSegment;
                        endAngelDegree = endAngelDegree + degreeSegment;
                    };
                }
            }, this);

            svg = svg + "</svg>";

            return svg;
        },

        /**
         * create circle segments
         * @param  {number} startAngelDegree - start with circle segment
         * @param  {number} endAngelDegree - finish with circle segment
         * @param  {number} circleRadius
         * @param  {number} size - size of the window to be draw
         * @return {String} all circle segments
         */
        calculateCircleSegment: function (startAngelDegree, endAngelDegree, circleRadius, size) {
            var rad = Math.PI / 180,
                xy = size / 2;

            // convert angle from degree to radiant
            startAngleRad = startAngelDegree * rad;
            endAngleRad = (endAngelDegree - 10) * rad;

            xStart = xy + (Math.cos(startAngleRad) * circleRadius);
            yStart = xy - (Math.sin(startAngleRad) * circleRadius);

            xEnd = xy + (Math.cos(endAngleRad) * circleRadius);
            yEnd = xy - (Math.sin(endAngleRad) * circleRadius);

            var d = [
                'M', xStart, yStart,
                'A', circleRadius, circleRadius, 0, 0, 0, xEnd, yEnd
            ].join(' ');

            return d;
        },

        /**
         * extends the svg with given tags
         * @param  {String} svg - String with svg tags
         * @param  {number} circleStrokeWidth
         * @param  {String} strokeColor
         * @param  {String} d - circle segment
         * @return {String} extended svg
         */
        extendsSVG: function (svg, circleStrokeWidth, strokeColor, d) {
            svg = svg + "<path ";
            svg = svg + "fill='none' ";
            svg = svg + "stroke-width='" + circleStrokeWidth + "' ";
            svg = svg + "stroke='" + strokeColor + "' ";
            svg = svg + "d='" + d + "'/>";

            return svg;
        },

        /**
         * draw svg and and icon
         * @param  {ol.Feature} point
         * @param  {String} svgPath
         */
        drawSvgAndIcon: function (point, svgPath) {
            styleSVG = new ol.style.Style({
                image: new ol.style.Icon({
                    src: "data:image/svg+xml;utf8," + svgPath
                })
            });

            // add both styles (png, svg)
            styleIcon = this.getStyleAsFunction(this.get("style"));
            point.setStyle([styleIcon(point)[0], styleSVG]);
        },

        /**
         * draw Svg
         * @param  {ol.Feature} point
         * @param  {String} svgPath
         */
        drawSvg: function (point, svgPath) {
            styleSVG = new ol.style.Style({
                image: new ol.style.Icon({
                    src: "data:image/svg+xml;utf8," + svgPath
                })
            });

            point.setStyle(styleSVG);
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

                // change time zone
                thisPhenomTime = this.changeTimeZone(thisPhenomTime);

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

                thisFeature = this.drawByType(thisFeature);
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
            var client = mqtt.connect({ host: "localhost", port: 1234 });
            // var client = mqtt.connect({ host: "http://51.5.242.162", port: 1883 });
            // var client = mqtt.connect({ host: location.hostname, port: parseInt(location.port) });

            client.subscribe("presence");
            // client.subscribe("v1.0/Datastreams(2)/Observations");

            client.on("message", function (topic, payload) {
              console.log([topic, payload].join(": "));
              client.end();
            });

            client.publish("presence", "hello world!");
        }

    //     getMQTT: function () {
    //         var options = {
    //                 port: 1883,
    //                 // port: 8883,
    //                 // port: 9001,
    //                 keepalive: 60,
    //                 encoding: "utf8",
    //                 protocol: "mqtt"
    //                 // protocol: "mqtts"
    //             },
    //             vartopicList = [],

    //             client = mqtt.connect("http://51.5.242.162", options);
    //             // client = mqtt.connect("https://51.5.242.162", options);
    //             client = mqtt.connect("ws://localhost:9001/websocket", options);

    //         // subscribe
    //         client.on("connect", function () {
    //             console.log("mqtt is connected");
    //             for (var i = 2; i <= 758; i++) {
    //                 var thisTopic = {};

    //                 thisTopic.id = i;
    //                 thisTopic.topic = "v1.0/Datastreams(" + i + ")/Observations";
    //                 topicList.push(thisTopic);

    //                 client.subscribe(thisTopic.topic);
    //             }
    //             console.log("subscribe finished");
    //         });

    //         client.on("message", function (topic, message) {
    //             var datastreamNumber = _.findWhere(topicList, {topic: topic}).id;

    //             console.log(datastreamNumber);
    //             console.log(message.toString());
    //         });

    //         client.on("error", function (err) {
    //             console.log(err);
    //             client.end();
    //         });

    //         client.on("close", function () {
    //             console.log("Client disconnected");
    //             client.end();
    //         });
    //     }

    // });
    });

    return SensorThingsLayer;
});
