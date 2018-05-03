define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Einwohnerabfrage;

    Einwohnerabfrage = Backbone.Model.extend({
        defaults: {
            drawInteraction: undefined,
            isCollapsed: undefined,
            isCurrentWin: undefined,
            // circle overlay (tooltip) - shows the radius
            circleOverlay: new ol.Overlay({
                offset: [15, 0],
                positioning: "center-left"
            }),
            requests: [],
            data: {},
            receivedData: false,
            requesting: false
        },

        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
            this.listenTo(Radio.channel("WPS"), {
                "response": this.handleResponse
            });

            this.createDomOverlay(this.get("circleOverlay"));
        },
        reset: function () {
            this.setData({});
            this.setDataReceived(false);
            this.setRequesting(false);
        },
        handleResponse: function (requestId, response) {
            if (_.contains(this.get("requests"), requestId)) {
                this.removeId(this.get("requests"), requestId);
                this.setRequesting(false);
                if (response["wps:erroroccured"] === "yes") {
                    console.log(response["wps:ergebnis"]);

                    Radio.trigger("Alert", "alert", response["wps:ergebnis"]);
                }
                else {
                    console.log(response);
                    this.setDataReceived(true);
                    try {
                        response = JSON.parse(response["wps:ergebnis"]);
                        this.setData(response);
                    } catch (error) {
                        Radio.trigger("Alert", "alert", "Konnte WPS Antwort nicht verarbeiten. Antwort: " + JSON.stringify(response));
                    }
                }
            }
            this.trigger("render");
        },
        removeId: function (requests, requestId) {
            var index = requests.indexOf(requestId);
            if (index > -1) {
                requests.splice(index, 1);
            }
        },
        setStatus: function (args) {
            if (args[2].getId() === "einwohnerabfrage" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                this.createDrawInteraction("Box");
            }
            else {
                this.set("isCurrentWin", false);
                this.get("drawInteraction").setActive(false);
                Radio.trigger("Map", "removeOverlay", this.get("circleOverlay"));
            }
        },

        /**
         * creates a draw interaction and adds it to the map.
         * @param {string} value - drawing type (Box | Circle | Polygon)
         */
        createDrawInteraction: function (value) {
            var layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer"),
                drawInteraction = new ol.interaction.Draw({
                    // destination for drawn features
                    source: layer.getSource(),
                    // drawing type
                    type: value === "Box" ? "Circle" : value,
                    // is called when a geometry's coordinates are updated
                    geometryFunction: value === "Box" ? ol.interaction.Draw.createBox() : undefined
                });

            this.toggleOverlay(value, this.get("circleOverlay"));
            this.setDrawInteractionListener(drawInteraction, layer);
            this.set("drawInteraction", drawInteraction);
            Radio.trigger("Map", "addInteraction", drawInteraction);
        },
        /**
         * sets listeners for draw interaction events
         * @param {ol.interaction.Draw} interaction
         * @param {ol.layer.Vector} layer
         */
        setDrawInteractionListener: function (interaction, layer) {
            interaction.on("drawstart", function (evt) {
                layer.getSource().clear();
                if (evt.feature.getGeometry().getType() === "Circle") {
                    this.showOverlayOnSketch(evt.feature.getGeometry(), this.get("circleOverlay"));
                }
            }, this);

            interaction.on("drawend", function (evt) {
                var geoJson = this.featureToGeoJson(evt.feature);
                this.makeRequest(geoJson);
            }, this);

            interaction.on("change:active", function (evt) {
                if (evt.oldValue) {
                    layer.getSource().clear();
                    Radio.trigger("Map", "removeInteraction", evt.target);
                }
            });
        },
        makeRequest: function (geoJson) {
            this.setDataReceived(false);
            this.setRequesting(true);
            this.trigger("render");
            var requestId = _.uniqueId("wps");

            this.get("requests").push(requestId);
            Radio.trigger("WPS", "request", "1001", requestId, "einwohner_ermitteln.fmw", {
                "such_flaeche": geoJson
            });
        },
        prepareData: function (geoJson) {
            var prepared = {};
            prepared.type = geoJson.getType();
            prepared.coordinates = geoJson.geometry;
        },
        /**
         * calculates the circle radius and places the circle overlay on geometry change
         * @param {ol.Geometry} geometry - circle geometry
         * @param {ol.Overlay} circleOverlay
         */
        showOverlayOnSketch: function (geometry, circleOverlay) {
            geometry.on("change", function (evt) {
                var radius = this.roundRadius(evt.target.getRadius());

                circleOverlay.getElement().innerHTML = radius;
                circleOverlay.setPosition(evt.target.getLastCoordinate());
            }, this);
        },

        /**
         * converts a feature to a geojson
         * if the feature geometry is a circle, it is converted to a polygon
         * @param {ol.Feature} feature - drawn feature
         */
        featureToGeoJson: function (feature) {
            var reader = new ol.format.GeoJSON(),
                geometry = feature.getGeometry();

            if (geometry.getType() === "Circle") {
                feature.setGeometry(ol.geom.Polygon.fromCircle(geometry));
            }
            return reader.writeGeometryObject(feature.getGeometry());
        },

        /**
         * adds or removes the circle overlay from the map
         * @param {string} type - geometry type
         * @param {ol.Overlay} circleOverlay
         */
        toggleOverlay: function (type, circleOverlay) {
            if (type === "Circle") {
                Radio.trigger("Map", "addOverlay", circleOverlay);
            }
            else {
                Radio.trigger("Map", "removeOverlay", circleOverlay);
            }
        },

        /**
         * rounds the circle radius
         * @param {number} radius - circle radius
         * @return {string} the rounded radius
         */
        roundRadius: function (radius) {
            if (radius > 500) {
                return (Math.round(radius / 1000 * 100) / 100) + " km";
            }
            return (Math.round(radius * 10) / 10) + " m";
        },

        /**
         * creates a div element for the circle overlay
         * and adds it to the overlay
         * @param {ol.Overlay} circleOverlay
         */
        createDomOverlay: function (circleOverlay) {
            var element = document.createElement("div");

            element.setAttribute("id", "circle-overlay");
            circleOverlay.setElement(element);
        },
        setData: function (value) {
            this.set("data", value);
        },
        setDataReceived: function (value) {
            this.set("dataReceived", value);
        },
        setRequesting: function (value) {
            this.set("requesting", value);
        }
    });

    return Einwohnerabfrage;
});
