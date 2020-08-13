import {Select, Modify, Draw} from "ol/interaction.js";
import {Circle, Fill, Stroke, Style, Text, Icon} from "ol/style.js";
import {GeoJSON} from "ol/format.js";
import MultiPolygon from "ol/geom/MultiPolygon.js";
import MultiPoint from "ol/geom/MultiPoint.js";
import MultiLine from "ol/geom/MultiLineString.js";
import {fromCircle as circPoly} from "ol/geom/Polygon.js";
import Feature from "ol/Feature";
import Tool from "../../core/modelList/tool/model";
import {getMapProjection} from "masterportalAPI/src/crs";
import {toLonLat, transform} from "ol/proj";

const DrawTool = Tool.extend(/** @lends DrawTool.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        name: "Zeichnen / Schreiben",
        nameTranslationKey: "common:menu.tools.draw",
        drawInteraction: undefined,
        selectInteraction: undefined,
        modifyInteraction: undefined,
        layer: undefined,
        font: "Arial",
        fontSize: 10,
        text: "Klicken Sie auf die Karte um den Text zu platzieren",
        color: [55, 126, 184, 1],
        colorContour: [0, 0, 0, 1],
        radius: 6,
        strokeWidth: 1,
        opacity: 1,
        opacityContour: 1,
        drawType: {
            geometry: "Point",
            text: "Punkt zeichnen"
        },
        symbol: "",
        pointSize: 6,
        renderToWindow: true,
        deactivateGFI: true,
        glyphicon: "glyphicon-pencil",
        addFeatureListener: {},
        zIndex: 0,
        freehand: true,
        redoArray: [],
        fId: 0,
        earthRadius: 6378137,
        transparencyOptions: [
            {caption: "0 %", value: 1.0},
            {caption: "10 %", value: 0.9},
            {caption: "20 %", value: 0.8},
            {caption: "30 %", value: 0.7},
            {caption: "40 %", value: 0.6},
            {caption: "50 %", value: 0.5},
            {caption: "60 %", value: 0.4},
            {caption: "70 %", value: 0.3},
            {caption: "80 %", value: 0.2},
            {caption: "90 %", value: 0.1},
            {caption: "100 %", value: 0.0}
        ],
        colorOptions: [], // is set later on
        strokeOptions: [
            {caption: "1 px", value: 1},
            {caption: "2 px", value: 2},
            {caption: "3 px", value: 3},
            {caption: "4 px", value: 4},
            {caption: "5 px", value: 5},
            {caption: "6 px", value: 6}
        ],
        pointSizeOptions: [
            {caption: "6 px", value: 6},
            {caption: "8 px", value: 8},
            {caption: "10 px", value: 10},
            {caption: "12 px", value: 12},
            {caption: "14 px", value: 14},
            {caption: "16 px", value: 16}
        ],
        fontSizeOptions: [
            {caption: "10 px", value: 10},
            {caption: "12 px", value: 12},
            {caption: "16 px", value: 16},
            {caption: "20 px", value: 20},
            {caption: "24 px", value: 24},
            {caption: "32 px", value: 32}
        ],
        fontOptions: [
            {caption: "Arial", value: "Arial"},
            {caption: "Calibri", value: "Calibri"},
            {caption: "Times New Roman", value: "Times New Roman"}
        ],
        drawTypeOptions: [], // is set later on
        iconList: [], // is set later on
        // translations
        currentLng: "",
        clickToPlaceText: "",
        draw: "",
        geometryDrawFailed: "",
        defindeTwoCircles: "",
        defindeInnerCircle: "",
        defindeDiameter: "",
        defindeOuterCircle: "",
        drawPoint: "",
        writeText: "",
        drawLine: "",
        drawCurve: "",
        drawArea: "",
        drawCircle: "",
        drawDoubleCircle: "",
        doubleCirclePlaceholder: "",
        diameter: "",
        outerDiameter: "",
        unit: "",
        textI18n: "",
        method: "",
        interactive: "",
        defined: "",
        transparencyOutline: "",
        outlineColor: "",
        fontSizeText: "",
        fontName: "",
        size: "",
        lineWidth: "",
        transparency: "",
        colorText: "",
        blue: "",
        yellow: "",
        grey: "",
        green: "",
        orange: "",
        red: "",
        black: "",
        white: "",
        drawBtnText: "",
        undoBtnText: "",
        redoBtnText: "",
        editBtnText: "",
        downloadBtnText: "",
        deleteBtnText: "",
        deleteAllBtnText: "",
        idCounter: 0,
        withoutGUI: false
    }),
    /**
     * @class DrawModel
     * @extends Tool
     * @memberof Tools.Draw
     * @property {String} nameTranslationKey=common:menu.tools.draw is used to translate the title, if no translation configured for thie title in config.json
     * @property {*} drawInteraction=undefined The draw interaction.
     * @property {*} selectInteraction=undefined The select interaction.
     * @property {*} modifyInteraction=undefined The modify interaction.
     * @property {ol/layer} layer=undefined The layer for the drawn features.
     * @property {String} font="Arial" Selected font of the model.
     * @property {Number} fontSize=10 Selected fontSize of the model.
     * @property {String} text="Klicken Sie auf die Karte um den Text zu platzieren" Placeholder.
     * @property {Number[]} color=[55, 126, 184, 1] Selectd color in rgba array.
     * @property {Number} radius=6 Selected radius.
     * @property {Number} strokeWidth=1 Selected stroke width.
     * @property {Number} opacity=1 Selected opacity.
     * @property {Object} drawType The drawType.
     * @property {String} symbol: "" The symbol for the point.
     * @property {Number} pointSize: 6 The size of the point.
     * @property {String} drawType.geometry The geometry of the draw type.
     * @property {String} drawType.text The placeholder text.
     * @property {Boolean} renderToWindow=true Flag to render in tool window.
     * @property {Boolean} deactivateGFI=true Flag to deactivate GFI if draw tool gets activated.
     * @property {String} glyphicon="glyphicon-pencil" CSS glyphicon class.
     * @property {Object} addFeatureListener Listener.
     * @property {Number} zIndex=0 zIndex.
     * @property {String} currentLng: "" contains the current language, view listens to it
     * @property {String} clickToPlaceText: "" contains the translated text
     * @property {String} draw: "" contains the translated text
     * @property {String} geometryDrawFailed: "" contains the translated text
     * @property {String} defindeTwoCircles: "" contains the translated text
     * @property {String} defindeInnerCircle: "" contains the translated text
     * @property {String} defindeDiameter: "" contains the translated text
     * @property {String} defindeOuterCircle: "" contains the translated text
     * @property {String} drawPoint: "" contains the translated text
     * @property {String} writeText: "" contains the translated text
     * @property {String} drawLine: "" contains the translated text
     * @property {String} drawCurve: "" contains the translated text
     * @property {String} drawArea: "" contains the translated text
     * @property {String} drawCircle: "" contains the translated text
     * @property {String} drawDoubleCircle: "" contains the translated text
     * @property {String} doubleCirclePlaceholder: "" contains the translated text
     * @property {String} diameter: "" contains the translated text
     * @property {String} outerDiameter: "" contains the translated text
     * @property {String} unit: "" contains the translated text
     * @property {String} textI18n: "" contains the translated text
     * @property {String} method: "" contains the translated text
     * @property {String} interactive: "" contains the translated text
     * @property {String} defined: "" contains the translated text
     * @property {String} transparencyOutline: "" contains the translated text
     * @property {String} outlineColor: "" contains the translated text
     * @property {String} fontSizeText: "" contains the translated text
     * @property {String} fontName: "" contains the translated text
     * @property {String} size: "" contains the translated text
     * @property {String} lineWidth: "" contains the translated text
     * @property {String} transparency: "" contains the translated text
     * @property {String} colorText: "" contains the translated text
     * @property {String} blue: "" contains the translated text
     * @property {String} yellow: "" contains the translated text
     * @property {String} grey: "" contains the translated text
     * @property {String} green: "" contains the translated text
     * @property {String} orange: "" contains the translated text
     * @property {String} red: "" contains the translated text
     * @property {String} black: "" contains the translated text
     * @property {String} white: "" contains the translated text
     * @property {String} drawBtnText: "" contains the translated text
     * @property {String} undoBtnText: "" contains the translated text
     * @property {String} redoBtnText: "" contains the translated text
     * @property {String} editBtnText: "" contains the translated text
     * @property {String} downloadBtnText: "" contains the translated text
     * @property {String} deleteBtnText: "" contains the translated text
     * @property {String} deleteAllBtnText: "" contains the translated text
     * @property {Number} idCounter=0 counter for unique ids
     * @property {String} withoutGUI=false set to true, to finish draw without gui on another way than usual
     * @listens Tools.Draw#RadioRequestDrawGetLayer
     * @listens Tools.Draw#RadioRequestDrawDownloadWithoutGUI
     * @listens Tools.Draw#RadioTriggerDrawInitWithoutGUI
     * @listens Tools.Draw#RadioTriggerDeleteAllFeatures
     * @listens Tools.Draw#RadioTriggerCancelDrawWithoutGUI
     * @listens Tools.Draw#RadioTriggerDownloadViaRemoteInterface
     * @listens i18next#RadioTriggerLanguageChanged
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel("Draw");

        this.superInitialize();
        this.changeLang(i18next.language, true);

        this.setMethodCircle("interactiv");

        channel.reply({
            "getLayer": function () {
                return this.get("layer");
            },
            "downloadWithoutGUI": this.downloadFeaturesWithoutGUI
        }, this);

        channel.on({
            "initWithoutGUI": this.inititalizeWithoutGUI,
            "deleteAllFeatures": this.deleteFeatures,
            "editWithoutGUI": this.editFeaturesWithoutGUI,
            "cancelDrawWithoutGUI": this.cancelDrawWithoutGUI,
            "downloadViaRemoteInterface": this.downloadViaRemoteInterface
        }, this);

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                const layer = model.createLayer(model.get("layer"));

                if (value) {
                    this.setLayer(layer);
                    this.createDrawInteractionAndAddToMap(layer, this.get("drawType"), true);
                    this.createSelectInteractionAndAddToMap(layer, false);
                    this.createModifyInteractionAndAddToMap(layer, false);
                    this.off(this);
                }
            }
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        Radio.trigger("RemoteInterface", "postMessage", {"initDrawTool": true});
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @param {Boolean} initial initial set of lng
     * @returns {Void}  -
     */
    changeLang: function (lng, initial) {
        const blue = i18next.t("common:colors.blue"),
            yellow = i18next.t("common:colors.yellow"),
            grey = i18next.t("common:colors.grey"),
            green = i18next.t("common:colors.green"),
            orange = i18next.t("common:colors.orange"),
            red = i18next.t("common:colors.red"),
            black = i18next.t("common:colors.black"),
            white = i18next.t("common:colors.white"),
            drawPoint = i18next.t("common:modules.tools.draw.drawPoint"),
            writeText = i18next.t("common:modules.tools.draw.writeText"),
            drawLine = i18next.t("common:modules.tools.draw.drawLine"),
            drawCurve = i18next.t("common:modules.tools.draw.drawCurve"),
            drawArea = i18next.t("common:modules.tools.draw.drawArea"),
            drawCircle = i18next.t("common:modules.tools.draw.drawCircle"),
            drawDoubleCircle = i18next.t("common:modules.tools.draw.drawDoubleCircle"),
            iconPoint = i18next.t("common:modules.tools.draw.iconList.iconPoint"),
            iconLeaf = i18next.t("common:modules.tools.draw.iconList.iconLeaf");

        this.set({
            clickToPlaceText: i18next.t("common:modules.tools.draw.clickToPlaceText"),
            draw: i18next.t("common:modules.tools.draw.draw"),
            geometryDrawFailed: i18next.t("common:modules.tools.draw.geometryDrawFailed"),
            defindeTwoCircles: i18next.t("common:modules.tools.draw.defindeTwoCircles"),
            defindeInnerCircle: i18next.t("common:modules.tools.draw.defindeInnerCircle"),
            defindeDiameter: i18next.t("common:modules.tools.draw.defindeDiameter"),
            defindeOuterCircle: i18next.t("common:modules.tools.draw.defindeOuterCircle"),
            drawPoint: drawPoint,
            writeText: writeText,
            drawLine: drawLine,
            drawCurve: drawCurve,
            drawArea: drawArea,
            drawCircle: drawCircle,
            drawDoubleCircle: drawDoubleCircle,
            doubleCirclePlaceholder: i18next.t("common:modules.tools.draw.doubleCirclePlaceholder"),
            diameter: i18next.t("common:modules.tools.draw.diameter"),
            outerDiameter: i18next.t("common:modules.tools.draw.outerDiameter"),
            unit: i18next.t("common:modules.tools.draw.unit"),
            textI18n: i18next.t("common:modules.tools.draw.text"),
            method: i18next.t("common:modules.tools.draw.method"),
            interactive: i18next.t("common:modules.tools.draw.interactive"),
            defined: i18next.t("common:modules.tools.draw.defined"),
            transparencyOutline: i18next.t("common:modules.tools.draw.transparencyOutline"),
            outlineColor: i18next.t("common:modules.tools.draw.outlineColor"),
            fontSizeText: i18next.t("common:modules.tools.draw.fontSize"),
            fontName: i18next.t("common:modules.tools.draw.fontName"),
            size: i18next.t("common:modules.tools.draw.size"),
            lineWidth: i18next.t("common:modules.tools.draw.lineWidth"),
            transparency: i18next.t("common:modules.tools.draw.transparency"),
            colorText: i18next.t("common:modules.tools.draw.color"),
            blue: blue,
            yellow: yellow,
            grey: grey,
            green: green,
            orange: orange,
            red: red,
            black: black,
            white: white,
            drawBtnText: i18next.t("common:modules.tools.draw.button.draw"),
            undoBtnText: i18next.t("common:modules.tools.draw.button.undo"),
            redoBtnText: i18next.t("common:modules.tools.draw.button.redo"),
            editBtnText: i18next.t("common:modules.tools.draw.button.edit"),
            deleteBtnText: i18next.t("common:modules.tools.draw.button.delete"),
            deleteAllBtnText: i18next.t("common:modules.tools.draw.button.deleteAll"),
            downloadBtnText: i18next.t("common:button.download")
        });
        this.set("text", this.get("clickToPlaceText"));
        this.set("colorOptions", [
            {caption: blue, value: "55, 126, 184"},
            {caption: black, value: "0, 0, 0"},
            {caption: yellow, value: "255, 255, 51"},
            {caption: grey, value: "153, 153, 153"},
            {caption: green, value: "77, 175, 74"},
            {caption: orange, value: "255, 127, 0"},
            {caption: red, value: "228, 26, 28"},
            {caption: white, value: "255, 255, 255"}]);
        this.set("drawTypeOptions", [
            {caption: drawPoint, value: "Point", id: "drawPoint"},
            {caption: drawLine, value: "LineString", id: "drawLine"},
            {caption: drawCurve, value: "LineString free", id: "drawCurve"},
            {caption: drawArea, value: "Polygon", id: "drawArea"},
            {caption: drawCircle, value: "Circle", id: "drawCircle"},
            {caption: drawDoubleCircle, value: "Circle", id: "drawDoubleCircle"},
            {caption: writeText, value: "Point", id: "writeText"}
        ]);
        if (initial) {
            this.setDrawType("Point", this.get("drawPoint"));
            this.setSymbol({
                caption: iconPoint,
                type: "simple_point",
                value: "simple_point"
            });
            // If no values are set in config.json, initial values have to be set here
            if (this.get("iconList").length === 0) {
                this.set("iconList", [
                    {caption: iconPoint, type: "simple_point", value: "simple_point"},
                    {caption: iconLeaf, type: "glyphicon", value: "\ue103"}
                ]);
            }
        }
        this.set("currentLng", lng);
    },

    /**
     * Creates an addfeature-Listener. This feature-listener checks the method how to draw the
     * circle. If the method is "defined", then a variety of other function is called and the
     * openlayers drawevent will be changed accordingly. If the method is not "defined" (but "interactiv"),
     * the function to define the style of the drawn feature is called.
     * @param   {Interaction} drawInteraction - drawInteraction.
     * @param   {Boolean} doubleIsActive - Boolean to compute a double circle or single circle.
     * @param   {ol.layer} layer - Layer, to which the Listener is registered.
     * @returns {void}
     */
    drawInteractionOnDrawevent: function (drawInteraction, doubleIsActive, layer) {
        const layerSource = layer.getSource(),
            drawType = this.get("drawType");

        this.setAddFeatureListener(layerSource.once("addfeature", function (evt) {
            if (this.get("methodCircle") === "defined" && drawType.geometry === "Circle") {

                const radiusInner = this.get("circleRadiusInner"),
                    radiusOuter = this.get("circleRadiusOuter"),
                    innerRadius = this.transformNaNToUndefined(radiusInner),
                    outerRadius = this.transformNaNToUndefined(radiusOuter),
                    circleRadius = this.getDefinedRadius(doubleIsActive, radiusOuter, radiusInner),
                    circleCenter = evt.feature.getGeometry().getCenter();

                if (innerRadius === undefined || innerRadius === 0) {
                    $(".circleRadiusInner input")[0].style.borderColor = "#E10019";
                    if (drawType.text === this.get("drawDoubleCircle")) {
                        if (outerRadius === undefined || outerRadius === 0) {
                            this.alertForgetToDefineRadius(evt, layer, this.get("defindeTwoCircles"));
                            $(".circleRadiusOuter input")[0].style.borderColor = "#E10019";
                        }
                        else {
                            this.alertForgetToDefineRadius(evt, layer, this.get("defindeInnerCircle"));
                            $(".circleRadiusOuter input")[0].style.borderColor = "";
                        }
                    }
                    else {
                        this.alertForgetToDefineRadius(evt, layer, this.get("defindeDiameter"));
                    }
                }
                else {
                    if (outerRadius === undefined || outerRadius === 0) {
                        if (drawType.text === this.get("drawDoubleCircle")) {
                            this.alertForgetToDefineRadius(evt, layer, this.get("defindeOuterCircle"));
                            $(".circleRadiusOuter input")[0].style.borderColor = "#E10019";
                        }
                        else {
                            this.calculateCircle(evt, circleCenter, circleRadius);
                        }
                    }
                    else {
                        this.calculateCircle(evt, circleCenter, circleRadius);
                        $(".circleRadiusOuter input")[0].style.borderColor = "";
                    }
                    $(".circleRadiusInner input")[0].style.borderColor = "";
                }
            }
            evt.feature.setStyle(this.getStyle());
            this.countupZIndex();
        }.bind(this)));

        if (this.get("methodCircle") === "defined" && this.get("drawType").geometry === "Circle") {
            drawInteraction.finishDrawing();
        }
    },

    /**
     * Function to transform value "not a number (NaN)" to undefined.
     * @param   {Boolean} radius - radius of the circle.
     * @returns {undefined} - returns undefined.
     */
    transformNaNToUndefined: function (radius) {
        return isNaN(radius) ? undefined : radius;
    },

    /**
     * Getter to get the radius of the inner or outer circle.
     * Depends on whether a double circle is to be calculated or not.
     * @param   {Boolean} doubleIsActive - defines if a doublecircle or singlecircle should be calculated.
     * @param   {Number} circleRadiusOuter - Diameter of the outer circle.
     * @param   {Number} circleRadiusInner - Diameter of the inner / single circle.
     * @returns {Number} - returns the circle radius.
     */
    getDefinedRadius: function (doubleIsActive, circleRadiusOuter, circleRadiusInner) {
        return doubleIsActive ? circleRadiusOuter : circleRadiusInner;
    },

    /**
     * Function to coordinate the circle calculation.
     * @param   {Event} evt - DrawEvent with the drawn-feature.
     * @param   {Number} circleCenter - Center of the circle.
     * @param   {Number} circleRadius - Diameter of the circle.
     * @returns {void}
     */
    calculateCircle: function (evt, circleCenter, circleRadius) {
        const map = Radio.request("Map", "getMap"),
            earthRadius = this.get("earthRadius"),
            resultCoordinates = [
                this.getCircleExtentByDistanceLat(circleCenter, circleRadius, map, earthRadius),
                this.getCircleExtentByDistanceLat(circleCenter, -1 * circleRadius, map, earthRadius),
                this.getCircleExtentByDistanceLon(circleCenter, circleRadius, map, earthRadius),
                this.getCircleExtentByDistanceLon(circleCenter, -1 * circleRadius, map, earthRadius)
            ],
            assortedCoordinates = this.assortResultCoordinates(circleCenter, resultCoordinates);

        this.overwriteExtentCoordinates(evt, resultCoordinates);
        this.overwriteFlatCoordinates(evt, assortedCoordinates);
    },

    /**
     * Merges the coordinates of the circle center and the calculated ones for the defined radius in one array and the right order together.
     * @param   {Number} circleCenter - Coordinates of the circlecenter.
     * @param   {Number} resultCoordinates - Calculated coordinates for defined radius.
     * @returns {Array} - returns an array with the extent coordinates of the circle feature.
     */
    assortResultCoordinates: function (circleCenter, resultCoordinates) {
        return [
            circleCenter[0],
            circleCenter[1],
            resultCoordinates[3][0],
            resultCoordinates[3][1]];
    },

    /**
     * Overwrites the extent coordinates of an existing (circle-) feature with recalculated ones.
     * @param   {Event} evt - DrawEvent with the drawn-feature.
     * @param   {Number} resultCoordinates - New coordinates to describe the extent of the circle. Consists of four single values.
     * The northernmost point of the circle is described by the longitude (northing) of that point (0).
     * The southernmost point is described by the longitude (northing) of that point (1).
     * The easternmost point is described by the latitude (easting) of that point (2).
     * The westernmost point is described by the latitude (easting) of that point (3).
     * They must be added to the array in the following order: [3, 1, 2, 0]
     * @returns {Object} - returns the feature with the new extent coordinates.
     */
    overwriteExtentCoordinates: function (evt, resultCoordinates) {
        evt.feature.getGeometry().extent_ = [
            resultCoordinates[3][0],
            resultCoordinates[1][1],
            resultCoordinates[2][0],
            resultCoordinates[0][1]
        ];
        return evt.feature.getGeometry().extent_;
    },

    /**
     * Overwrites the flat coordinates of an existing (circle-) feature with recalculated ones.
     * @param   {Event} evt - DrawEvent with the drawn-feature.
     * @param   {Number} flatCoordinates - new flat coordinates of the drawn feature.
     * @returns {Object} - returns the feature with the new flat coordinates.
     */
    overwriteFlatCoordinates: function (evt, flatCoordinates) {
        evt.feature.getGeometry().flatCoordinates = flatCoordinates;

        return evt.feature.getGeometry().flatCoordinates;
    },

    /**
     * Alert function that shows up the alert, if the user has not defined the radius.
     * Because the function (or the review if the radius is defined) is called after the drawstart,
     * the feature already set due to the drawstart has to be removed.
     * @param   {Event} evt - DrawEvent with the drawn-feature.
     * @param   {Number} layer - Layer with the drawFeatures.
     * @param   {String} textMessage - Message shown up in the alert window.
     * @returns {Layer} - returns the layer without the event feature.
     */
    alertForgetToDefineRadius: function (evt, layer, textMessage) {
        Radio.trigger("Alert", "alert", textMessage);
        layer.getSource().removeFeature(evt.feature);

        return layer;
    },

    /**
     * Calculates new flat and extent latitude coordinates for the (circle-) feature.
     * These coordiantes are calculated on the basis of the circle diameter specified by the user.
     * @param   {Array} circleCenter - Centercoordinates of the circle.
     * @param   {Array} diameter - Diameter of the new circle.
     * @param   {ol.Map} map - Map to project to.
     * @param   {Number} earthRadius - Radius of the earth.
     * @returns {Array} - returns new and transformed flat / extent coordinates of the circle.
     */
    getCircleExtentByDistanceLat: function (circleCenter, diameter, map, earthRadius) {
        const offsetLat = diameter / 2,
            circleCenterWGS = toLonLat(circleCenter, getMapProjection(map)),
            deltaLat = offsetLat / earthRadius,
            newPositionLat = circleCenterWGS[1] + deltaLat * 180 / Math.PI;

        return transform([circleCenterWGS[0], newPositionLat], "EPSG:4326", getMapProjection(map));
    },

    /**
     * Calculates new flat and extent longitude coordinates for the (circle-) feature.
     * These coordiantes are calculated on the basis of the circle diameter specified by the user.
     * @param   {Array} circleCenter - Centercoordinates of the circle.
     * @param   {Array} diameter - Diameter of the new circle.
     * @param   {ol.Map} map - Map to project to.
     * @param   {Number} earthRadius - Radius of the earth.
     * @returns {Array} - returns new and transformed flat coordinates of the circle.
     */
    getCircleExtentByDistanceLon: function (circleCenter, diameter, map, earthRadius) {
        const offsetLon = diameter / 2,
            circleCenterWGS = toLonLat(circleCenter, getMapProjection(map)),
            deltaLon = offsetLon / (earthRadius * Math.cos(Math.PI * circleCenterWGS[1] / 180)),
            newPositionLon = circleCenterWGS[0] + deltaLon * 180 / Math.PI;

        return transform([newPositionLon, circleCenterWGS[1]], "EPSG:4326", getMapProjection(map));
    },

    /**
     * initialises the drawing functionality without a GUI
     * useful for instance for the use via RemoteInterface
     * @param {String} para_object - an Object which includes the parameters
     *                 {String} drawType - which type is meant to be drawn ["Point", "LineString", "Polygon", "Circle"]
     *                 {String} color - color, in rgb (default: "55, 126, 184")
     *                 {Float} opacity - transparency (default: 1.0)
     *                 {Integer} maxFeatures - maximum number of Features allowed to be drawn (default: unlimeted)
     *                 {String} initialJSON - GeoJSON containing the Features to be drawn on the Layer, i.e. for editing
     *                 {Boolean} transformWGS - The GeoJSON will be transformed from WGS84 to UTM if set to true
     *                 {Boolean} zoomToExtent - The map will be zoomed to the extent of the GeoJson if set to true
     * @returns {String} GeoJSON of all Features as a String
     */
    inititalizeWithoutGUI: function (para_object) {
        let featJSON,
            newColor,
            format = new GeoJSON();
        const initJson = para_object.initialJSON,
            zoomToExtent = para_object.zoomToExtent,
            transformWGS = para_object.transformWGS;

        if (this.collection) {
            this.collection.setActiveToolsToFalse(this);
        }

        this.set("renderToWindow", false);
        this.setIsActive(true);

        // do this after setting active
        this.setFreehand(para_object.freehand === true);

        if ($.inArray(para_object.drawType, ["Point", "LineString", "Polygon", "Circle"]) > -1) {
            this.setDrawType(para_object.drawType, para_object.drawType + " " + this.get("draw"));
            if (para_object.color) {
                this.setColor(para_object.color);
                this.setColorContour(para_object.color);
            }
            if (para_object.opacity) {
                newColor = this.get("color");

                newColor[3] = parseFloat(para_object.opacity);
                this.setColor(newColor);
                this.setOpacity(para_object.opacity);
            }

            // this.createDrawInteraction(this.get("drawType"), this.get("layer"), para_object.maxFeatures);
            this.createDrawInteractionAndAddToMap(this.get("layer"), this.get("drawType"), true, para_object.maxFeatures);

            if (initJson) {
                try {

                    if (transformWGS === true) {
                        format = new GeoJSON({
                            defaultDataProjection: "EPSG:4326"
                        });
                        // read GeoJson and transfrom the coordiantes from WGS84 to UTM
                        featJSON = format.readFeatures(initJson, {
                            dataProjection: "EPSG:4326",
                            featureProjection: "EPSG:25832"
                        });
                    }
                    else {
                        featJSON = format.readFeatures(initJson);
                    }

                    if (featJSON.length > 0) {
                        this.get("layer").setStyle(this.getStyle(para_object.drawType));
                        this.get("layer").getSource().addFeatures(featJSON);
                    }

                    if (featJSON.length > 0 && zoomToExtent === true) {
                        Radio.trigger("Map", "zoomToExtent", this.get("layer").getSource().getExtent());
                    }
                }
                catch (e) {
                    // das übergebene JSON war nicht gültig
                    Radio.trigger("Alert", "alert", this.get("geometryDrawFailed"));
                }
            }
        }
    },
    /**
     * enable editing of already drawn Features without a GUI
     * usefule for instance for the use via RemoteInterface
     * @returns {void}
     */
    editFeaturesWithoutGUI: function () {
        this.deactivateDrawInteraction();
        this.createModifyInteractionAndAddToMap(this.get("layer"), true);
    },

    /**
     * creates and returns a GeoJSON of all drawn Features without a GUI
     * returns an empty Object if no init happened previously (= no layer set)
     * by default single geometries are added to the GeoJSON
     * if geomType is set to "multiGeometry" multiGeometry Features of all drawn Features are created for each geometry type individually
     * @param {String} paraObject - an Object which includes the parameters
     *                 {String} geomType singleGeometry (default) or multiGeometry ("multiGeometry")
     *                 {Boolean} transformWGS if true, the coordinates will be transformed from WGS84 to UTM
     * @param {Feature} currentFeature last drawn feature used in drawend
     * @returns {String} GeoJSON all Features as String
     */
    downloadFeaturesWithoutGUI: function (paraObject, currentFeature = undefined) {
        let features = null,
            geomType = null,
            multiGeomFeature = null,
            circleFeature = null,
            circularPoly = null,
            featureType = null,
            singleGeom = null,
            multiGeom = null,
            featuresConverted = {"type": "FeatureCollection", "features": []},
            targetProjection = null;
        const multiPolygon = new MultiPolygon([]),
            featureArray = [],
            format = new GeoJSON(),
            multiPoint = new MultiPoint([]),
            multiLine = new MultiLine([]),
            map = Radio.request("Map", "getMap");


        if (paraObject !== undefined && paraObject.geomType === "multiGeometry") {
            geomType = "multiGeometry";
        }
        if (paraObject !== undefined && paraObject.transformWGS === true) {
            targetProjection = "EPSG:4326";
        }

        if (paraObject !== undefined && paraObject.targetProjection !== undefined) {
            targetProjection = paraObject.targetProjection;
        }

        if (this.get("layer") !== undefined && this.get("layer") !== null) {
            features = this.get("layer").getSource().getFeatures();

            if (currentFeature !== undefined) {
                features.push(currentFeature);
            }


            if (geomType === "multiGeometry") {

                features.forEach(function (item) {
                    featureType = item.getGeometry().getType();

                    if (featureType === "Polygon") {
                        if (targetProjection !== null) {
                            multiPolygon.appendPolygon(item.getGeometry().clone().transform(getMapProjection(map), targetProjection));
                        }
                        else {
                            multiPolygon.appendPolygon(item.getGeometry());
                        }
                    }
                    else if (featureType === "Point") {
                        if (targetProjection !== null) {
                            multiPoint.appendPoint(item.getGeometry().clone().transform(getMapProjection(map), targetProjection));
                        }
                        else {
                            multiPoint.appendPoint(item.getGeometry());
                        }
                    }
                    else if (featureType === "LineString") {
                        if (targetProjection !== null) {
                            multiLine.appendLineString(item.getGeometry().clone().transform(getMapProjection(map), targetProjection));
                        }
                        else {
                            multiLine.appendLineString(item.getGeometry());
                        }
                    }
                    // Circles cannot be added to a featureCollection
                    // They must therefore be converted into a polygon
                    else if (featureType === "Circle") {
                        if (targetProjection !== null) {
                            circularPoly = circPoly(item.getGeometry().clone().transform(getMapProjection(map), targetProjection), 64);
                            multiPolygon.appendPolygon(circularPoly);
                        }
                        else {
                            circularPoly = circPoly(item.getGeometry(), 64);
                            multiPolygon.appendPolygon(circularPoly);
                        }
                    }
                    else if (featureType === "MultiPolygon" || featureType === "MultiPoint" || featureType === "MultiLineString") {
                        if (targetProjection !== null) {
                            multiGeom = item.clone();
                            multiGeom.getGeometry().transform(getMapProjection(map), targetProjection);
                        }
                        else {
                            multiGeom = item;
                        }
                        featureArray.push(multiGeom);
                    }

                });

                if (multiPolygon.getCoordinates().length > 0) {
                    multiGeomFeature = new Feature(multiPolygon);
                    featureArray.push(multiGeomFeature);
                }
                if (multiPoint.getCoordinates().length > 0) {
                    multiGeomFeature = new Feature(multiPoint);
                    featureArray.push(multiGeomFeature);
                }
                if (multiLine.getCoordinates().length > 0) {
                    multiGeomFeature = new Feature(multiLine);
                    featureArray.push(multiGeomFeature);
                }
                // The features in the featureArray are converted into a feature collection.
                // Note, any text added using the draw / text tool is not included in the feature collection
                // created by writeFeaturesObject(). If any text needs to be included in the feature collection's
                // properties the feature collection needs to be created in a different way. The text content can be
                // retrieved by item.getStyle().getText().getText().
                featuresConverted = format.writeFeaturesObject(featureArray);

            }
            else {
                features.forEach(function (item) {
                    featureType = item.getGeometry().getType();

                    if (targetProjection !== null) {
                        singleGeom = item.clone();
                        singleGeom.getGeometry().transform(getMapProjection(map), targetProjection);
                    }
                    else {
                        singleGeom = item;
                    }

                    // Circles cannot be added to a featureCollection
                    // They must therefore be converted into a polygon
                    if (featureType === "Circle") {
                        circularPoly = circPoly(singleGeom.getGeometry(), 64);
                        circleFeature = new Feature(circularPoly);
                        featureArray.push(circleFeature);
                    }
                    else {
                        featureArray.push(singleGeom);
                    }
                });
                // The features in the featureArray are converted into a feature collection.
                // Note, any text added using the draw / text tool is not included in the feature collection
                // created by  writeFeaturesObject(). If any text needs to be included in the feature collection's
                // properties the feature collection needs to be created in a different way. The text content can be
                // retrieved by item.getStyle().getText().getText().
                featuresConverted = format.writeFeaturesObject(featureArray);

            }
        }

        return JSON.stringify(featuresConverted);
    },
    /**
     * sends the generated GeoJSON to the RemoteInterface in order to communicate with an iframe
     * @param {String} geomType singleGeometry (default) or multiGeometry ("multiGeometry")
     * @returns {void}
     */
    downloadViaRemoteInterface: function (geomType) {
        const result = this.downloadFeaturesWithoutGUI(geomType);

        Radio.trigger("RemoteInterface", "postMessage", {
            "downloadViaRemoteInterface": "function identifier",
            "success": true,
            "response": result
        });
    },
    /**
     * finishes the draw interaction via Radio
     * @param {String} cursor check and receive the parameter from Cockpit
     * @returns {void}
     */
    cancelDrawWithoutGUI: function (cursor) {
        this.set("withoutGUI", true);
        this.deactivateDrawInteraction();
        this.deactivateSelectInteraction();
        this.deactivateModifyInteraction();
        // Turn GFI on again after drawing
        this.setIsActive(false);
        if (cursor !== undefined && cursor.cursor) {
            $("#map").removeClass("no-cursor");
        }
    },

    /**
     * creates a vector layer for drawn features, if layer input is undefined
     * and removes this callback from the change:isCurrentWin event
     * because only one layer to be needed
     * @param {ol/layer/Vector} layer - could be undefined
     * @return {ol/layer/Vector} vectorLayer
     */
    createLayer: function (layer) {
        let vectorLayer = layer;

        if (vectorLayer === undefined) {
            vectorLayer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");
        }

        return vectorLayer;
    },

    /**
     * creates a single new draw interactions. If the drawType "Doppelkreis" is selected,
     * then two new draw interactions will be initialized.
     * @param {ol/layer/Vector} layer - the layer for the drawing.
     * @param {object} drawType - contains the geometry and description
     * @param {Boolean} isActive - true or false. Sets the draw interaction active or deactive.
     * @param {integer} maxFeatures - maximal number of features to be drawn.
     * @return {ol/layer/Vector} vectorLayer
     */
    createDrawInteractionAndAddToMap: function (layer, drawType, isActive, maxFeatures) {
        const drawInteraction1 = this.createDrawInteraction(drawType, layer),
            drawInteraction2 = this.createDrawInteraction(drawType, layer);

        this.deactivateDrawInteraction();
        this.checkAndRemovePreviousDrawInteraction();

        drawInteraction1.setActive(isActive);
        this.setDrawInteraction(drawInteraction1);
        this.createDrawInteractionListener(drawInteraction1, maxFeatures, false);
        Radio.trigger("Map", "addInteraction", drawInteraction1);

        if (drawType.text === this.get("drawDoubleCircle")) {
            drawInteraction2.setActive(isActive);
            this.setDrawInteraction2(drawInteraction2);
            this.createDrawInteractionListener(drawInteraction2, maxFeatures, true);
            Radio.trigger("Map", "addInteraction", drawInteraction2);
        }
        return [drawInteraction1, drawInteraction2];
    },

    /**
     * creates a select interaction and adds it to the map.
     * @param {ol/layer/Vector} layer - the layer for the drawing.
     * @param {Boolean} isActive - true or false. Sets the draw interaction active or deactive.
     * @return {void}
     */
    createSelectInteractionAndAddToMap: function (layer, isActive) {
        const selectInteraction = this.createSelectInteraction(layer);

        selectInteraction.setActive(isActive);
        this.setSelectInteraction(selectInteraction);
        this.createSelectInteractionListener(selectInteraction, layer);
        Radio.trigger("Map", "addInteraction", selectInteraction);
    },

    /**
     * creates a modify interaction and adds it to the map, so the features can be modified.
     * @param {ol/layer/Vector} layer - the layer for the drawing.
     * @param {Boolean} isActive - true or false. Sets the draw interaction active or deactive.
     * @return {void}
     */
    createModifyInteractionAndAddToMap: function (layer, isActive) {
        const modifyInteraction = this.createModifyInteraction(layer);

        modifyInteraction.setActive(isActive);
        this.setModifyInteraction(modifyInteraction);
        this.createModifyInteractionListener(modifyInteraction);
        Radio.trigger("Map", "addInteraction", modifyInteraction);
    },

    /**
     * Listener to change the entries for the next drawing.
     * @param {ol/interaction/Modify} modifyInteraction - modifyInteraction
     * @return {void}
     */
    createModifyInteractionListener: function (modifyInteraction) {

        modifyInteraction.on("modifyend", function (evt) {

            let geojson = {};

            // NOTE: is used only for Dipas (08-2020): inputMap contains the map
            if (typeof Config.inputMap !== "undefined") {

                geojson = this.downloadFeaturesWithoutGUI({"targetProjection": Config.inputMap.targetProjection}, evt.feature);
                Radio.trigger("RemoteInterface", "postMessage", {"drawEnd": geojson});
            }

        }.bind(this));
    },

    /**
     * creates the draw interaction to draw in the map
     * @param {object} drawType - contains the geometry and description
     * @param {ol/layer/Vector} layer - layer to draw
     * @param {array} color - of geometries
     * @return {ol/interaction/Draw} draw
     */
    createDrawInteraction: function (drawType, layer) {
        return new Draw({
            source: layer.getSource(),
            type: drawType.geometry,
            style: this.getStyle(),
            freehand: this.getFreehand()
        });
    },

    /**
     * Listener to change the entries for the next drawing.
     * @param {ol/interaction/Draw} drawInteraction - drawInteraction
     * @param {integer} maxFeatures - maximal number of features to be drawn.
     * @param {Boolean} doubleIsActive -  - Boolean to compute a double circle or single circle.
     * @return {void}
     */
    createDrawInteractionListener: function (drawInteraction, maxFeatures, doubleIsActive) {
        const that = this,
            layer = this.get("layer");
        let geojson = {};

        drawInteraction.on("drawend", function (evt) {
            evt.feature.set("styleId", that.uniqueId());

            // NOTE: is used only for Dipas (08-2020): inputMap contains the map and drawing is cancelled and editing is started
            if (typeof Config.inputMap !== "undefined") {

                that.cancelDrawWithoutGUI({cursor: "auto"});
                that.editFeaturesWithoutGUI();

                geojson = that.downloadFeaturesWithoutGUI({"targetProjection": Config.inputMap.targetProjection}, evt.feature);
                Radio.trigger("RemoteInterface", "postMessage", {"drawEnd": geojson});
            }

        });

        drawInteraction.on("drawstart", function () {
            that.drawInteractionOnDrawevent(drawInteraction, doubleIsActive, layer);
        });


        if (maxFeatures && maxFeatures > 0) {

            drawInteraction.on("drawstart", function () {
                const count = that.get("layer").getSource().getFeatures().length;
                let text = "";

                if (count > maxFeatures - 1) {
                    text = i18next.t("common:modules.tools.draw.limitReached", {count: maxFeatures});
                    Radio.trigger("Alert", "alert", text);
                    that.deactivateDrawInteraction();
                }
            }, this);
        }
        return drawInteraction;
    },

    /**
     * Updates the draw interaction if some changes are made by the user.
     * @return {void}
     */
    updateDrawInteraction: function () {
        Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
        this.createDrawInteractionAndAddToMap(this.get("layer"), this.get("drawType"), true);
    },

    /**
     * Creates and returns the ol.style
     * @param {object} drawType - contains the geometry and description
     * @param {array} color - of drawings
     * @return {ol/style/Style} style
     */
    getStyle: function () {
        const drawType = this.get("drawType"),
            color = this.get("color"),
            colorContour = this.get("colorContour"),
            text = this.get("text"),
            font = this.get("font"),
            fontSize = this.get("fontSize"),
            strokeWidth = this.get("strokeWidth"),
            radius = this.get("radius"),
            zIndex = this.get("zIndex"),
            symbol = this.get("symbol"),
            pointSize = this.get("pointSize"),
            glyphBool = symbol.type ? symbol.type !== "simple_point" : symbol.indexOf("simple_point") === -1;
        let style = new Style();

        if (drawType.hasOwnProperty("text") && drawType.text === this.get("writeText")) {
            style = this.getTextStyle(color, text, fontSize, font, 9999);
        }
        else if (drawType.hasOwnProperty("geometry") && (drawType.hasOwnProperty("text") && drawType.text === this.get("drawCircle") || drawType.text === this.get("drawDoubleCircle"))) {
            style = this.getCircleStyle(color, colorContour, strokeWidth, radius, zIndex);
        }
        // If a point should be drawn there also needs to be checked if an icon should be drawn or a simple point
        else if (drawType.hasOwnProperty("text") && drawType.text === this.get("drawPoint") && glyphBool) {
            style = this.getPointStyle(color, pointSize, symbol, zIndex);
        }
        else {
            style = this.getDrawStyle(color, drawType.geometry, strokeWidth, pointSize, zIndex, colorContour);
        }

        return style.clone();
    },

    /**
     * Creates a feature style for text and returns it
     * @param {number} color - of drawings
     * @param {string} text - of drawings
     * @param {number} fontSize - of drawings
     * @param {string} font - of drawings
     * @param {number} zIndex - zIndex of Element
     * @return {ol/style/Style} style
     */
    getTextStyle: function (color, text, fontSize, font, zIndex) {
        return new Style({
            text: new Text({
                textAlign: "left",
                text: text,
                font: fontSize + "px " + font,
                fill: new Fill({
                    color: color
                }),
                textBaseline: "bottom"
            }),
            zIndex: zIndex
        });
    },

    /**
     * Creates and returns a feature style for points, lines, or faces and returns it
     * @param {number} color - of drawings
     * @param {number} colorContour - color of the contours
     * @param {number} strokeWidth - from geometry
     * @param {number} zIndex - zIndex of Element
     * @return {ol/style/Style} style
     */
    getCircleStyle: function (color, colorContour, strokeWidth, zIndex) {
        return new Style({
            text: new Text({
                textAlign: "left",
                font: "20px Arial",
                fill: new Fill({
                    color: "#000000"
                })
            }),
            image: new Circle({
                radius: 6,
                stroke: new Stroke({
                    color: colorContour,
                    width: strokeWidth
                }),
                fill: new Fill({
                    color: color
                })
            }),
            stroke: new Stroke({
                color: colorContour,
                width: strokeWidth
            }),
            fill: new Fill({
                color: color
            }),
            zIndex: zIndex
        });
    },

    /**
     * Creates and returns a feature style for points.
     *
     * @param {Number} color - of drawings
     * @param {Number} pointSize - from geometry
     * @param {String} symbol - to be drawn consisting of value and type divided by '@@'
     * @param {Number} zIndex - of Element
     * @return {ol/style/Style} style
     * @throws Error if the type of the symbol is not supported.
     */
    getPointStyle: function (color, pointSize, symbol, zIndex) {
        let style,
            sym = [];

        // sym[0] = value, sym[1] = type
        // Different ways of creatin the array occur because of needed parsing for the combobox.
        // However, the data is normally saved as an object
        if (typeof symbol === "string") {
            sym = symbol.split("@@");
        }
        else {
            sym[0] = symbol.value;
            sym[1] = symbol.type;
        }

        if (sym[1] === "glyphicon") {
            style = new Style({
                text: new Text({
                    text: sym[0],
                    font: "normal " + pointSize + "px \"Glyphicons Halflings\"",
                    fill: new Fill({
                        color: color
                    })
                }),
                zIndex: zIndex
            });
        }
        // The Size of the image needs to be fixed. As the example picture has a width / height of 96, this is used.
        // To use the opacity given by the color parameter it has to be separately added
        else if (sym[1] === "image") {
            style = new Style({
                image: new Icon({
                    src: sym[0],
                    scale: 1 / (96 / pointSize),
                    opacity: color[3],
                    color: color.slice(0, 3)
                }),
                zIndex: zIndex
            });
        }
        else {
            throw new Error(`The given type ${sym[1]} of the symbol is not supported!`);
        }
        return style;
    },

    /**
     * Returns the boolean value for whether the lines should be drawn smooth or not
     * @return {boolean} smooth or naw
     */
    getFreehand: function () {
        return this.get("freehand");
    },

    /**
     * Creates and returns a feature style for points, lines, or polygon and returns it
     * @param {number} color - of drawings
     * @param {string} drawGeometryType - geometry type of drawings
     * @param {number} strokeWidth - from geometry
     * @param {number} pointSize - from geometry
     * @param {number} zIndex - zIndex of Element
     * @param {number} colorContour - color of the contours
     * @return {ol/style/Style} style
     */
    getDrawStyle: function (color, drawGeometryType, strokeWidth, pointSize, zIndex, colorContour) {
        return new Style({
            fill: new Fill({
                color: color
            }),
            stroke: new Stroke({
                color: colorContour,
                width: strokeWidth
            }),
            image: new Circle({
                radius: drawGeometryType === "Point" ? pointSize / 2 : 6,
                fill: new Fill({
                    color: drawGeometryType === "Point" ? color : colorContour
                })
            }),
            zIndex: zIndex
        });
    },

    /**
     * resets the module to its initial state
     * @return {void}
     */
    resetModule: function () {
        const defaultColor = this.defaults.color,
            defaultColorContour = this.defaults.colorContour;

        defaultColor[3] = this.defaults.opacity;
        defaultColorContour[3] = this.defaults.opacityContour;

        this.deactivateDrawInteraction();
        this.deactivateModifyInteraction();
        this.deactivateSelectInteraction();

        this.setRadius(this.defaults.radius);
        this.setCircleRadius(this.defaults.circleRadiusInner);
        this.setCircleRadiusOuter(this.defaults.circleRadiusOuter);
        this.setOpacity(this.defaults.opacity);
        this.setColor(defaultColor);
        this.setFreehand(true);
        this.setColorContour(defaultColorContour);
        this.setDrawType(this.defaults.drawType.geometry, this.defaults.drawType.text);
        this.combineColorOpacityContour(this.defaults.opacityContour);
    },

    /**
     * creates and sets an interaction for selecting vector features
     * @param {ol/layer/Vector} layer - for the selected(deleted) features
     * @returns {void}
     */
    startSelectInteraction: function (layer) {
        const selectInteraction = this.createSelectInteraction(layer);

        this.createSelectInteractionListener(selectInteraction, layer);
        this.setSelectInteraction(selectInteraction);
    },

    /**
     * creates an interaction for selecting vector features
     * @param {ol/layer/Vector} layer - for the selected(deleted) features
     * @return {ol/interaction/Select} selectInteraction
     */
    createSelectInteraction: function (layer) {
        return new Select({
            layers: [layer]
        });
    },

    /**
     * craete an listener for select interaction
     * @param {ol/interaction/Select} selectInteraction - selectInteraction
     * @param {ol/layer/Vector} layer - for the selected(deleted) features
     * @return {void}
     */
    createSelectInteractionListener: function (selectInteraction, layer) {
        selectInteraction.on("select", function (evt) {
            // remove feature from source
            layer.getSource().removeFeature(evt.selected[0]);
            // remove feature from interaction
            this.getFeatures().clear();
        });
    },

    /**
     * creates and sets a interaction for modify vector features
     * @param {ol/layer/Vector} layer - for the selected(deleted) features
     * @returns {void}
     */
    createModifyInteraction: function (layer) {
        return new Modify({
            source: layer.getSource()
        });
    },

    /**
     * deletes all geometries from the layer
     * @return {void}
     */
    deleteFeatures: function () {
        this.get("layer").getSource().clear();
    },

    /**
     * toggle between modify, trash and draw modes
     * @param {string} mode - from active button
     * @return {void}
     */
    toggleInteraction: function (mode) {
        if (mode.indexOf("modify") !== -1) {
            this.deactivateDrawInteraction();
            this.activateModifyInteraction();
            this.disAbleAllDrawOptions(true);
        }
        else if (mode.indexOf("trash") !== -1) {
            this.deactivateDrawInteraction();
            this.deactivateModifyInteraction();
            this.activateSelectInteraction();
        }
        else if (mode.indexOf("draw") !== -1) {
            this.disAbleAllDrawOptions(false);
            this.deactivateModifyInteraction();
            this.deactivateSelectInteraction();
            this.activateDrawInteraction();
        }
    },

    /**
     * activate draw interaction
     * @return {void}
     */
    activateDrawInteraction: function () {
        if (this.get("drawInteraction") !== undefined) {
            this.get("drawInteraction").setActive(true);
        }
        if (this.get("drawInteraction2") !== undefined) {
            this.get("drawInteraction2").setActive(true);
        }
    },

    /**
     * deactivates draw interaction
     * @return {void}
     */
    deactivateDrawInteraction: function () {
        if (this.get("drawInteraction") !== undefined) {
            this.get("drawInteraction").setActive(false);
        }
        if (this.get("drawInteraction2") !== undefined) {
            this.get("drawInteraction2").setActive(false);
        }
    },

    /**
     * removes previous draw interaction
     * @return {void}
     */
    checkAndRemovePreviousDrawInteraction: function () {
        if (this.get("drawInteraction") !== undefined) {
            this.setDrawInteraction(undefined);
        }
        if (this.get("drawInteraction2") !== undefined) {
            this.setDrawInteraction2(undefined);
        }
    },

    /**
     * activate modify interaction
     * and change glyphicon to wrench
     * @return {void}
     */
    activateModifyInteraction: function () {
        if (this.get("modifyInteraction") !== undefined) {
            this.get("modifyInteraction").setActive(true);
            this.putGlyphToCursor("glyphicon glyphicon-wrench");
        }
    },

    /**
     * deactivate modify interaction
     * and change glyphicon to pencil
     * @return {void}
     */
    deactivateModifyInteraction: function () {
        if (this.get("modifyInteraction") !== undefined) {
            this.get("modifyInteraction").setActive(false);
            this.putGlyphToCursor("glyphicon glyphicon-pencil");
        }
    },

    /**
     * activate selct interaction
     * and change glyphicon to trash
     * @return {void}
     */
    activateSelectInteraction: function () {
        this.get("selectInteraction").setActive(true);
        this.putGlyphToCursor("glyphicon glyphicon-trash");
    },

    /**
     * deactivate selct interaction
     * and change glyphicon to pencil
     * @return {void}
     */
    deactivateSelectInteraction: function () {
        if (this.get("selectInteraction") !== undefined) {
            this.get("selectInteraction").setActive(false);
            this.putGlyphToCursor("glyphicon glyphicon-pencil");
        }
    },

    /**
     * Creates an HTML element,
     * puts the glyph icon there and sticks it to the cursor
     * @param {string} glyphicon - of the mouse
     * @return {void}
     */
    putGlyphToCursor: function (glyphicon) {
        if (glyphicon.indexOf("trash") !== -1 || glyphicon.indexOf("wrench") !== -1) {
            $("#map").removeClass("no-cursor");
            $("#map").addClass("cursor-crosshair");
        }
        else {
            $("#map").removeClass("cursor-crosshair");
            $("#map").addClass("no-cursor");
        }

        $("#cursorGlyph").removeClass();
        $("#cursorGlyph").addClass(glyphicon);
    },

    /**
     * Starts the download tool
     * @returns {void}
     */
    startDownloadTool: function () {
        const features = this.get("layer").getSource().getFeatures();

        Radio.trigger("Download", "start", {
            features: features,
            formats: ["KML", "GEOJSON", "GPX"]
        });
    },
    /*
     * Deletes the last element in the feature array in "layer"
     * @returns {void}
     */
    undoLastStep: function () {
        const features = this.get("layer").getSource().getFeatures(),
            featureToRemove = features[features.length - 1];

        if (featureToRemove) {
            this.updateRedoArray(featureToRemove, false);
            this.get("layer").getSource().removeFeature(featureToRemove);
        }
    },

    /*
     * restores the last deleted element to the feature array in "layer"
     * @returns {void}
     */
    redoLastStep: function () {
        const redoArray = this.get("redoArray"),
            featureToRestore = redoArray[redoArray.length - 1];

        if (featureToRestore) {
            const featureId = this.get("fId"),
                featureStyle = featureToRestore.getStyle();

            featureToRestore.setId(featureId);
            this.countupFId();
            this.get("layer").getSource().addFeature(featureToRestore);
            this.get("layer").getSource().getFeatureById(featureId).setStyle(featureStyle);
            this.updateRedoArray(undefined, true);
        }
    },

    /**
     * adds or removes one element from the redoArray
     * @param {object} feature - feature to be added to the array
     * @param {boolean} remove - if true: remove one object
     * @return {void}
     */
    updateRedoArray: function (feature, remove) {
        const redoArray = this.get("redoArray");

        if (remove) {
            redoArray.pop();
        }
        else {
            redoArray.push(feature);
        }
        this.setRedoArray(redoArray);
    },

    /**
     * activate the method "defined", to define a circle by diameter.
     * @param {boolean} deEnable - true or false to enable or disable.
     * @return {void}
     */
    enableMethodDefined: function (deEnable) {
        if ($(".dropdownUnit select")[0] !== undefined && $(".circleRadiusInner input")[0] !== undefined) {
            $(".dropdownUnit select")[0].disabled = deEnable;
            $(".circleRadiusInner input")[0].disabled = deEnable;
        }
    },

    /**
     * enables or disables the input/select options
     * @param {boolean} disAble - true or false to disable or enable.
     * @return {void}
     */
    disAbleAllDrawOptions: function (disAble) {
        $(".text input")[0].disabled = disAble;
        $(".font-size select")[0].disabled = disAble;
        $(".font select")[0].disabled = disAble;
        $(".radius select")[0].disabled = disAble;
        $(".dropdownMethod select")[0].disabled = disAble;
        $(".circleRadiusOuter input")[0].disabled = disAble;
        $(".stroke-width select")[0].disabled = disAble;
        $(".opacity select")[0].disabled = disAble;
        $(".opacityContour select")[0].disabled = disAble;
        $(".color select")[0].disabled = disAble;
        $(".colorContour select")[0].disabled = disAble;
        $(".symbol select")[0].disabled = disAble;
        $(".pointSize select")[0].disabled = disAble;
        if (disAble === false && this.get("methodCircle") === "defined") {
            this.enableMethodDefined(disAble);
        }
        else {
            this.enableMethodDefined(true);
        }
    },

    /**
     * Function to adjust the value / radius to the units meters or kilometers.
     * @param {string} diameter - diameter of the circle.
     * @param {string} unit - unit of thfe diameter.
     * @return {string} - returns value / string without comma.
     */
    adjustValueToUnits: function (diameter, unit) {
        return unit === "km" ? diameter * 1000 : diameter;
    },

    /**
     * Function to add the information about the opacity to the colorcode.
     * @param {Number} value - the opacity as value.
     * @return {void}
     */
    combineColorOpacityContour: function (value) {
        const newColor = this.get("colorContour"),
            drawType = this.get("drawType");

        if (drawType.geometry === "LineString") {
            newColor[3] = parseFloat(value);
            this.setOpacityContour(value);
        }
        else {
            newColor[3] = parseFloat(this.defaults.opacityContour);
            this.setOpacityContour(this.defaults.opacityContour);
        }
        this.setColorContour(newColor);
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
     * setter for drawType
     * @param {string} value1 - geometry type
     * @param {string} value2 - text
     * @return {void}
     */
    setDrawType: function (value1, value2) {
        if (value2 !== undefined) {
            if (value2 !== this.get("drawDoubleCircle")) {
                $(".input-method").val("interactiv");
                this.enableMethodDefined(true);
                this.setMethodCircle("interactiv");
            }
            else {
                this.enableMethodDefined(false);
                this.setMethodCircle("defined");
            }
        }
        this.combineColorOpacityContour(this.defaults.opacityContour);
        this.set("drawType", {geometry: value1, text: value2});
    },

    /**
     * setter for symbol
     * @param {Object|String} value - symbol with value, caption and type
     * @return {void}
     */
    setSymbol: function (value) {
        this.set("symbol", value);
    },

    /**
     * setter for pointSize
     * @param {*} value - pointSize
     * @return {void}
     */
    setPointSize: function (value) {
        this.set("pointSize", parseInt(value, 10));
    },

    /**
     * setter for font
     * @param {string} value - font
     * @return {void}
     */
    setFont: function (value) {
        this.set("font", value);
    },

    /**
     * setter for fontSize
     * @param {number} value - fontSize
     * @return {void}
     */
    setFontSize: function (value) {
        this.set("fontSize", value);
    },

    /**
     * setter for color
     * @param {array} value - color
     * @return {void}
     */
    setColor: function (value) {
        if (value === null) {
            this.set("color", this.defaults.color);
        }
        else {
            this.set("color", value);
        }
    },

    /**
     * setter for freehand
     * @param {boolean} value - smooth or naw
     * @return {void}
     */
    setFreehand: function (value) {
        this.set("freehand", value);
    },

    /**
     * setter for redoArray
     * @param {array} value - new redoArray
     * @return {void}
     */
    setRedoArray (value) {
        this.set("redoArray", value);
    },

    /**
     * setter for color
     * @param {array} value - color
     * @return {void}
     */
    setColorContour: function (value) {
        this.set("colorContour", value);
    },

    /**
     * setter for the opacity of the fill-color
     * @param {number} value - opacity
     * @return {void}
     */
    setOpacity: function (value) {
        const newColor = this.get("color");

        newColor[3] = parseFloat(value);
        this.setColor(newColor);
        this.set("opacity", value);
    },

    /**
     * setter for the opacity of the contour-color, if drawtype line is selected.
     * @param {number} value - opacity
     * @return {void}
     */
    setOpacityContour: function (value) {
        this.set("opacityContour", value);
    },

    /**
     * setter for text
     * @param {string} value - text
     * @return {void}
     */
    setText: function (value) {
        this.set("text", value);
    },

    /**
     * setter for radius
     * @param {number} value - radius
     * @return {void}
     */
    setRadius: function (value) {
        this.set("radius", parseInt(value, 10));
    },

    /**
     * setter for strokeWidth
     * @param {number} value - strokeWidth
     * @return {void}
     */
    setStrokeWidth: function (value) {
        this.set("strokeWidth", parseInt(value, 10));
    },

    /**
     * setter for radius
     * @param {number} value - radius
     * @return {void}
     */
    setCircleRadius: function (value) {
        const valueRadius = this.adjustValueToUnits(value, this.get("unit"));

        this.set("circleRadiusInner", parseFloat(valueRadius));
    },

    /**
     * setter for outer radius
     * @param {number} value - radius
     * @return {void}
     */
    setCircleRadiusOuter: function (value) {
        const valueRadius = this.adjustValueToUnits(value, this.get("unit"));

        this.set("circleRadiusOuter", parseFloat(valueRadius));
    },

    /**
     * Setter for unit
     * @param {string} value - m/km
     * @returns {void}
     */
    setUnit: function (value) {
        this.set("unit", value);
    },

    /**
     * Setter for the method to draw a circle.
     * @param {string} value - interactive or defined
     * @returns {void}
     */
    setMethodCircle: function (value) {
        this.set("methodCircle", value);
    },

    /**
     * setter for a draw feature to eventual delete it in
     * another iteration.
     * @param {Object} value - Draw-event-feature.
     * @return {void}
     */
    setEventualFeatureToDelete: function (value) {
        this.set("eventualFeatureToDelete", value);
    },

    /**
     * setter for layer
     * @param {ol/layer/Vector} value - layer
     * @return {void}
     */
    setLayer: function (value) {
        this.set("layer", value);
    },

    /**
     * setter for selectInteraction
     * @param {ol/interaction/select} value - selectInteraction
     * @return {void}
     */
    setSelectInteraction: function (value) {
        this.set("selectInteraction", value);
    },

    /**
     * setter for drawInteraction
     * @param {ol/interaction/Draw} value - drawInteraction
     * @return {void}
     */
    setDrawInteraction: function (value) {
        this.set("drawInteraction", value);
    },

    /**
     * setter for drawInteraction
     * @param {ol/interaction/Draw} value - drawInteraction
     * @return {void}
     */
    setDrawInteraction2: function (value) {
        this.set("drawInteraction2", value);
    },
    /**
     * setter for modifyInteraction
     * @param {ol/interaction/modify} value - modifyInteraction
     * @return {void}
     */
    setModifyInteraction: function (value) {
        this.set("modifyInteraction", value);
    },

    /**
     * setter for addFeatureListener
     * @param {object} value - addFeatureListener
     * @return {void}
     */
    setAddFeatureListener: function (value) {
        this.set("addFeatureListener", value);
    },

    /*
    * count up zIndex
    * @returns {void}
    */
    countupZIndex: function () {
        const value = this.get("zIndex") + 1;

        this.setZIndex(value);
    },

    /*
    * setter for zIndex
    * @param {number} value zIndex
    * @returns {void}
    */
    setZIndex: function (value) {
        this.set("zIndex", value);
    },

    /*
    * count up fId
    * @returns {void}
    */
    countupFId: function () {
        const value = this.get("fId") + 1;

        this.setFId(value);
    },

    /*
    * setter for fId
    * @param {number} value fId
    * @returns {void}
    */
    setFId: function (value) {
        this.set("fId", value);
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

export default DrawTool;
