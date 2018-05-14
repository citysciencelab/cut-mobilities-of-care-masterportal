define(function (require) {

    var $ = require("jquery"),
        ol = require("openlayers"),
        SnippetDropdownModel = require("modules/snippets/dropdown/model"),
        Moment = require("moment"),
        SnippetCheckboxModel = require("modules/snippets/checkbox/model"),
        Einwohnerabfrage;

    Einwohnerabfrage = Backbone.Model.extend({
        defaults: {
            // checkbox snippet for raster layer
            checkBox: new SnippetCheckboxModel({
                isSelected: false,
                label: "Raster Layer anzeigen"
            }),
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
            requesting: false,
            snippetDropdownModel: {},
            values: {
                "Rechteck": "Box",
                "Kreis": "Circle",
                "Polygon": "Polygon"
            },
            // mrh meta data id
            mrhId: "DC71F8A1-7A8C-488C-AC99-23776FA7775E",
            mrhDate: undefined,
            // fhh meta data id
            fhhId: "D3DDBBA3-7329-475C-BB07-14D539ED6B1E",
            fhhDate: undefined
            // hmdk/metaver link
            // metaDataLink: Radio.request("RestReader", "getServiceById", "2").get("url")
        },

        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
            this.listenTo(Radio.channel("WPS"), {
                "response": this.handleResponse
            });
            this.listenTo(this.snippetDropdownModel, {
                "valuesChanged": this.createDrawInteraction
            });
            this.listenTo(this.getCheckbox(), {
                "valuesChanged": this.toggleRasterLayer
            });
            this.on("change:isCurrentWin", this.handleCswRequests);
            this.createDomOverlay(this.get("circleOverlay"));
            this.setDropDownSnippet(new SnippetDropdownModel({
                name: "Geometrie",
                type: "string",
                displayName: "Geometrie auswählen",
                values: _.allKeys(this.getValues()),
                snippetType: "dropdown",
                isMultiple: false,
                preselectedValues: _.allKeys(this.getValues())[0]
            }));
        },
        /**
         * Reset State when tool becomes active/inactive
         */
        reset: function () {
            this.setData({});
            this.setDataReceived(false);
            this.setRequesting(false);
        },
        /**
         * Called when the wps modules returns a request
         * @param  {string} requestId uniqueId used to identfy if request was sent by this model
         * @param  {string} response the response xml of the wps
         * @param  {} status the HTTPStatusCode
         */
        handleResponse: function (requestId, response, status) {
            this.setRequesting(false);
            if (this.isEinwohnerRequest(this.get("requests"), requestId)) {
                this.removeId(this.get("requests"), requestId);
                if (status === 200) {
                    if (response["wps:erroroccured"] === "yes") {
                        this.handleWPSError(response);
                    }
                    else {
                        this.handleSuccess(response);
                    }
                }
                else {
                    this.resetView();
                }
            }
            this.trigger("renderResult");
        },
        /**
         * Check if this request id is known by this model
         * @param  {[String]} ownRequests contains all ids of requests triggered by this module
         * @param  {} requestId the id returned by the wps
         */
        isEinwohnerRequest: function (ownRequests, requestId) {
            return _.contains(ownRequests, requestId);
        },
        /**
         * Displays Errortext if the WPS returns an Error
         * @param  {String} response received by wps
         */
        handleWPSError: function (response) {
            Radio.trigger("Alert", "alert", JSON.stringify(response["wps:ergebnis"]));
        },
        /**
         * Used when statuscode is 200 and wps did not return an error
         * @param  {String} response received by wps
         */
        handleSuccess: function (response) {
            try {
                response = JSON.parse(response["wps:ergebnis"]);
                this.setData(response);
                this.setDataReceived(true);
            }
            catch (error) {
                Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + JSON.stringify(response));
            }
            finally {
                return;
            }
        },
        /**
         * Used to hide Geometry and Textoverlays if request was unsuccessful for any reason
         */
        resetView: function () {
            var layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer");

            if (layer) {
                layer.getSource().clear();
                Radio.trigger("Map", "removeOverlay", this.get("circleOverlay"));
            }
        },
        /**
         * Removes an ID from an array of ID
         * @param  {} requests All IDs
         * @param  {} requestId Id to remove
         */
        removeId: function (requests, requestId) {
            var index = requests.indexOf(requestId);

            if (index > -1) {
                requests.splice(index, 1);
            }
        },
        /**
         * Handles (de-)activation of this Tool
         * @param  {} args
         */
        setStatus: function (args) {
            if (args[2].getId() === "einwohnerabfrage" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                var selectedValues = this.getDropDownSnippet().getSelectedValues();

                this.createDrawInteraction(selectedValues.values[0] || _.allKeys(this.getValues())[0]);
            }
            else {
                this.setIsCurrentWin(false);
                if (!_.isUndefined(this.getDrawInteraction())) {
                    this.getDrawInteraction().setActive(false);
                }
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
            value = this.getValues()[value];
            var layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer"),
                drawInteraction = new ol.interaction.Draw({
                    // destination for drawn features
                    source: layer.getSource(),
                    // drawing type
                    // a circle with for points is internnaly used as Box, since type "Box" does not exist
                    type: value === "Box" ? "Circle" : value,
                    // is called when a geometry's coordinates are updated
                    geometryFunction: value === "Box" ? ol.interaction.Draw.createBox() : undefined
                });

            this.toggleOverlay(value, this.get("circleOverlay"));
            this.setDrawInteractionListener(drawInteraction, layer);
            this.setDrawInteraction(drawInteraction);
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
        /**
         *
         * @param  {} geoJson
         */
        makeRequest: function (geoJson) {
            this.setDataReceived(false);
            this.setRequesting(true);
            this.trigger("renderResult");
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
        },
        setDropDownSnippet: function (value) {
            this.set("snippetDropdownModel", value);
        },
        getDropDownSnippet: function () {
            return this.get("snippetDropdownModel");
        },
        getValues: function () {
            return this.get("values");
        },
        /**
         * show or hide the raster layer
         * @param {boolean} value
         */
        toggleRasterLayer: function (value) {
            Radio.trigger("ModelList", "setModelAttributesById", "8712", {
                isSelected: value,
                isVisibleInMap: value
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
         * sets the attribute mrhDate
         * @param {xml} response
         */
        setMrhDate: function (response) {
            this.set("mrhDate", this.parseDate(response));
        },

        /**
         * sets the attribute drawInteraction
         * @param {ol.interaction.Draw}
         */
        setDrawInteraction: function (value) {
            this.set("drawInteraction", value);
        },

        /**
         * gets the attribute drawInteraction
         * @return {ol.interaction.Draw}
         */
        getDrawInteraction: function () {
            return this.get("drawInteraction");
        },

        /**
         * sets the attribute isCollapsed
         * @param {boolean} value
         */
        setIsCollapsed: function (value) {
            this.set("isCollapsed", value);
        },

        /**
         * gets the attribute isCollapsed
         * @return {boolean}
         */
        getIsCollapsed: function () {
            return this.get("isCollapsed");
        },

        /**
         * sets the attribute isCurrentWin
         * @param {boolean} value
         */
        setIsCurrentWin: function (value) {
            this.set("isCurrentWin", value);
        },

        /**
         * gets the attribute isCurrentWin
         * @return {boolean}
         */
        getIsCurrentWin: function () {
            return this.get("isCurrentWin");
        },

        /**
         * gets the attribute checkBox
         * @returns {Backbone.Model}
         */
        getCheckbox: function () {
            return this.get("checkBox");
        }
    });

    return Einwohnerabfrage;
});
