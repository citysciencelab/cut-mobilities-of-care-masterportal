import {Select, Modify, Draw} from "ol/interaction.js";
import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import {GeoJSON} from "ol/format.js";
import MultiPolygon from "ol/geom/MultiPolygon.js";
import MultiPoint from "ol/geom/MultiPoint.js";
import MultiLine from "ol/geom/MultiLineString.js";
import {fromCircle as circPoly} from "ol/geom/Polygon.js";
import Feature from "ol/Feature";
import Tool from "../../core/modelList/tool/model";

const DrawTool = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        drawInteraction: undefined,
        selectInteraction: undefined,
        modifyInteraction: undefined,
        layer: undefined,
        font: "Arial",
        fontSize: 10,
        text: "Klicken Sie auf die Karte um den Text zu platzieren",
        color: [55, 126, 184, 1],
        radius: 6,
        strokeWidth: 1,
        opacity: 1,
        drawType: {
            geometry: "Point",
            text: "Punkt zeichnen"
        },
        renderToWindow: true,
        deactivateGFI: true,
        glyphicon: "glyphicon-pencil",
        addFeatureListener: {},
        zIndex: 0
    }),

    /**
     * create a DrawTool instance
     * @return {void}
     */
    initialize: function () {
        const channel = Radio.channel("Draw");

        this.superInitialize();

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
                var layer = model.createLayer(model.get("layer"));

                if (value) {
                    this.setLayer(layer);
                    this.createDrawInteractionAndAddToMap(layer, this.get("drawType"), true);
                    this.createSelectInteractionAndAddToMap(layer, false);
                    this.createModifyInteractionAndAddToMap(layer, false);
                    this.off(this);
                    this.createSourceListenerForStyling(layer);
                }
            }
        });
        Radio.trigger("RemoteInterface", "postMessage", {"initDrawTool": true});
    },

    /**
     * Creates an addfeature-Listener
     * @param   {ol.layer} layer Layer, to which the Listener is registered
     * @returns {void}
     */
    createSourceListenerForStyling: function (layer) {
        var layerSource = layer.getSource();

        this.setAddFeatureListener(layerSource.on("addfeature", function (evt) {
            evt.feature.setStyle(this.getStyle());
            this.countupZIndex();
        }.bind(this)));
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
        var featJSON,
            newColor,
            format = new GeoJSON(),
            initJson = para_object.initialJSON,
            zoomToExtent = para_object.zoomToExtent,
            transformWGS = para_object.transformWGS;

        if (this.collection) {
            this.collection.setActiveToolsToFalse(this);
        }

        this.set("renderToWindow", false);
        this.setIsActive(true);

        if ($.inArray(para_object.drawType, ["Point", "LineString", "Polygon", "Circle"]) > -1) {
            this.setDrawType(para_object.drawType, para_object.drawType + " zeichnen");
            if (para_object.color) {
                this.set("color", para_object.color);
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
                    Radio.trigger("Alert", "alert", "Die übergebene Geometrie konnte nicht dargestellt werden.");
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
     * @param {String} para_object - an Object which includes the parameters
     *                 {String} geomType singleGeometry (default) or multiGeometry ("multiGeometry")
     *                 {Boolean} transformWGS if true, the coordinates will be transformed from WGS84 to UTM
     * @returns {String} GeoJSON all Features as String
     */
    downloadFeaturesWithoutGUI: function (para_object) {
        var features = null,
            format = new GeoJSON(),
            geomType = null,
            transformWGS = null,
            multiPolygon = new MultiPolygon([]),
            multiPoint = new MultiPoint([]),
            multiLine = new MultiLine([]),
            multiGeomFeature = null,
            circleFeature = null,
            circularPoly = null,
            featureType = null,
            featureArray = [],
            singleGeom = null,
            multiGeom = null,
            featuresConverted = {"type": "FeatureCollection", "features": []};

        if (!_.isUndefined(para_object) && para_object.geomType === "multiGeometry") {
            geomType = "multiGeometry";
        }
        if (!_.isUndefined(para_object) && para_object.transformWGS === true) {
            transformWGS = true;
        }

        if (!_.isUndefined(this.get("layer")) && !_.isNull(this.get("layer"))) {
            features = this.get("layer").getSource().getFeatures();

            if (geomType === "multiGeometry") {

                _.each(features, function (item) {
                    featureType = item.getGeometry().getType();

                    if (featureType === "Polygon") {
                        if (transformWGS === true) {
                            multiPolygon.appendPolygon(item.getGeometry().clone().transform("EPSG:25832", "EPSG:4326"));
                        }
                        else {
                            multiPolygon.appendPolygon(item.getGeometry());
                        }
                    }
                    else if (featureType === "Point") {
                        if (transformWGS === true) {
                            multiPoint.appendPoint(item.getGeometry().clone().transform("EPSG:25832", "EPSG:4326"));
                        }
                        else {
                            multiPoint.appendPoint(item.getGeometry());
                        }
                    }
                    else if (featureType === "LineString") {
                        if (transformWGS === true) {
                            multiLine.appendLineString(item.getGeometry().clone().transform("EPSG:25832", "EPSG:4326"));
                        }
                        else {
                            multiLine.appendLineString(item.getGeometry());
                        }
                    }
                    // Circles cannot be added to a featureCollection
                    // They must therefore be converted into a polygon
                    else if (featureType === "Circle") {
                        if (transformWGS === true) {
                            circularPoly = circPoly(item.getGeometry().clone().transform("EPSG:25832", "EPSG:4326"), 64);
                            multiPolygon.appendPolygon(circularPoly);
                        }
                        else {
                            circularPoly = circPoly(item.getGeometry(), 64);
                            multiPolygon.appendPolygon(circularPoly);
                        }
                    }
                    else if (featureType === "MultiPolygon" || featureType === "MultiPoint" || featureType === "MultiLineString") {
                        if (transformWGS === true) {
                            multiGeom = item.clone();
                            multiGeom.getGeometry().transform("EPSG:25832", "EPSG:4326");
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
                _.each(features, function (item) {
                    featureType = item.getGeometry().getType();

                    if (transformWGS === true) {
                        singleGeom = item.clone();
                        singleGeom.getGeometry().transform("EPSG:25832", "EPSG:4326");
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
        var result = this.downloadFeaturesWithoutGUI(geomType);

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
        this.deactivateDrawInteraction();
        this.deactivateSelectInteraction();
        this.deactivateModifyInteraction();
        this.resetModule();
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
        var vectorLayer = layer;

        if (_.isUndefined(vectorLayer)) {
            vectorLayer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");
        }

        return vectorLayer;
    },
    createDrawInteractionAndAddToMap: function (layer, drawType, isActive, maxFeatures) {
        var drawInteraction = this.createDrawInteraction(drawType, layer);

        drawInteraction.setActive(isActive);
        this.setDrawInteraction(drawInteraction);
        this.createDrawInteractionListener(drawInteraction, maxFeatures);
        Radio.trigger("Map", "addInteraction", drawInteraction);
    },
    createSelectInteractionAndAddToMap: function (layer, isActive) {
        var selectInteraction = this.createSelectInteraction(layer);

        selectInteraction.setActive(isActive);
        this.setSelectInteraction(selectInteraction);
        this.createSelectInteractionListener(selectInteraction, layer);
        Radio.trigger("Map", "addInteraction", selectInteraction);
    },
    createModifyInteractionAndAddToMap: function (layer, isActive) {
        var modifyInteraction = this.createModifyInteraction(layer);

        modifyInteraction.setActive(isActive);
        this.setModifyInteraction(modifyInteraction);
        Radio.trigger("Map", "addInteraction", modifyInteraction);
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
            style: this.getStyle()
        });
    },

    /**
     * lister to change the entries for the next drawing
     * @param {ol/interaction/Draw} drawInteraction - drawInteraction
     * @param {integer} maxFeatures - maximal number of features to be drawn
     * @return {void}
     */
    createDrawInteractionListener: function (drawInteraction, maxFeatures) {
        var that = this;

        drawInteraction.on("drawend", function (evt) {
            evt.feature.set("styleId", _.uniqueId());
        });

        if (maxFeatures && maxFeatures > 0) {

            drawInteraction.on("drawstart", function () {
                var count = that.get("layer").getSource().getFeatures().length,
                    text = "";

                if (count > maxFeatures - 1) {
                    text = "Sie haben bereits " + maxFeatures + " Objekte gezeichnet, bitte löschen Sie erst eines, bevor Sie fortfahren!";
                    if (maxFeatures === 1) {
                        text = "Sie haben bereits " + maxFeatures + " Objekt gezeichnet, bitte löschen Sie dieses, bevor Sie fortfahren!";
                    }

                    Radio.trigger("Alert", "alert", text);
                    that.deactivateDrawInteraction();
                }
            }, this);
        }
    },
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
        var style = new Style(),
            drawType = this.get("drawType"),
            color = this.get("color"),
            text = this.get("text"),
            font = this.get("font"),
            fontSize = this.get("fontSize"),
            strokeWidth = this.get("strokeWidth"),
            radius = this.get("radius"),
            zIndex = this.get("zIndex");

        if (_.has(drawType, "text") && drawType.text === "Text schreiben") {
            style = this.getTextStyle(color, text, fontSize, font, 9999);
        }
        else if (_.has(drawType, "geometry") && drawType.geometry) {
            style = this.getDrawStyle(color, drawType.geometry, strokeWidth, radius, zIndex);
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
                })
            }),
            zIndex: zIndex
        });
    },

    /**
     * Creates and returns a feature style for points, lines, or faces and returns it
     * @param {number} color - of drawings
     * @param {string} drawGeometryType - geometry type of drawings
     * @param {number} strokeWidth - from geometry
     * @param {number} radius - from geometry
     * @param {number} zIndex - zIndex of Element
     * @return {ol/style/Style} style
     */
    getDrawStyle: function (color, drawGeometryType, strokeWidth, radius, zIndex) {
        return new Style({
            fill: new Fill({
                color: color
            }),
            stroke: new Stroke({
                color: color,
                width: strokeWidth
            }),
            image: new Circle({
                radius: drawGeometryType === "Point" ? radius : 6,
                fill: new Fill({
                    color: color
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
        const defaultColor = this.defaults.color;

        defaultColor.pop();
        defaultColor.push(this.defaults.opacity);

        this.deactivateDrawInteraction();
        this.deactivateModifyInteraction();
        this.deactivateSelectInteraction();

        this.setRadius(this.defaults.radius);
        this.setOpacity(this.defaults.opacity);
        this.setColor(defaultColor);

        this.setDrawType(this.defaults.drawType.geometry, this.defaults.drawType.text);
    },

    /**
     * creates and sets an interaction for selecting vector features
     * @param {ol/layer/Vector} layer - for the selected(deleted) features
     * @returns {void}
     */
    startSelectInteraction: function (layer) {
        var selectInteraction = this.createSelectInteraction(layer);

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
        }
        else if (mode.indexOf("trash") !== -1) {
            this.deactivateDrawInteraction();
            this.deactivateModifyInteraction();
            this.activateSelectInteraction();
        }
        else if (mode.indexOf("draw") !== -1) {
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
        if (!_.isUndefined(this.get("drawInteraction"))) {
            this.get("drawInteraction").setActive(true);
        }
    },

    /**
     * deactivates draw interaction
     * @return {void}
     */
    deactivateDrawInteraction: function () {
        if (!_.isUndefined(this.get("drawInteraction"))) {
            this.get("drawInteraction").setActive(false);
        }
    },

    /**
     * activate modify interaction
     * and change glyphicon to wrench
     * @return {void}
     */
    activateModifyInteraction: function () {
        if (!_.isUndefined(this.get("modifyInteraction"))) {
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
        if (!_.isUndefined(this.get("modifyInteraction"))) {
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
        if (!_.isUndefined(this.get("selectInteraction"))) {
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
        if (glyphicon.indexOf("trash") !== -1) {
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
        var features = this.get("layer").getSource().getFeatures();

        Radio.trigger("download", "start", {
            data: features,
            formats: ["kml"],
            caller: {
                name: "draw",
                glyph: "glyphicon-pencil"
            }});
    },

    /**
     * setter for drawType
     * @param {string} value1 - geometry
     * @param {string} value2 - text
     * @return {void}
     */
    setDrawType: function (value1, value2) {
        this.set("drawType", {geometry: value1, text: value2});
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
        this.set("color", value);
    },

    /**
     * setter for opacity
     * @param {number} value - opacity
     * @return {void}
     */
    setOpacity: function (value) {
        this.set("opacity", value);
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
        var value = this.get("zIndex") + 1;

        this.setZIndex(value);
    },

    /*
    * setter for zIndex
    * @param {number} value zIndex
    * @returns {void}
    */
    setZIndex: function (value) {
        this.set("zIndex", value);
    }
});

export default DrawTool;
