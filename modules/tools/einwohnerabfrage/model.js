define(function (require) {

    var $ = require("jquery"),
        ol = require("openlayers"),
        Moment = require("moment"),
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
            // mrh meta data id
            mrhId: "DC71F8A1-7A8C-488C-AC99-23776FA7775E",
            // fhh meta data id
            fhhId: "D3DDBBA3-7329-475C-BB07-14D539ED6B1E"
            // hmdk/metaver link
            // metaDataLink: Radio.request("RestReader", "getServiceById", "2").get("url")
        },

        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
            this.on("change:isCurrentWin", this.handleCswRequests);
            this.createDomOverlay(this.get("circleOverlay"));
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
         * runs the csw requests once and removes this callback from the change:isCurrentWin event
         * because both requests only need to be executed once
         * @param {boolean} value - is tool active
         */
        handleCswRequests: function (value) {
            if (value) {
                var cswUrl = Radio.request("RestReader", "getServiceById", "1").get("url");

                this.sendRequest(cswUrl, {id: this.get("fhhId")}, this.setFhhDate);
                this.sendRequest(cswUrl, {id: this.get("mrhId")}, this.setMrhDate);
                this.off("change:isCurrentWin", this.handleCswRequests);
            }
        },

        /**
         * runs an async http ajax get request
         * @param {string} url - the url for the request
         * @param {object} data - data to be sent
         * @param {function} callback - success function
         */
        sendRequest: function (url, data, callback) {
            $.ajax({
                url: Radio.request("Util", "getProxyURL", url),
                data: data,
                context: this,
                success: callback,
                error: function () {
                    Radio.trigger("Alert", "alert", "CSW Request Fehlgeschlagen");
                }
            });
        },

        /**
         * sets the attribute fhhDate
         * @param {xml} response
         */
        setFhhDate: function (response) {
            this.set("fhhDate", this.parseDate(response));
        },

        /**
         * ets the attribute mrhDate
         * @param {xml} response
         */
        setMrhDate: function (response) {
            this.set("mrhDate", this.parseDate(response));
        },

        /**
         * parse and returns the date of the GetRecordById response
         * @param {xml} response
         * @return {string} date
         */
        parseDate: function (response) {
             var citation = $("gmd\\:citation,citation", response),
                dates = $("gmd\\:CI_Date,CI_Date", citation),
                datetype, dateTime;

            dates.each(function (index, element) {
                datetype = $("gmd\\:CI_DateTypeCode,CI_DateTypeCode", element);
                if ($(datetype).attr("codeListValue") === "revision") {
                    dateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                }
                else if ($(datetype).attr("codeListValue") === "publication") {
                    dateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                }
                else {
                    dateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                }
            });
            return Moment(dateTime).format("DD.MM.YYYY");
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
                this.featureToGeoJson(evt.feature);
            }, this);

            interaction.on("change:active", function (evt) {
                if (evt.oldValue) {
                    layer.getSource().clear();
                    Radio.trigger("Map", "removeInteraction", evt.target);
                }
            });
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
                geometry = feature.getGeometry(),
                geoJsonFeature;

            if (geometry.getType() === "Circle") {
                feature.setGeometry(ol.geom.Polygon.fromCircle(geometry));
            }
            geoJsonFeature = reader.writeFeatureObject(feature);
            // trigger geoJsonFeature
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
        }
    });

    return Einwohnerabfrage;
});
