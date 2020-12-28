import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {Draw} from "ol/interaction.js";
import {Polygon, LineString, Point, MultiPoint} from "ol/geom.js";
import Tool from "../../core/modelList/tool/model";
import * as Proj from "ol/proj.js";
import Feature from "ol/Feature.js";
import SnippetDropdownModel from "../../snippets/dropdown/model";
import {getArea, getLength} from "ol/sphere";
import store from "../../../src/app-store/index";
const Measure = Tool.extend(/** @lends Measure.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        source: new VectorSource(),
        styles: [
            // general style
            new Style({
                fill: new Fill({
                    color: [255, 127, 0, 0.3]
                }),
                stroke: new Stroke({
                    color: [255, 127, 0, 1.0],
                    width: 2
                }),
                image: new Circle({
                    radius: 6,
                    stroke: new Stroke({
                        color: [255, 127, 0, 1.0],
                        width: 3
                    }),
                    fill: new Fill({
                        color: [255, 127, 0, 0.4]
                    })
                })
            }),
            //  style for first and last coord
            new Style({
                image: new Circle({
                    radius: 6,
                    stroke: new Stroke({
                        color: [255, 127, 0, 1.0],
                        width: 3
                    }),
                    fill: new Fill({
                        color: [255, 127, 0, 0.4]
                    })
                }),
                geometry: function (feature) {
                    const geom = feature.getGeometry(),
                        coords = [];

                    coords.push(geom.getFirstCoordinate());
                    coords.push(geom.getLastCoordinate());
                    return new MultiPoint(coords);
                }
            }),
            // style for all points except first and last
            new Style({
                image: new Circle({
                    radius: 2,
                    stroke: new Stroke({
                        color: [255, 127, 0, 1.0],
                        width: 3
                    }),
                    fill: new Fill({
                        color: [255, 127, 0, 0.4]
                    })
                }),
                geometry: function (feature) {
                    const geom = feature.getGeometry(),
                        coords = [];

                    if (geom instanceof LineString) {
                        geom.getCoordinates().forEach(function (coordinate, index) {
                            if (index > 0 && index < geom.getCoordinates().length - 1) {
                                coords.push(coordinate);
                            }
                        });
                    }
                    if (geom instanceof Polygon) {
                        geom.getCoordinates()[0].forEach(function (coordinate, index) {
                            if (index > 0 && index < geom.getCoordinates()[0].length - 1) {
                                coords.push(coordinate);
                            }
                        });
                    }

                    return new MultiPoint(coords);
                }
            })
        ],
        snippetDropdownModelGeometry: {},
        snippetDropdownModelUnit: {},
        values: {
            "Strecke": "LineString",
            "Fläche": "Polygon"
        },
        values_unit: {
            "m": "m",
            "km": "km"
        },
        values_unit_polygon: {
            "m²": "m²",
            "km²": "km²"
        },
        values_3d: {
            "3D Messen": "3d"
        },
        geomtype: "LineString",
        drawingFeature: false,
        unit: "m",
        decimal: 1,
        hits3d: [],
        quickHelp: false,
        isMap3d: false,
        uiStyle: "DEFAULT",
        renderToWindow: true,
        deactivateGFI: true,
        pointerMoveListener: {},
        clickListener: {},
        textPoint: {},
        scale: -1,
        style: "DEFAULT",
        glyphicon: "glyphicon-resize-full",
        idCounter: 0,
        currentLng: "",
        // translations
        geometry: "",
        measure: "",
        plzConsider: "",
        valuesNotExact: "",
        findFurtherInf: "",
        deleteMeasurements: "",
        stretch: "",
        area: "",
        earthRadius: 6378137
    }),
    /**
     * @class Measure
     * @extends Tool
     * @memberof Tools.Measure
     * @constructs
     * @property {String} unit="m" unit of measure
     * @property {Boolean} quickHelp=false
     * @property {Boolean} isMap3d=false Flag if measure has 3D view
     * @property {String} uiStyle="DEFAULT" style for master portal
     * @property {Number} scale=-1
     * @property {String} style="DEFAULT" style for master portal
     * @property {Number} idCounter=0 counter for unique ids
     * @property {String} geometry="", filled with "Geometrie"- translated
     * @property {String} currentLng="", contains the current language - view listens to it
     * @property {String} measure="", filled with "Einheit"- translated
     * @property {String} plzConsider="", filled with "Bitte beachten Sie"- translated
     * @property {String} valuesNotExact="", filled with "Die angezeigten Werte unterliegen Ungenauigkeiten"- translated
     * @property {String} findFurtherInf="", filled with "Weitere Informationen finden Sie hier"- translated
     * @property {String} deleteMeasurements="", filled with "Messungen löschen"- translated
     * @property {String} stretch="", filled with "Strecke"- translated
     * @property {String} area="", filled with "Fläche"- translated
     */
    initialize: function () {
        let selectedValues = null,
            selectedUnit = null;

        if (Radio.request("Util", "getUiStyle") !== "DEFAULT") {
            this.setStyle("TABLE");
        }
        this.superInitialize();

        this.listenTo(Radio.channel("Map"), {
            "change": this.changeMap
        });
        this.listenTo(this, {
            "change:isActive": this.setStatus
        });
        this.listenTo(Radio.channel("MapView"), {
            "changedOptions": function (options) {
                this.setScale(options.scale);
            }
        }, this);
        this.set("layer", new VectorLayer({
            source: this.get("source"),
            style: this.get("styles"),
            name: "measure_layer",
            alwaysOnTop: true
        }));

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);

        this.setDropDownSnippetGeometry(new SnippetDropdownModel({
            name: "Geometrie",
            type: "string",
            displayName: "Geometrie auswählen",
            values: Object.keys(this.getLocalizedValues()),
            snippetType: "dropdown",
            isMultiple: false,
            preselectedValues: Object.keys(this.getLocalizedValues())[0]
        }));
        this.setDropDownSnippetUnit(new SnippetDropdownModel({
            name: "Einheit",
            type: "string",
            displayName: "Einheit auswählen",
            values: Object.keys(this.get("values_unit")),
            snippetType: "dropdown",
            isMultiple: false,
            preselectedValues: Object.keys(this.get("values_unit"))[0]
        }));
        this.listenTo(this.get("snippetDropdownModelGeometry"), {
            "valuesChanged": function () {
                selectedValues = this.get("snippetDropdownModelGeometry").getSelectedValues();
                if (selectedValues.values[0] === this.get("area")) {
                    this.get("snippetDropdownModelUnit").setPreselectedValues(Object.keys(this.get("values_unit_polygon"))[0]);
                    this.get("snippetDropdownModelUnit").updateValues(Object.keys(this.get("values_unit_polygon")));
                    this.get("snippetDropdownModelUnit").updateSelectedValues(Object.keys(this.get("values_unit_polygon")));
                }
                else {
                    this.get("snippetDropdownModelUnit").setPreselectedValues(Object.keys(this.get("values_unit"))[0]);
                    this.get("snippetDropdownModelUnit").updateValues(Object.keys(this.get("values_unit")));
                    this.get("snippetDropdownModelUnit").updateSelectedValues(Object.keys(this.get("values_unit")));
                }
                this.createInteraction(selectedValues.values[0] || Object.keys(this.getLocalizedValues())[0]);
            }
        });
        this.listenTo(this.get("snippetDropdownModelUnit"), {
            "valuesChanged": function () {
                selectedValues = this.get("snippetDropdownModelGeometry").getSelectedValues();
                selectedUnit = this.get("snippetDropdownModelUnit").getSelectedValues();
                if (!this.getIsDrawing()) {
                    this.createInteraction(selectedValues.values[0] || Object.keys(this.getLocalizedValues())[0]);
                }
                this.setUnit(selectedUnit.values[0]);
            }
        });
    },

    /**
     * Returns a localized object
     * @returns {Object} localized Object
     */
    getLocalizedValues: function () {
        const localizedValues = {};

        localizedValues[this.get("stretch")] = "LineString";
        localizedValues[this.get("area")] = "Polygon";

        return localizedValues;
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        const geometry = this.get("snippetDropdownModelGeometry");

        this.set({
            geometry: i18next.t("common:modules.tools.measure.geometry"),
            measure: i18next.t("common:modules.tools.measure.measure"),
            plzConsider: i18next.t("common:modules.tools.measure.plzConsider"),
            valuesNotExact: i18next.t("common:modules.tools.measure.valuesNotExact"),
            findFurtherInf: i18next.t("common:modules.tools.measure.findFurtherInf"),
            deleteMeasurements: i18next.t("common:modules.tools.measure.deleteMeasurements"),
            stretch: i18next.t("common:modules.tools.measure.stretch"),
            area: i18next.t("common:modules.tools.measure.area")
        });
        if (geometry !== null && (((Array.isArray(geometry) || typeof geometry === "string") && geometry.length > 0) || Object.keys(geometry).length > 0)) {
            this.get("snippetDropdownModelGeometry").setPreselectedValues(Object.keys(this.getLocalizedValues())[0]);
            this.get("snippetDropdownModelGeometry").updateValues(Object.keys(this.getLocalizedValues()));
            this.get("snippetDropdownModelGeometry").updateSelectableValues(Object.keys(this.getLocalizedValues()));
        }
        this.set("currentLng", lng);
    },

    /**
     * Setter for Status
     * @param {object} model - Measure Model
     * @param {boolean} value - Rückgabe eines Boolean
     * @returns {this} this
     */
    setStatus: function (model, value) {
        const layers = Radio.request("Map", "getLayers"),
            quickHelpSet = Radio.request("QuickHelp", "isSet");

        let measureLayer,
            selectedValues;

        if (value) {
            this.setQuickHelp(quickHelpSet);
            this.setUiStyle(Radio.request("Util", "getUiStyle"));
            this.setScale(Radio.request("MapView", "getOptions").scale);
            measureLayer = layers.getArray().find(function (layer) {
                return layer.get("name") === "measure_layer";
            });
            if (measureLayer === undefined) {
                Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), layers.getArray().length]);
            }
            selectedValues = this.get("snippetDropdownModelGeometry").getSelectedValues();
            this.createInteraction(selectedValues.values[0] || Object.keys(this.getLocalizedValues())[0]);

        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("draw"));
            this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
        }
    },

    /**
     * changes map (3D or 2D View)
     * @param {string} map - 3D or 2D
     * @returns {this} this
     */
    changeMap: function (map) {
        let selectedValues;

        this.deleteFeatures();
        if (map === "3D") {
            this.set("isMap3d", true);
            this.get("snippetDropdownModelGeometry").setPreselectedValues(Object.keys(this.get("values_3d"))[0]);
            this.get("snippetDropdownModelGeometry").updateValues(Object.keys(this.get("values_3d")));
            this.get("snippetDropdownModelGeometry").updateSelectableValues(Object.keys(this.get("values_3d")));
        }
        else {
            this.set("isMap3d", false);
            this.get("snippetDropdownModelGeometry").setPreselectedValues(Object.keys(this.getLocalizedValues())[0]);
            this.get("snippetDropdownModelGeometry").updateValues(Object.keys(this.getLocalizedValues()));
            this.get("snippetDropdownModelGeometry").updateSelectableValues(Object.keys(this.getLocalizedValues()));
        }
        if (this.get("isActive")) {
            selectedValues = this.get("snippetDropdownModelGeometry").getSelectedValues();
            this.createInteraction(selectedValues.values[0] || Object.keys(this.get("values_3d"))[0]);
        }
    },

    /**
     * @todo Write the documentation.
     * @param {object} obj - point with coordinates
     * @returns {this} this
     */
    handle3DClicked: function (obj) {
        const scene = Radio.request("Map", "getMap3d").getCesiumScene(),
            object = scene.pick(obj.position),
            mapProjection = Radio.request("MapView", "getProjection"),
            hits3d = this.get("hits3d"),
            firstHit = hits3d[0],
            pointId = "__3dMeasurmentFirstPoint",
            source = this.get("source");
        let hit,
            cartographic,
            ray,
            coords,
            lon = "",
            lat = "",
            feature,
            distance,
            textPoint,
            heightDiff,
            firstPoint;

        if (object) {
            hit = scene.pickPosition(obj.position);
            cartographic = scene.globe.ellipsoid.cartesianToCartographic(hit);
        }
        else {
            ray = scene.camera.getPickRay(obj.position);
            hit = scene.globe.pick(ray, scene);
            cartographic = scene.globe.ellipsoid.cartesianToCartographic(hit);
            cartographic.height = scene.globe.getHeight(cartographic);
        }
        lon = Cesium.Math.toDegrees(cartographic.longitude);
        lat = Cesium.Math.toDegrees(cartographic.latitude);
        coords = [lon, lat, cartographic.height];
        coords = Proj.transform(coords, Proj.get("EPSG:4326"), mapProjection);
        // draw first point
        if (hits3d.length === 0) {
            feature = this.createPointFeature(coords, pointId);

            source.addFeature(feature);
            hits3d.push({
                cartesian: hit,
                coords: coords
            });
        }
        // draw second point as Line and remove first drawn point
        else {
            distance = Cesium.Cartesian3.distance(firstHit.cartesian, hit);
            heightDiff = Math.abs(coords[2] - firstHit.coords[2]);
            feature = this.createLineFeature(firstHit.coords, coords);
            source.addFeature(feature);
            textPoint = this.generateTextPoint(feature, distance, heightDiff, coords);
            source.addFeature(textPoint);
            this.setTextPoint(textPoint);
            this.set("hits3d", []);

            firstPoint = source.getFeatureById(pointId);
            source.removeFeature(firstPoint);
        }
    },
    /**
     * create point feauture
     * @param {object} coords - coordinates of point in 3D
     * @param {void} id - undefined
     * @returns {object} feature
     */
    createPointFeature: function (coords, id) {
        const feature = new Feature({
            geometry: new Point(coords)
        });

        feature.setId(id);

        return feature;
    },

    /**
     * create line feature
     * @param {object} firstCoord - first coordinate of the line feature
     * @param {object} lastCoord - last coordinate of the line feature
     * @returns {object} feature - line feature
     */
    createLineFeature: function (firstCoord, lastCoord) {
        const feature = new Feature({
            geometry: new LineString([
                firstCoord,
                lastCoord
            ])
        });

        return feature;
    },

    /**
     * draws the feature.
     * @param {string} drawType - type of drawing feature (polygon or line)
     * @returns {this} this
     */
    createInteraction: function (drawType) {
        const that = this,
            value = this.getLocalizedValues()[drawType];

        let textPoint;

        Radio.trigger("Map", "removeInteraction", this.get("draw"));
        this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
        if (Radio.request("Map", "isMap3d")) {
            this.listenTo(Radio.channel("Map"), "clickedWindowPosition", this.handle3DClicked.bind(this));
            this.set("hits3d", []);
        }
        else {
            this.setDraw(new Draw({
                source: this.get("source"),
                type: value,
                style: this.get("styles")
            }));
            this.get("draw").on("drawstart", function (evt) {
                that.set("drawingFeature", evt.feature);
                that.setIsDrawing(true);
                textPoint = that.generateTextPoint(evt.feature);
                that.get("layer").getSource().addFeatures([textPoint]);
                that.setTextPoint(textPoint);
                that.registerPointerMoveListener(that);
                that.registerClickListener(that);
            }, this);
            this.get("draw").on("drawend", function (evt) {
                if (that.get("uiStyle") === "TABLE") {
                    const point = that.get("textPoint");

                    if (point) {
                        const styles = point.getStyle();

                        if (styles && styles[1] && styles[1].getText()) {
                            styles[1].getText().setText("");
                        }
                    }
                }
                that.set("drawingFeature", false);
                that.setIsDrawing(false);
                evt.feature.set("styleId", evt.feature.ol_uid);
                that.unregisterPointerMoveListener(that);
                that.unregisterClickListener(that);
            }, this);
            Radio.trigger("Map", "addInteraction", this.get("draw"));
        }
    },

    /**
     * @todo Write the documentation.
     * @param {object} context - Object
     * @returns {this} this
     */
    registerPointerMoveListener: function (context) {
        context.setPointerMoveListener(Radio.request("Map", "registerListener", "pointermove", context.moveTextPoint.bind(context)));
    },

    /**
     * @todo Write the documentation.
     * @param {object} context - Object
     * @returns {this} this
     */
    registerClickListener: function (context) {
        // "click" needed for touch devices
        context.setClickListener(Radio.request("Map", "registerListener", "click", context.moveTextPoint.bind(context)));
    },
    /**
     * @todo Write the documentation.
     * @param {object} context - Object
     * @returns {this} this
     */
    unregisterPointerMoveListener: function (context) {
        Radio.trigger("Map", "unregisterListener", context.get("pointerMoveListener"));
    },
    /**
     * @todo Write the documentation.
     * @param {object} context - Object
     * @returns {this} this
     */
    unregisterClickListener: function (context) {
        Radio.trigger("Map", "unregisterListener", context.get("clickListener"));
    },
    /**
     * @todo Write the documentation.
     * @param {object} evt - Map Browser Pointer Event
     * @returns {this} this
     */
    moveTextPoint: function (evt) {
        const point = this.get("textPoint"),
            geom = point.getGeometry(),
            styles = this.generateTextStyles();

        geom.setCoordinates(evt.coordinate);
        point.setStyle(styles);
    },

    /**
     * generates style for text in 3D view
     * @param {number} distance - distance between two points
     * @param {number} heightDiff - height (for 3D measure)
     * @returns {object} styles
     */
    generate3dTextStyles: function (distance, heightDiff) {
        const output = {},
            fill = new Fill({
                color: [255, 255, 255, 1]
            }),
            stroke = new Stroke({
                color: [0, 0, 0, 1],
                width: 2
            });

        let styles = [];

        if (this.get("unit") === "km") {
            output.measure = "Länge: " + (distance / 1000).toFixed(3) + this.get("unit");
        }
        else {
            output.measure = "Länge: " + distance.toFixed(2) + this.get("unit");
        }
        output.deviance = " Höhe: " + heightDiff.toFixed(2) + "m";

        styles = [
            new Style({
                text: new Text({
                    text: output.measure,
                    textAlign: "left",
                    font: "18px sans-serif",
                    fill: fill,
                    stroke: stroke,
                    offsetY: -50,
                    offsetX: 10
                })
            }),
            new Style({
                text: new Text({
                    text: output.deviance,
                    textAlign: "left",
                    font: "18px sans-serif",
                    fill: fill,
                    stroke: stroke,
                    offsetY: -30,
                    offsetX: 10
                })
            })
        ];
        return styles;
    },

    /**
     * generates style for text in 2D view
     * @param {object} feature - geometry feature
     * @returns {object} styles
     */
    generateTextStyles: function () {
        const feature = this.get("drawingFeature"),
            fill = new Fill({
                color: [0, 0, 0, 1]
            }),
            stroke = new Stroke({
                color: [255, 127, 0, 1],
                width: 1
            }),
            backgroundFill = new Fill({
                color: [255, 127, 0, 1]
            });
        let geom = null,
            output = {},
            styles = [];

        if (feature !== false) {
            geom = feature.getGeometry();
        }

        if (geom instanceof Polygon) {
            output = this.formatArea(geom);
        }
        else if (geom instanceof LineString) {
            output = this.formatLength(geom);
        }

        styles = [
            new Style({
                text: new Text({
                    text: output.measure,
                    textAlign: "left",
                    font: "14px sans-serif",
                    fill: fill,
                    stroke: stroke,
                    offsetY: -10,
                    offsetX: 10,
                    backgroundFill: backgroundFill,
                    padding: [5, 0, 5, 0]
                })
            }),
            new Style({
                text: new Text({
                    text: output.deviance,
                    textAlign: "left",
                    font: "12px sans-serif",
                    fill: fill,
                    stroke: stroke,
                    offsetY: 10,
                    offsetX: 10,
                    backgroundFill: backgroundFill,
                    padding: [5, 0, 5, 0]
                })
            })
        ];
        return styles;
    },

    /**
     * generates text for points
     * @param {object} feature - geometry feature
     * @param {number} distance - distance for 3D
     * @param {number} heightDiff - height for 3D
     * @param {number} coords - coordinates for 3D
     * @returns {this} pointFeature
     */
    generateTextPoint: function (feature, distance, heightDiff, coords) {
        let geom = null,
            coord = null,
            pointFeature = null;

        if (feature !== undefined) {
            geom = feature.getGeometry();
        }

        if (distance !== undefined) {
            coord = coords;
        }
        else if (geom instanceof Polygon) {
            coord = geom.getCoordinates()[0][geom.getCoordinates()[0].length - 2];
        }
        else if (geom instanceof LineString) {
            coord = geom.getLastCoordinate();
        }
        pointFeature = new Feature({
            geometry: new Point(coord)
        });
        if (distance !== undefined) {
            pointFeature.setStyle(this.generate3dTextStyles(distance, heightDiff));
        }
        else {
            pointFeature.setStyle(this.generateTextStyles());
        }
        pointFeature.set("styleId", this.uniqueId("measureStyle"));
        return pointFeature;
    },
    /**
     * Returns a unique id, starts with the given prefix
     * @param {string} prefix prefix for the id
     * @returns {string} a unique id
     */
    uniqueId: function (prefix) {
        let counter = this.get("idCounter");
        const id = ++counter;

        this.setIdCounter(id);
        return prefix ? prefix + id : id;
    },

    /**
     * @todo Write the documentation.
     * @param {number} distance - distance for 3D
     * @param {number} heightDiff - height for 3D
     * @param {number} position -
     * @returns {this} this
     */
    place3dMeasureTooltip: function (distance, heightDiff, position) {
        let output = "<span class='glyphicon glyphicon-resize-horizontal'/> ";

        if (this.get("unit") === "km") {
            output += (distance / 1000).toFixed(3) + " " + this.get("unit");
        }
        else {
            output += distance.toFixed(2) + " " + this.get("unit");
        }

        output += "<br><span class='glyphicon glyphicon-resize-vertical'/> ";
        output += heightDiff.toFixed(2) + " m";

        this.createMeasureTooltip();
        this.get("measureTooltipElement").innerHTML = output;
        this.get("measureTooltip").setPosition(position);
    },

    /**
     * Setter for unit
     * @param {string} value - m/km, m²/km²
     * @returns {void}
     */
    setUnit: function (value) {
        this.set("unit", value);
    },

    /**
     * Setter for Style
     * @param {string} value - table or default (for master portal)
     * @returns {this} this
     */
    setUiStyle: function (value) {
        this.set("uiStyle", value);
    },
    /**
     * Setter for Decimal
     * @param {string} value - value
     * @returns {this} this
     */
    setDecimal: function (value) {
        this.set("decimal", parseInt(value, 10));
    },

    /**
     * Löscht alle Geometrien und die dazugehörigen MeasureTooltips.
     * @return {undefined}
     */
    deleteFeatures: function () {
        // lösche alle Geometrien
        this.get("source").clear();
    },

    /** Berechnet das Quadrat der deltas (für x und y) von zwei Koordinaten
     * @param {Array} coordinates - Koordinatenliste der Geometrie
     * @param {number} pos0 - 1. Koordinate
     * @param {number} pos1 - 2. Koordinate
     * @return {undefined}
     */
    calcDeltaPow: function (coordinates, pos0, pos1) {
        const dx = coordinates[pos0][0] - coordinates[pos1][0],
            dy = coordinates[pos0][1] - coordinates[pos1][1],
            deltaPow = Math.pow(dx, 2) + Math.pow(dy, 2);

        return deltaPow;
    },

    /**
     * Berechnet die Länge der Strecke.
     * @param {ol.geom.LineString} line - Linestring geometry
     * @return {undefined}
     */
    formatLength: function (line) {
        const output = {},
            coords = line.getCoordinates(),
            scaleError = this.get("scale") / 1000, // Berechnet den Maßstabsabhängigen Fehler bei einer Standardabweichung von 1mm
            earthRadius = this.get("earthRadius"),
            projection = store.getters["Map/projection"].getCode(),
            fehler = Math.sqrt((coords.length - 1) * Math.pow(scaleError, 2));

        let lengthRed = "";

        // get length on sphere
        lengthRed = getLength(line, {
            projection: projection,
            radius: earthRadius
        });
        if (this.get("uiStyle") === "TABLE") {
            if (this.get("unit") === "km") {
                output.measure = (lengthRed / 1000).toFixed(1) + " " + this.get("unit");
                output.deviance = i18next.t("common:modules.tools.measure.finishWithDoubleClick");
            }
            else {
                output.measure = lengthRed.toFixed(0) + " " + this.get("unit");
                output.deviance = i18next.t("common:modules.tools.measure.finishWithDoubleClick");
            }
        }
        else if (this.get("unit") === "km") {
            output.measure = (lengthRed / 1000).toFixed(3) + " " + this.get("unit");
            output.deviance = "(+/- " + (fehler / 1000).toFixed(3) + " " + this.get("unit") + ")";
        }
        else {
            output.measure = lengthRed.toFixed(2) + " " + this.get("unit");
            output.deviance = "(+/- " + fehler.toFixed(2) + " " + this.get("unit") + ")";
        }
        return output;
    },

    /**
     * Berechnet die Größe der Fläche.
     * @param {ol.geom.Polygon} polygon - Polygon geometry
     * @return {undefined}
     */
    formatArea: function (polygon) {
        const output = {},
            coords = polygon.getLinearRing(0).getCoordinates(),
            projection = store.getters["Map/projection"].getCode(),
            scaleError = this.get("scale") / 1000,
            earthRadius = this.get("earthRadius");

        let areaRed = "",
            fehler = 0;

        for (let i = 0; i < coords.length; i++) {
            if (i === coords.length - 1) {
                fehler += this.calcDeltaPow(coords, i, 0);
            }
            else {
                fehler += this.calcDeltaPow(coords, i, i + 1);
            }
        }

        fehler = 0.5 * scaleError * Math.sqrt(fehler);

        // get area on sphere
        areaRed = getArea(polygon, {
            projection: projection,
            radius: earthRadius
        });

        if (this.get("uiStyle") === "TABLE") {
            if (this.get("unit") === "km²") {
                output.measure = (areaRed / 1000000).toFixed(1) + " " + this.get("unit");
                output.deviance = i18next.t("common:modules.tools.measure.finishWithDoubleClick");
            }
            else {
                output.measure = areaRed.toFixed(0) + " " + this.get("unit");
                output.deviance = i18next.t("common:modules.tools.measure.finishWithDoubleClick");
            }
        }
        else if (this.get("unit") === "km²") {
            output.measure = (areaRed / 1000000).toFixed(2) + " " + this.get("unit");
            output.deviance = "(+/- " + (fehler / 1000000).toFixed(2) + " " + this.get("unit") + ")";
        }
        else {
            output.measure = areaRed.toFixed(0) + " " + this.get("unit");
            output.deviance = "(+/- " + fehler.toFixed(0) + " " + this.get("unit") + ")";
        }
        return output;
    },

    /**
     * removes the last drawing if it has not been completed
     * @return {void}
     */
    removeIncompleteDrawing: function () {
        let source = null,
            actualFeature = null;

        if (this.get("isDrawing")) {
            this.get("draw").finishDrawing();
            source = this.get("source");
            if (source.getFeatures().length > 0) {
                actualFeature = source.getFeatures().slice(-1)[0];
                source.removeFeature(actualFeature);
            }
        }
    },

    /**
     * setter for draw
     * @param {object} value - Draw
     * @returns {this} this
     */
    setDraw: function (value) {
        this.set("draw", value);
    },

    /**
     * @todo Write the documentation.
     * @param {object} value -
     * @returns {this} this
     */
    setPointerMoveListener: function (value) {
        this.set("pointerMoveListener", value);
    },

    /**
     * setter for click listener
     * @param {object}value -
     * @returns {this} this
     */
    setClickListener: function (value) {
        this.set("clickListener", value);
    },

    /**
     * setter for text point
     * @param {object} value -
     * @returns {this} this
     */
    setTextPoint: function (value) {
        this.set("textPoint", value);
    },

    /**
     * setter for scale
     * @param {number} value -
     * @returns {this} this
     */
    setScale: function (value) {
        this.set("scale", value);
    },

    /**
     * setter for drawn function
     * @param {boolean} value - true or false
     * @returns {this} this
     */
    setIsDrawing: function (value) {
        const dropdownmenu = document.querySelector(".dropdown_geometry"),
            button = dropdownmenu.querySelector("button");

        this.set("isDrawing", value);
        /* wird geprüft, ob es gemessen wird, falls ja, wird dropdown menu für Geometry ausgegraut*/
        if (value) {
            button.setAttribute("disabled", "disabled");
        }
        else {
            button.removeAttribute("disabled");
        }
    },

    /**
     * getter for drawn function
     * @returns {void}
     */
    getIsDrawing: function () {
        return this.get("isDrawing");
    },

    /**
     * setter for style
     * @param {string} value - table or default (for master portal)
     * @returns {this} this
     */
    setStyle: function (value) {
        this.set("style", value);
    },

    /**
     * setter for quickHelp
     * @param {boolean} value quickHelp
     * @returns {void}
     */
    setQuickHelp: function (value) {
        this.set("quickHelp", value);
    },

    /**
     * setter for dropdown snippet geometry
     * @param {object} value - snippet dropdown model for geometry
     * @returns {this} this
     */
    setDropDownSnippetGeometry: function (value) {
        this.set("snippetDropdownModelGeometry", value);
    },

    /**
     * setter for dropdown snippet unit
     * @param {object} value - snippet dropdown model for unit
     * @returns {this} this
     */
    setDropDownSnippetUnit: function (value) {
        this.set("snippetDropdownModelUnit", value);
    },
    /**
    * Sets the idCounter.
    * @param {string} value counter
    * @returns {void}
    */
    setIdCounter: function (value) {
        this.set("idCounter", value);
    }
});

export default Measure;
