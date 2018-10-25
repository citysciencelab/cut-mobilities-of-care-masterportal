import Tool from "../../core/modelList/tool/model";
import SnippetDropdownModel from "../../snippets/dropdown/model";
import SnippetCheckboxModel from "../../snippets/checkbox/model";
import {GeoJSON} from "ol/format.js";
import Overlay from "ol/Overlay.js";
import {Draw} from "ol/interaction.js";
import {createBox} from "ol/interaction/Draw.js";
import {Circle, Polygon} from "ol/geom.js";

const Einwohnerabfrage = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        renderToWindow: true,
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
        circleOverlay: new Overlay({
            offset: [15, 0],
            positioning: "center-left"
        }),
        tooltipOverlay: new Overlay({
            offset: [15, 20],
            positioning: "top-left"
        }),
        requests: [],
        data: {},
        dataReceived: false,
        requesting: false,
        snippetDropdownModel: {},
        values: {
            "Rechteck aufziehen": "Box",
            "Kreis aufziehen": "Circle",
            "Fläche zeichnen": "Polygon"
        },
        currentValue: "",
        // mrh meta data id
        mrhId: "DC71F8A1-7A8C-488C-AC99-23776FA7775E",
        mrhDate: undefined,
        // fhh meta data id
        fhhId: "D3DDBBA3-7329-475C-BB07-14D539ED6B1E",
        fhhDate: undefined,
        tooltipMessage: "Klicken zum Starten und Beenden",
        tooltipMessagePolygon: "Klicken um Stützpunkt hinzuzufügen",
        uniqueIdList: [],
        // hmdk/metaver link
        // metaDataLink: Radio.request("RestReader", "getServiceById", "2").get("url")
        glyphicon: "glyphicon-wrench"
    }),

    initialize: function () {
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": this.setStatus
        });
        this.listenTo(Radio.channel("WPS"), {
            "response": this.handleResponse
        });
        this.listenTo(Radio.channel("CswParser"), {
            "fetchedMetaData": this.fetchedMetaData
        });
        this.listenTo(this.snippetDropdownModel, {
            "valuesChanged": this.createDrawInteraction
        });
        this.listenTo(this.get("checkBoxRaster"), {
            "valuesChanged": this.toggleRasterLayer
        });
        this.listenTo(this.get("checkBoxAddress"), {
            "valuesChanged": this.toggleAlkisAddressLayer
        });
        this.on("change:isActive", this.handleCswRequests, this);
        this.createDomOverlay("circle-overlay", this.get("circleOverlay"));
        this.createDomOverlay("tooltip-overlay", this.get("tooltipOverlay"));
        this.setDropDownSnippet(new SnippetDropdownModel({
            name: "Geometrie",
            type: "string",
            displayName: "Geometrie auswählen",
            values: _.allKeys(this.get("values")),
            snippetType: "dropdown",
            isMultiple: false,
            preselectedValues: _.allKeys(this.get("values"))[0]
        }));
    },
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.get("uniqueIdList"), cswObj.uniqueId)) {
            this.removeUniqueIdFromList(this.get("uniqueIdList"), cswObj.uniqueId);
            this.updateMetaData(cswObj.attr, cswObj.parsedData);
        }
    },
    isOwnMetaRequest: function (uniqueIdList, uniqueId) {
        return _.contains(uniqueIdList, uniqueId);
    },
    removeUniqueIdFromList: function (uniqueIdList, uniqueId) {
        this.setUniqueIdList(_.without(uniqueIdList, uniqueId));
    },
    updateMetaData: function (attr, parsedData) {
        if (attr === "fhhDate") {
            this.setFhhDate(parsedData.date);
        }
        else if (attr === "mrhDate") {
            this.setMrhDate(parsedData.date);
        }
    },
    /**
     * Reset State when tool becomes active/inactive
     * @returns {void}
     */
    reset: function () {
        this.setData({});
        this.setDataReceived(false);
        this.setRequesting(false);
    },
    /**
     * Called when the wps modules returns a request
     * @param  {string} requestId - uniqueId used to identfy if request was sent by this model
     * @param  {string} response - the response xml of the wps
     * @param  {number} status - the HTTPStatusCode
     * @returns {void}
     */
    handleResponse: function (requestId, response, status) {
        var parsedData;

        this.setRequesting(false);
        if (this.isEinwohnerRequest(this.get("requests"), requestId)) {
            parsedData = response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.einwohner;
            this.removeId(this.get("requests"), requestId);
            if (status === 200) {
                if (parsedData.ErrorOccured === "yes") {
                    this.handleWPSError(parsedData);
                }
                else {
                    this.handleSuccess(parsedData);
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
     * @param  {string[]} ownRequests - contains all ids of requests triggered by this module
     * @param  {string} requestId - the id returned by the wps
     * @returns {boolean} true | false
     */
    isEinwohnerRequest: function (ownRequests, requestId) {
        return _.contains(ownRequests, requestId);
    },
    /**
     * Displays Errortext if the WPS returns an Error
     * @param  {String} response received by wps
     * @returns {void}
     */
    handleWPSError: function (response) {
        Radio.trigger("Alert", "alert", JSON.stringify(response.ergebnis));
    },
    /**
     * Used when statuscode is 200 and wps did not return an error
     * @param  {String} response received by wps
     * @returns {void}
     */
    handleSuccess: function (response) {
        var obj;

        try {
            obj = JSON.parse(response.ergebnis);
            this.prepareDataForRendering(obj);
            this.setData(obj);
            this.setDataReceived(true);
        }
        catch (e) {
            Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + JSON.stringify(response));
            this.resetView();
            (console.error || console.warn).call(console, e.stack || e);
        }
    },
    /**
     * Iterates ofer response properties
     * @param  {object} response -
     * @returns {void}
     */
    prepareDataForRendering: function (response) {
        _.each(response, function (value, key, list) {
            var stringVal = "";

            if (!isNaN(value)) {
                if (key === "suchflaeche") {
                    stringVal = this.chooseUnitAndPunctuate(value);
                }
                else {
                    stringVal = Radio.request("Util", "punctuate", value) + this.getFormattedDecimalString(value, 3);
                }
                list[key] = stringVal;
            }
            else {
                list[key] = value;
            }

        }, this);
    },
    /**
     * Chooses unit based on value, calls panctuate and converts to unit and appends unit
     * @param  {number} value -
     * @param  {number} maxDecimals - decimals are cut after maxlength chars
     * @returns {string} unit
     */
    chooseUnitAndPunctuate: function (value, maxDecimals) {
        var decimals = "",
            newValue;

        if (value < 250000) {
            decimals = this.getFormattedDecimalString(value, maxDecimals);
            return Radio.request("Util", "punctuate", value) + decimals + " m²";
        }
        if (value < 10000000) {
            newValue = value / 10000.0;
            decimals = this.getFormattedDecimalString(newValue, maxDecimals);

            return Radio.request("Util", "punctuate", newValue) + decimals + " ha";
        }
        newValue = value / 1000000.0;
        decimals = this.getFormattedDecimalString(newValue, maxDecimals);

        return Radio.request("Util", "punctuate", newValue) + decimals + " km²";
    },
    /**
     * Returns the pecimal part cut aftera  max length of number represented as string
     * adds "," in front of decimals if applicable
     * @param  {string} number input number
     * @param  {num} maxLength decimals are cut after maxlength chars
     * @returns {String} decimals string with leading with ',' is not empty
     */
    getFormattedDecimalString: function (number, maxLength) {
        var decimals = "",
            formattedString = number.toString();

        if (formattedString.indexOf(".") !== -1) {
            decimals = formattedString.split(".")[1];
            if (maxLength > 0 && decimals.length > 0) {
                return "," + decimals.substring(0, maxLength);
            }
        }
        return "";
    },
    /**
     * Used to hide Geometry and Textoverlays if request was unsuccessful for any reason
     * @returns {void}
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
     * @param  {string[]} requests - All IDs
     * @param  {string} requestId - Id to remove
     * @returns {void}
     */
    removeId: function (requests, requestId) {
        var index = requests.indexOf(requestId);

        if (index > -1) {
            requests.splice(index, 1);
        }
    },
    /**
     * Handles (de-)activation of this Tool
     * @param {object} model - tool model
     * @param {boolean} value flag is tool is ctive
     * @returns {void}
     */
    setStatus: function (model, value) {
        var selectedValues;

        if (value) {
            // this.set("isCollapsed", args[1]);
            // this.set("isCurrentWin", args[0]);
            selectedValues = this.get("snippetDropdownModel").getSelectedValues();
            this.createDrawInteraction(selectedValues.values[0] || _.allKeys(this.get("values"))[0]);
        }
        else {
            // this.setIsCurrentWin(false);
            if (!_.isUndefined(this.get("drawInteraction"))) {
                this.get("drawInteraction").setActive(false);
            }
            Radio.trigger("Map", "removeOverlay", this.get("circleOverlay"));
            Radio.trigger("Map", "removeOverlay", this.get("tooltipOverlay"));
        }
    },

    /**
     * runs the csw requests once and removes this callback from the change:isCurrentWin event
     * because both requests only need to be executed once
     * @returns {void}
     */
    handleCswRequests: function () {
        var metaIds = [
            {
                metaId: this.get("fhhId"),
                attr: "fhhDate"
            },
            {
                metaId: this.get("mrhId"),
                attr: "mrhDate"
            }];

        if (this.get("isActive")) {
            _.each(metaIds, function (metaIdObj) {
                var uniqueId = _.uniqueId(),
                    cswObj = {};

                this.get("uniqueIdList").push(uniqueId);
                cswObj.metaId = metaIdObj.metaId;
                cswObj.keyList = ["date"];
                cswObj.uniqueId = uniqueId;
                cswObj.attr = metaIdObj.attr;
                Radio.trigger("CswParser", "getMetaData", cswObj);
            }, this);

            this.off("change:isActive", this.handleCswRequests);
        }
    },

    /**
     * creates a draw interaction and adds it to the map.
     * @param {string} drawType - drawing type (Box | Circle | Polygon)
     * @returns {void}
     */
    createDrawInteraction: function (drawType) {
        var that = this,
            value = this.get("values")[drawType],
            layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer"),
            createBoxFunc = createBox(),
            drawInteraction = new Draw({
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
                    // value === "Circle"
                    return that.snapRadiusToInterval(coordinates, opt_geom);
                }
            });

        this.setCurrentValue(value);
        this.toggleOverlay(value, this.get("circleOverlay"));
        Radio.trigger("Map", "addOverlay", this.get("tooltipOverlay"));

        this.setDrawInteractionListener(drawInteraction, layer);
        this.setDrawInteraction(drawInteraction);
        Radio.trigger("Map", "registerListener", "pointermove", this.showTooltipOverlay.bind(this), this);
        Radio.trigger("Map", "addInteraction", drawInteraction);
    },
    snapRadiusToInterval: function (coordinates, opt_geom) {
        var radius = Math.sqrt(Math.pow(coordinates[1][0] - coordinates[0][0], 2) + Math.pow(coordinates[1][1] - coordinates[0][1], 2)),
            geometry;

        radius = this.precisionRound(radius, -1);
        geometry = opt_geom || new Circle(coordinates[0]);
        geometry.setRadius(radius);

        this.showOverlayOnSketch(radius, coordinates[1]);
        return geometry;
    },
    /**
     * sets listeners for draw interaction events
     * @param {ol.interaction.Draw} interaction -
     * @param {ol.layer.Vector} layer -
     * @returns {void}
     */
    setDrawInteractionListener: function (interaction, layer) {
        var that = this;

        interaction.on("drawstart", function () {
            layer.getSource().clear();
        }, this);

        interaction.on("drawend", function (evt) {
            var geoJson = that.featureToGeoJson(evt.feature);

            that.makeRequest(geoJson);
        }, this);

        interaction.on("change:active", function (evt) {
            if (evt.oldValue) {
                layer.getSource().clear();
                Radio.trigger("Map", "removeInteraction", evt.target);
            }
        });
    },
    /**
     * @param  {object} geoJson -
     * @returns {void}
     */
    makeRequest: function (geoJson) {
        var requestId = _.uniqueId("wps");

        this.setDataReceived(false);
        this.setRequesting(true);
        this.trigger("renderResult");

        this.get("requests").push(requestId);
        Radio.trigger("WPS", "request", "1001", requestId, "einwohner_ermitteln.fmw", {
            "such_flaeche": JSON.stringify(geoJson)
        });
    },
    prepareData: function (geoJson) {
        var prepared = {};

        prepared.type = geoJson.getType();
        prepared.coordinates = geoJson.geometry;
    },
    /**
     * calculates the circle radius and places the circle overlay on geometry change
     * @param {number} radius - circle radius
     * @param {number[]} coords - point coordinate
     * @returns {void}
     */
    showOverlayOnSketch: function (radius, coords) {
        var circleOverlay = this.get("circleOverlay");

        circleOverlay.getElement().innerHTML = this.roundRadius(radius);
        circleOverlay.setPosition(coords);
    },
    showTooltipOverlay: function (evt) {
        var coords = evt.coordinate,
            tooltipOverlay = this.get("tooltipOverlay"),
            currentValue = this.get("currentValue");

        if (currentValue === "Polygon") {
            tooltipOverlay.getElement().innerHTML = this.get("tooltipMessagePolygon");
        }
        else {
            tooltipOverlay.getElement().innerHTML = this.get("tooltipMessage");
        }
        tooltipOverlay.setPosition(coords);
    },

    precisionRound: function (number, precision) {
        var factor = Math.pow(10, precision);

        return Math.round(number * factor) / factor;
    },
    /**
     * converts a feature to a geojson
     * if the feature geometry is a circle, it is converted to a polygon
     * @param {ol.Feature} feature - drawn feature
     * @returns {object} GeoJSON
     */
    featureToGeoJson: function (feature) {
        var reader = new GeoJSON(),
            geometry = feature.getGeometry();

        if (geometry.getType() === "Circle") {
            feature.setGeometry(Polygon.fromCircle(geometry));
        }
        return reader.writeGeometryObject(feature.getGeometry());
    },

    /**
     * adds or removes the circle overlay from the map
     * @param {string} type - geometry type
     * @param {ol.Overlay} overlay - circleOverlay
     * @returns {void}
     */
    toggleOverlay: function (type, overlay) {
        if (type === "Circle") {
            Radio.trigger("Map", "addOverlay", overlay);
        }
        else {
            Radio.trigger("Map", "removeOverlay", overlay);
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
     * @param {string} id -
     * @param {ol.Overlay} overlay - circleOverlay
     * @returns {void}
     */
    createDomOverlay: function (id, overlay) {
        var element = document.createElement("div");

        element.setAttribute("id", id);
        overlay.setElement(element);
    },

    /**
     * show or hide the zensus raster layer
     * @param {boolean} value - true | false
     * @returns {void}
     */
    toggleRasterLayer: function (value) {
        Radio.trigger("ModelList", "setModelAttributesById", "8712", {
            isSelected: value,
            isVisibleInMap: value
        });
    },

    /**
     * show or hide the alkis adressen layer
     * @param {boolean} value - true | false
     * @returns {void}
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

    setFhhDate: function (value) {
        this.set("fhhDate", value);
    },

    setMrhDate: function (value) {
        this.set("mrhDate", value);
    },

    setDrawInteraction: function (value) {
        this.set("drawInteraction", value);
    },

    setIsCollapsed: function (value) {
        this.set("isCollapsed", value);
    },

    setIsCurrentWin: function (value) {
        this.set("isCurrentWin", value);
    },

    setCurrentValue: function (value) {
        this.set("currentValue", value);
    },
    setUniqueIdList: function (value) {
        this.set("uniqueIdList", value);
    }
});

export default Einwohnerabfrage;
