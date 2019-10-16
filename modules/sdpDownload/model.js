import Tool from "../core/modelList/tool/model";
import SnippetDropdownModel from "../snippets/dropdown/model";
import { GeoJSON, WFS } from "ol/format.js";
import Overlay from "ol/Overlay.js";
import { Draw } from "ol/interaction.js";
import { createBox } from "ol/interaction/Draw.js";
import { Circle } from "ol/geom.js";
import { fromCircle } from "ol/geom/Polygon.js";
import * as turf from '@turf/turf'

const SdpDownloadModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        isActive: false,
        renderToSidebar: true,
        renderToWindow: false,
        wmsRasterLayerId: "4707",
        formats: [
            { id: 'NAS', label: 'NAS', isSelected: true, desc: 'Daten im NAS-Format herunterladen' },
            { id: 'DWG_310', label: 'DWG, Lagestatus 310 (kurz)', isSelected: false, desc: 'Daten im DWG-Format herunterladen, Lagestatus: ETRS89, UTM-Projektion' },
            { id: 'DWG_320', label: 'DWG, Lagestatus 320', isSelected: false, desc: 'Daten im DWG-Format herunterladen, Lagestatus: ETRS89, Gauß-Krüger-Projektion' },
            { id: 'JPG', label: 'JPG + JGW, Lagestatus 310 (kurz)', isSelected: false, desc: 'Daten im JPG-Format herunterladen, inkl. JGW-Dateien im Lagestatus: ETRS89, UTM-Projektion' }],
        selectedFormat: "NAS",//is preselected
        compressDataUrl: "https://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/php_lgv/dateien_zippen.php",
        compressedFileUrl: "https://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/php_lgv/datei_herunterladen.php",
        wfsRasterParams: {
            url: "https://geodienste.hamburg.de/HH_WFS_Uebersicht_Kachelbezeichnungen",
            request: "GetFeature",
            service: "WFS",
            version: "1.1.0",
            typename: 'app:lgv_kachel_dk5_1km_utm'
        },
        wfsRaster: {},
        //geometric selection
        drawInteraction: undefined,
        circleOverlay: new Overlay({
            offset: [15, 0],
            positioning: "center-left"
        }),
        tooltipOverlay: new Overlay({
            offset: [15, 20],
            positioning: "top-left"
        }),
        data: {},
        dataReceived: false,
        requesting: false,
        snippetDropdownModel: {},
        geographicValues: {
            "Rechteck aufziehen": "Box",
            "Kreis aufziehen": "Circle",
            "Fläche zeichnen": "Polygon"
        },
        currentValue: "",
        selectedAreaGeoJson: {},
        tooltipMessage: "Klicken zum Starten und Beenden",
        tooltipMessagePolygon: "Klicken um Stützpunkt hinzuzufügen",
        selectedRasterLimit: 9
    }),
    initialize: function () {
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": function (value) {
                this.toggleRasterLayer(true);
                this.setStatus(this.model, true);
                this.loadWfsRaster();
            }
        });
        this.listenTo(this, {
            "change:isActive": this.setStatus
        });
        this.listenTo(Radio.channel("MapView"), {
            // Wird ausgeloest wenn sich Zoomlevel, Center
            // oder Resolution der Karte ändert
            "changedOptions": function (value) {
                this.toggleRasterLayer(true);
            }
        });
        this.listenTo(Radio.channel("ModelList"), {
            //sidebar wird geschlossen, raster nicht mehr anzeigen
            "toggleDefaultTool": function () {
                this.toggleRasterLayer(false);
            }
        });
        //geometric selection
        this.listenTo(this.snippetDropdownModel, {
            "valuesChanged": function () {
                this.createDrawInteraction();
            }
        });
        this.createDomOverlay("circle-overlay", this.get("circleOverlay"));
        this.createDomOverlay("tooltip-overlay", this.get("tooltipOverlay"));
        this.setDropDownSnippet(new SnippetDropdownModel({
            name: "Geometrie",
            type: "string",
            displayName: "Geometrie auswählen",
            values: _.allKeys(this.get("geographicValues")),
            snippetType: "dropdown",
            isMultiple: false,
            preselectedValues: _.allKeys(this.get("geographicValues"))[0]
        }));
    },
    //raster layer
    toggleRasterLayer: function (value) {
        var layerId = this.get("wmsRasterLayerId");
        this.addModelsByAttributesToModelList(layerId);
        this.setModelAttributesByIdToModelList(layerId, value);
    },
    addModelsByAttributesToModelList: function (layerId) {
        if (_.isEmpty(Radio.request("ModelList", "getModelsByAttributes", { id: layerId }))) {
            Radio.trigger("ModelList", "addModelsByAttributes", { id: layerId });
        }
    },
    setModelAttributesByIdToModelList: function (layerId, value) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: value,
            isVisibleInMap: value
        });
    },
    setIsSelected: function (value) {
        this.set("isSelected", value);
    },
    //wfs raster data
    loadWfsRaster: function () {
        var params = this.get('wfsRasterParams');
        var data = "service=" + params.service + "&version=" + params.version + "&request=" + params.request + "&TypeName=" + params.typename;
        $.ajax({
            url: Radio.request("Util", "getProxyURL", params.url),
            data: encodeURI(data),
            contentType: "text/xml",
            type: "GET",
            context: this,
            cache: false,
            dataType: "xml",
            success: function (resp) {
                this.readFeatures(resp);
            },
            error: function (jqXHR, errorText, error) {
                Radio.trigger("Alert", "alert", error);
            }
        });
    },

    readFeatures: function (data) {
        var format = new WFS();
        var features = format.readFeatures(data);
        this.setWfsRaster(features);

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
            feature.setGeometry(fromCircle(geometry));
        }
        return reader.writeGeometryObject(feature.getGeometry());
    },

    getSelectedRasterNames: function () {
        var rasterLayerFeatures = this.get('wfsRaster');
        var selectedAreaGeoJson = this.get('selectedAreaGeoJson');
        var rasterNames = [];
        var turfGeoSelection = turf.polygon([selectedAreaGeoJson.coordinates[0]]);

        for (var j = 0, size = rasterLayerFeatures.length; j < size; j++) {
            var turfRaster = turf.polygon([this.featureToGeoJson(rasterLayerFeatures[j]).coordinates[0]]);
            var turfGeoSelection = turf.polygon([selectedAreaGeoJson.coordinates[0]]);
            if (turf.intersect(turfGeoSelection, turfRaster)) {
                var intersectedRasterName = rasterLayerFeatures[j].getProperties()['kachel'];
                var result = rasterNames.find(rasterName => rasterName === intersectedRasterName);
                if (result === undefined) {
                    rasterNames.push(intersectedRasterName);
                }
            }
        }
        return rasterNames;
    },
    //download raster data
    requestCompressedData: function () {
        this.setRequesting(true);
        this.trigger("render");
        var url = this.get('compressDataUrl');
        var selectedRasterNames = this.getSelectedRasterNames();
        if (selectedRasterNames.length > this.get('selectedRasterLimit')) {
            Radio.trigger("Alert", "alert", {
                text: "Die von Ihnen getroffene Auswahl beinhaltet " + selectedRasterNames.length + " Kacheln.\nSie dürfen maximal " + this.get('selectedRasterLimit') + " Kacheln aufeinmal herunterladen.\n\nBitte reduzieren Sie Ihre Auswahl!",
                kategorie: "alert-warning"
            });
            this.setRequesting(false);
            this.trigger("render");
        }
        else {
            var adaptedNames = [];
            selectedRasterNames.forEach(rasterName => {
                var adaptedName = rasterName.substring(0, 2) + '0' + rasterName.substring(2, 4) + '0';
                adaptedNames.push(adaptedName);
            });
            //params have to look like: "kacheln=650330§650340&type=JPG"
            var params = 'kacheln=' + adaptedNames.join('§') + '&type=' + this.get('selectedFormat');
            this.doRequest(params);
        }
    },
    //download data of islands
    requestCompressIslandData: function (islandName) {
        var url = this.get('compressDataUrl');
        //params have to look like: "insel=Neuwerk&type=JPG"
        var params = 'insel=' + islandName + '&type=' + this.get('selectedFormat');
        this.doRequest(params);
    },
    //download overview
    requestCompressRasterOverviewData: function (state) {
        //todo Datei nicht mehr lokal ablegen
        var temp = "C:\\sandbox\\BG-74\\U__Kachel_Uebersichten_UTM_Kachel_1KM_" + state + ".dwg";
        window.location.href= this.get('compressedFileUrl') +'?no_delete=1&mt=dwg&name=' + temp;
        
    },
    doRequest: function (params) {
        var url = this.get('compressDataUrl');
        $.ajax({
            url: Radio.request("Util", "getProxyURL", url),
            data: encodeURI(params),
            context: this,
            async: false,
            type: "POST",
            success: function (resp) {
                this.resetView();
                this.setStatus(this.model, true);
                this.setRequesting(false);
                this.trigger("render");
                 //download zip-file
                 window.location.href = this.get('compressedFileUrl') + '?name=' + resp;
            },
            timeout: 6000,
            error: function () {
                this.resetView();
                this.setStatus(this.model, true);
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Das Herunterladen der Daten ist leider schief gelaufen!</strong> <br> <small>Details: Ein benötigter Dienst antwortet nicht.</small>",
                    kategorie: "alert-warning"
                });
                this.setRequesting(false);
                this.trigger("render");
            }
        });
    },
    //geometric selection
    /**
    * Handles (de-)activation of this Tool
    * @param {object} model - tool model
    * @param {boolean} value flag is tool is ctive
    * @fires Core#RadioTriggerMapRemoveOverlay
    * @returns {void}
    */
    setStatus: function (model, value) {
        var selectedValues;

        if (value) {
            selectedValues = this.get("snippetDropdownModel").getSelectedValues();
            this.createDrawInteraction(selectedValues.values[0] || _.allKeys(this.get("geographicValues"))[0]);
        }
        else {
            if (!_.isUndefined(this.get("drawInteraction"))) {
                this.get("drawInteraction").setActive(false);
            }
            Radio.trigger("Map", "removeOverlay", this.get("circleOverlay"));
            Radio.trigger("Map", "removeOverlay", this.get("tooltipOverlay"));
        }
    },

    resetGeographicSelection: function () {
        this.get("snippetDropdownModel").updateSelectedValues(_.allKeys(this.get("geographicValues"))[0]);
    },

    /**
     * creates a draw interaction and adds it to the map.
     * @param {string} drawType - drawing type (Box | Circle | Polygon)
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRegisterListener
     * @fires Core#RadioTriggerMapAddInteraction
     * @returns {void}
     */
    createDrawInteraction: function (drawType) {
        this.resetView();
        var that = this,
            value = this.get("geographicValues")[drawType],
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
    /**
     * todo
     * @param {*} coordinates todo
     * @param {*} opt_geom todo
     * @returns {*} todo
     */
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
     * @param {ol.interaction.Draw} interaction - todo
     * @param {ol.layer.Vector} layer - todo
     * @returns {void}
     */
    setDrawInteractionListener: function (interaction, layer) {
        var that = this;

        interaction.on("drawstart", function () {
            layer.getSource().clear();
        }, this);

        interaction.on("drawend", function (evt) {
            var geoJson = that.featureToGeoJson(evt.feature);
            console.log('drawend evt.feature=', evt.feature);
            console.log('drawend geoJson=', geoJson);
            that.setSelectedAreaGeoJson(geoJson);
        }, this);

        interaction.on("change:active", function (evt) {
            if (evt.oldValue) {
                layer.getSource().clear();
                Radio.trigger("Map", "removeInteraction", evt.target);
            }
        });
    },

    /**
     * Used to hide Geometry and Textoverlays if request was unsuccessful for any reason
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @returns {void}
     */
    resetView: function () {
        var layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer");
        if (layer) {
            layer.getSource().clear();
            Radio.trigger("Map", "removeOverlay", this.get("circleOverlay"));
        }
        this.setStatus(this.model, false);
    },

    /**
     * Chooses unit based on value, calls panctuate and converts to unit and appends unit
     * @param  {number} value -
     * @param  {number} maxDecimals - decimals are cut after maxlength chars
     * @fires Core#RadioRequestUtilPunctuate
     * @returns {string} unit
     */
    chooseUnitAndPunctuate: function (value, maxDecimals) {
        var newValue;

        if (value < 250000) {
            return Radio.request("Util", "punctuate", value.toFixed(maxDecimals)) + " m²";
        }
        if (value < 10000000) {
            newValue = value / 10000.0;

            return Radio.request("Util", "punctuate", newValue.toFixed(maxDecimals)) + " ha";
        }
        newValue = value / 1000000.0;

        return Radio.request("Util", "punctuate", newValue.toFixed(maxDecimals)) + " km²";
    },



    /**
     * Iterates ofer response properties
     * @param  {object} response - todo
     * @fires Core#RadioRequestUtilPunctuate
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
                    stringVal = Radio.request("Util", "punctuate", value);
                }
                list[key] = stringVal;
            }
            else {
                list[key] = value;
            }

        }, this);
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

    /**
     * todo
     * @param {*} evt todo
     * @returns {void}
     */
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

    /**
     * todo
     * @param {Number} number todo
     * @param {*} precision todo
     * @returns {Number} todo
     */
    precisionRound: function (number, precision) {
        var factor = Math.pow(10, precision);

        return Math.round(number * factor) / factor;
    },


    /**
     * adds or removes the circle overlay from the map
     * @param {string} type - geometry type
     * @param {ol.Overlay} overlay - circleOverlay
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRemoveOverlay
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
     * checks if snippetCheckboxLayer is loaded and toggles the button accordingly
     * @param {String} layerId - id of the addressLayer
     * @param {SnippetCheckboxModel} snippetCheckboxModel - snbippet checkbox model for a layer
     * @fires Core#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    checksSnippetCheckboxLayerIsLoaded: function (layerId, snippetCheckboxModel) {
        var model = Radio.request("ModelList", "getModelByAttributes", { id: layerId }),
            isVisibleInMap = !_.isUndefined(model) ? model.get("isVisibleInMap") : false;

        if (isVisibleInMap) {
            snippetCheckboxModel.setIsSelected(true);
        }
        else {
            snippetCheckboxModel.setIsSelected(false);
        }
    },
    /**
     * Sets the currentValue
     * @param {*} value todo
     * @returns {void}
     */
    setCurrentValue: function (value) {
        this.set("currentValue", value);
    },
    /**
     * Sets the snippetDropdownModel
     * @param {*} value todo
     * @returns {void}
     */
    setDropDownSnippet: function (value) {
        this.set("snippetDropdownModel", value);
    },
    /**
     * Sets the drawInteraction
     * @param {*} value todo
     * @returns {void}
     */
    setDrawInteraction: function (value) {
        this.set("drawInteraction", value);
    },
    /**
     * Sets the dataReceived
     * @param {*} value todo
     * @returns {void}
     */
    setDataReceived: function (value) {
        this.set("dataReceived", value);
    },
    /**
     * Sets the data
     * @param {*} value todo
     * @returns {void}
     */
    setData: function (value) {
        this.set("data", value);
    },
    /**
     * Sets the requesting
     * @param {*} value todo
     * @returns {void}
     */
    setRequesting: function (value) {
        console.log('requesting:',value);
        this.set("requesting", value);
    },
    /**
     * Sets the selected format
     * @param {*} value todo
     * @returns {void}
     */
    setSelectedFormat: function (value) {
        this.set("selectedFormat", value);
    },
    /**
     * Sets the WFSRaster
     * @param {*} value todo
     * @returns {void}
     */
    setWfsRaster: function (value) {
        this.set("wfsRaster", value);
    },
    /**
     * Sets the selectedAreaGeoJson
     * @param {*} value todo
     * @returns {void}
     */
    setSelectedAreaGeoJson: function (value) {
        this.set("selectedAreaGeoJson", value);
    },
    /**
     * Sets the loaderPath
     * @param {String} value path to the loader gif
     * @returns {void}
     */
    setLoaderPath: function (value) {
        this.set("loaderPath", value);
    }

});

export default SdpDownloadModel;