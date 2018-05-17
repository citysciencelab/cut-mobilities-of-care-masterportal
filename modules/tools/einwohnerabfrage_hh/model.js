define(function (require) {

    var $ = require("jquery"),
        ol = require("openlayers"),
        SnippetDropdownModel = require("modules/snippets/dropdown/model"),
        Moment = require("moment"),
        SnippetCheckboxModel = require("modules/snippets/checkbox/model"),
        Einwohnerabfrage;

    Einwohnerabfrage = Backbone.Model.extend({
        defaults: {
            // checkbox snippet for alkis adressen layer
            checkBoxAddress: new SnippetCheckboxModel({
                isSelected: false,
                label: "ALKIS Adressen anzeigen (ab 1: 20000 bis 1: 2500)"
            }),
            // checkbox snippet for zensus raster layer
            checkBoxRaster: new SnippetCheckboxModel({
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
            this.listenTo(this.getCheckboxRaster(), {
                "valuesChanged": this.toggleRasterLayer
            });
            this.listenTo(this.getCheckboxAddress(), {
                "valuesChanged": this.toggleAlkisAddressLayer
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
                this.prepareDataForRendering(response);
                this.setData(response);
                this.setDataReceived(true);
            }
            catch (e) {
                Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + JSON.stringify(response));
                this.resetView();
                (console.error || console.log).call(console, e.stack || e);
            }
        },
        /**
         * Iterates ofer response properties
         * @param  {} response
         */
        prepareDataForRendering: function (response) {
            _.each(response, function (value, key, list) {
                var stringVal = "";

                if (!isNaN(value)) {
                    if (key === "suchflaeche") {
                        stringVal = this.chooseUnitAndPunctuate(value);
                    }
                    else {
                        stringVal = this.punctuate(value) + this.getFormattedDecimalString(value, 3);
                    }
                    value = stringVal;
                }

                list[key] = value;
            }, this);
        },
        /**
         * Chooses unit based on value, calls panctuate and converts to unit and appends unit
         * @param  {number} value
         * @param  {number} maxLength decimals are cut after maxlength chars
         */
        chooseUnitAndPunctuate: function (value, maxDecimals) {
            var decimals = "";

            if (value < 250000) {
                decimals = this.getFormattedDecimalString(value, maxDecimals);
                return this.punctuate(value) + decimals + " m²";
            }
            if (value < 10000000) {
                value = value / 10000.0;
                decimals = this.getFormattedDecimalString(value, maxDecimals);

                return this.punctuate(value) + decimals + " ha";
            }
            value = value / 1000000.0;
            decimals = this.getFormattedDecimalString(value, maxDecimals);

            return this.punctuate(value) + decimals + " km²";
        },
        /**
         * converts value to String and rewrites punctuation rules. The 1000 separator is "." and the decimal separator is a ","
         * @param  {[type]} value - feature attribute values
         */
        punctuate: function (value) {
            var pattern = /(-?\d+)(\d{3})/,
                stringValue = value.toString(),
                predecimals = stringValue;

            if (stringValue.indexOf(".") !== -1) {
                predecimals = stringValue.split(".")[0];
            }
            while (pattern.test(predecimals)) {
                predecimals = predecimals.replace(pattern, "$1.$2");
            }
            return predecimals;
        },
        /**
         * Returns the pecimal part cut aftera  max length of number represented as string
         * adds "," in front of decimals if applicable
         * @param  {string} number input number
         * @param  {num} maxLength decimals are cut after maxlength chars
         * @return {String} decimals string with leading with ',' is not empty
         */
        getFormattedDecimalString: function (number, maxLength) {
            var decimals = "";

            number = number.toString();
            if (number.indexOf(".") !== -1) {
                decimals = number.split(".")[1];
                if (maxLength > 0 && decimals.length > 0) {
                    return "," + decimals.substring(0, maxLength);
                }
            }
            return "";
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
            var selectedValues;

            if (args[2].getId() === "einwohnerabfrage" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                selectedValues = this.getDropDownSnippet().getSelectedValues();
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
        createDrawInteraction: function (drawType) {
            var that = this,
                value = this.getValues()[drawType],
                layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer"),
                createBoxFunc = ol.interaction.Draw.createBox(),
                drawInteraction = new ol.interaction.Draw({
                    // destination for drawn features
                    source: layer.getSource(),
                    // drawing type
                    // a circle with four points is internnaly used as Box, since type "Box" does not exist
                    type: value === "Box" ? "Circle" : value,
                    // is called when a geometry's coordinates are updated
                    geometryFunction: value === "Polygon" ? undefined : function (coordinates, opt_geom) {
                        if (value === "Box") {
                            return createBoxFunc(coordinates, opt_geom);
                        }
                        else if (value === "Circle") {
                            return that.snapRadiusToInterval(coordinates, opt_geom);
                        }
                    }
                });

            this.toggleOverlay(value, this.get("circleOverlay"));
            this.setDrawInteractionListener(drawInteraction, layer);
            this.setDrawInteraction(drawInteraction);
            Radio.trigger("Map", "addInteraction", drawInteraction);
        },
        snapRadiusToInterval: function (coordinates, opt_geom) {
            var radius = Math.sqrt(Math.pow(coordinates[1][0] - coordinates[0][0], 2) + Math.pow(coordinates[1][1] - coordinates[0][1], 2)),
                geometry;

            radius = this.precisionRound(radius, -1);
            geometry = opt_geom || new ol.geom.Circle(coordinates[0]);
            geometry.setRadius(radius);

            this.showOverlayOnSketch(radius, coordinates[1]);
            return geometry;
        },
        /**
         * sets listeners for draw interaction events
         * @param {ol.interaction.Draw} interaction
         * @param {ol.layer.Vector} layer
         */
        setDrawInteractionListener: function (interaction, layer) {
            interaction.on("drawstart", function (evt) {
                layer.getSource().clear();
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
            var requestId = _.uniqueId("wps");
            this.setDataReceived(false);
            this.setRequesting(true);
            this.trigger("renderResult");

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
        showOverlayOnSketch: function (radius, coords) {
            var radius = this.roundRadius(radius),
                circleOverlay = this.get("circleOverlay");

            circleOverlay.getElement().innerHTML = radius;
            circleOverlay.setPosition(coords);
        },

        precisionRound: function (number, precision) {
            var factor = Math.pow(10, precision);

            return Math.round(number * factor) / factor;
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

        /**
         * show or hide the zensus raster layer
         * @param {boolean} value
         */
        toggleRasterLayer: function (value) {
            Radio.trigger("ModelList", "setModelAttributesById", "8712", {
                isSelected: value,
                isVisibleInMap: value
            });
        },

        /**
         * show or hide the alkis adressen layer
         * @param {boolean} value
         */
        toggleAlkisAddressLayer: function (value) {
            Radio.trigger("ModelList", "setModelAttributesById", "441", {
                isSelected: value,
                isVisibleInMap: value
            });
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
        getCheckboxRaster: function () {
            return this.get("checkBoxRaster");
        },

        /**
         * gets the attribute checkBox
         * @returns {Backbone.Model}
         */
        getCheckboxAddress: function () {
            return this.get("checkBoxAddress");
        }
    });

    return Einwohnerabfrage;
});