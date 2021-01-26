import {Circle as CircleStyle, Fill, Stroke, Style, Icon, Text} from "ol/style.js";

const VectorStyleModel = Backbone.Model.extend(/** @lends VectorStyleModel.prototype */{
    defaults: {
        "imagePath": "",
        "class": "POINT",
        "subClass": "SIMPLE",
        "styleField": "",
        "styleFieldValues": [],
        "maxRangeAttribute": false,
        "minRangeAttribute": 0,
        "labelField": "",
        // für subclass SIMPLE
        "imageName": "blank.png",
        "imageWidth": 1,
        "imageHeight": 1,
        "imageScale": 1,
        "imageOffsetX": 0.5,
        "imageOffsetY": 0.5,
        "imageOffsetXUnit": "fraction",
        "imageOffsetYUnit": "fraction",
        // für subclass CIRCLE
        "circleRadius": 10,
        "circleFillColor": [0, 153, 255, 1],
        "circleStrokeColor": [0, 0, 0, 1],
        "circleStrokeWidth": 2,
        // Für Label
        "textAlign": "center",
        "textFont": "10px sans-serif",
        "textScale": 1,
        "textOffsetX": 0,
        "textOffsetY": 0,
        "textFillColor": [255, 255, 255, 1],
        "textStrokeColor": [0, 0, 0, 1],
        "textStrokeWidth": 3,
        // Für Cluster
        "clusterClass": "CIRCLE",
        // Für Cluster Class CIRCLE
        "clusterCircleRadius": 10,
        "clusterCircleFillColor": [0, 153, 255, 1],
        "clusterCircleStrokeColor": [0, 0, 0, 1],
        "clusterCircleStrokeWidth": 2,
        // Für Cluster Class SIMPLE
        "clusterImageName": "blank.png",
        "clusterImageWidth": 1,
        "clusterImageHeight": 1,
        "clusterImageScale": 1,
        "clusterImageOffsetX": 0.5,
        "clusterImageOffsetY": 0.5,
        // Für Cluster Text
        "clusterText": "COUNTER",
        "clusterTextAlign": "center",
        "clusterTextFont": "Courier",
        "clusterTextScale": 1,
        "clusterTextOffsetX": 0,
        "clusterTextOffsetY": 0,
        "clusterTextFillColor": [255, 255, 255, 1],
        "clusterTextStrokeColor": [0, 0, 0, 1],
        "clusterTextStrokeWidth": 3,
        // Für Polygon
        "polygonFillColor": [255, 255, 255, 1],
        "polygonStrokeColor": [0, 0, 0, 1],
        "polygonStrokeWidth": 2,
        // Für Line
        "lineStrokeColor": [0, 0, 0, 1],
        "lineStrokeWidth": 2,
        "lineStrokeDash": undefined,
        // Für subClass ADVANCED
        // Für scalingShape CIRCLESEGMENTS
        "circleSegmentsRadius": 10,
        "circleSegmentsStrokeWidth": 4,
        "circleSegmentsBackgroundColor": [255, 255, 255, 0],
        "scalingValueDefaultColor": [0, 0, 0, 1],
        "circleSegmentsGap": 10,
        // Für scalingShape CIRCLE_BAR
        "circleBarScalingFactor": 1,
        "circleBarRadius": 6,
        "circleBarLineStroke": 5,
        "circleBarCircleFillColor": [0, 0, 0, 1],
        "circleBarCircleStrokeColor": [0, 0, 0, 1],
        "circleBarCircleStrokeWidth": 1,
        "circleBarLineStrokeColor": [0, 0, 0, 1],
        // legendInfos
        "legendInfos": []
    },

    /**
     * @class VectorStyleModel
     * @extends Backbone.Model
     * @memberof VectorStyle
     * @constructs
     * @deprecated since new styleModel. Should be removed with version 3.0.
     * @description Style model to create an open layers vector style for each opbject in style.json.
     * @param {String} [imagePath=""] Path to images.
     * @param {String} [class="POINT"] Class of style. Matches the geometry
     * @param {String} [subClass="SIMPLE"] SubClass of style.
     * @param {String|Object} [styleField=""] Attribute name to be styled with. Or object with name or condition.
     * @param {Object[]} [styleFieldValues=[]] Values of attribute name with its style definition.
     * @param {String|Number|Boolean} [maxRangeAttribute=false] if String: the features attribute to get the maximum value for a range from; if number: the maximum value in itself; if false: no maximum value, therefore no relative range
     * @param {String|Number} [minRangeAttribute=0] only taken into effekt if maxRangeAttribute is given; if String: the features attribute to get the minimum value for a range from; if number: the minimum value in itslef;
     * @param {String} [labelField=""] Attribute name to create style label.
     * @param {String} [imageName="blank.png"] Name of image. Is used with imagePath.
     * @param {Number} [imageWidth=1] Width of image in px.
     * @param {Number} [imageHeight=1] Height of image in px.
     * @param {Number} [imageScale=1] Scale of image.
     * @param {Number} [imageOffsetX=0.5] horizontal offset of image.
     * @param {Number} [imageOffsetY=0.5] vertical offset of image.
     * @param {String} [imageOffsetXUnit="fraction"] Unit of horizontal offset of image.
     * @param {String} [imageOffsetYUnit="fraction"] Unit of vertical offset of image.
     * @param {Number} [circleRadius=10] Radius of Circle in px.
     * @param {Number[]} [circleFillColor=[0,153,255,1]] Fill color of Circle in rgba-format.
     * @param {Number[]} [circleStrokeColor=[0,0,0,1]] Stroke color of Circle in rgba-format.
     * @param {Number} [circleStrokeWidth=2] Stroke width of circle.
     * @param {String} [textAlign="center"] Alignment of text.
     * @param {String} [textFont="10px sans-serif"] Font of text.
     * @param {Number} [textScale=1] Scale of text.
     * @param {Number} [textOffsetX=0] Horizontal offset of text.
     * @param {Number} [textOffsetY=0] Vertical offset of text.
     * @param {Number[]} [textFillColor=[255,255,255,1]] Fill color of test in rgba-format.
     * @param {Number[]} [textStrokeColor=[0,0,0,1]] Stroke color of text in rgba-format.
     * @param {Number} [textStrokeWidth=3] Stroke width of text.
     * @param {String} [clusterClass="CIRCLE"] Class for clustered feature.
     * @param {Number} [clusterCircleRadius=10] Circle radius for clustered feature.
     * @param {Number[]} [clusterCircleFillColor=[0,153,255,1]] Fill color of circle for clustered feature in rgba-format.
     * @param {Number[]} [clusterCircleStrokeColor=[0,0,0,1]] Stroke color of circle for clustered feature in rgba-format.
     * @param {Number} [clusterCircleStrokeWidth=2] Stroke width of circle for clustered feature.
     * @param {String} [clusterImageName="blank.png"] Name of image for clustered feature. Is used with imagePath.
     * @param {Number} [clusterImageWidth=1] Width of image for clustered feature in px.
     * @param {Number} [clusterImageHeight=1] Height of image for clustered feature in px.
     * @param {Number} [clusterImageScale=1] Scale of image for clustered feature.
     * @param {Number} [clusterImageOffsetX=0.5] horizontal offset of image for clustered feature.
     * @param {Number} [clusterImageOffsetY=0.5] vertical offset of image for clustered feature.
     * @param {String} [clusterText="COUNTER"] Flag of what text is to be shown.
     * @param {String} [clusterTextAlign="center"] Alignment of text for clustered feature.
     * @param {String} [clusterTextFont="10px sans-serif"] Font of text for clustered feature.
     * @param {Number} [clusterTextScale=1] Scale of text for clustered feature.
     * @param {Number} [clusterTextOffsetX=0] Horizontal offset of text for clustered feature.
     * @param {Number} [clusterTextOffsetY=0] Vertical offset of text for clustered feature.
     * @param {Number[]} [clusterTextFillColor=[255,255,255,1]] Fill color of test in rgba-format for clustered feature.
     * @param {Number[]} [clusterTextStrokeColor=[0,0,0,1]] Stroke color of text in rgba-format for clustered feature.
     * @param {Number} [clusterTextStrokeWidth=3] Stroke width of text for clustered feature.
     * @param {Number[]} [polygonFillColor=[255,255,255,1]] Fill color of polygon in rgba-format.
     * @param {Number[]} [polygonStrokeColor=[0,0,0,1]] Stroke color of polygon in rgba-format.
     * @param {Number} [polygonStrokeWidth=2] Stroke width of polygon.
     * @param {Number[]} [lineStrokeColor=[0,0,0,1]] Stroke color of line in rgba-format.
     * @param {Number} [lineStrokeWidth=2] Stroke width of line
     * @param {Number} [lineStrokeDash=undefined] Stroke width of line
     * @param {Number} [circleSegmentsRadius=10] Radius of circle segments.
     * @param {Number} [circleSegmentsStrokeWidth=4] Stroke width of circle segments.
     * @param {Number[]} [circleSegmentsBackgroundColor=[255,255,255,1]] Background color of circle segments in rgba-format.
     * @param {Number[]} [scalingValueDefaultColor=[0,0,0,1]] Default color of circle segments in rgba-format.
     * @param {Number} [circleSegmentsGap=10] Gap between the circle segments.
     * @param {Number} [circleBarScalingFactor=1] Scaling factor of circle bar.
     * @param {Number} [circleBarRadius=6] Radius of circle bar.
     * @param {Number} [circleBarLineStroke=5] Line stroke of circle bar.
     * @param {Number[]} [circleBarCircleFillColor=[0,0,0,1]] Fill color of circle bar in rgba-format.
     * @param {Number[]} [circleBarCircleStrokeColor=[0,0,0,1]] Stroke color of circle bar in rgba-format.
     * @param {Number} [circleBarCircleStrokeWidth=1] Circle stroke width of circle bar.
     * @param {Number[]} [circleBarLineStrokeColor=[0,0,0,1]] Line stroke color of circle bar in rgba-format.
     */
    initialize: function () {
        if (Config.wfsImgPath !== undefined) {
            this.setImagePath(Config.wfsImgPath);
        }
        else {
            console.warn("wfsImgPath at Config.js is not defined");
        }
    },

    /**
    * This function ist set as style. for each feature, this function is called.
    * Depending on the attribute "class" the respective style is created.
    * allowed values for "class" are "POINT", "LINE", "POLYGON".
    * @param {ol/feature} feature Feature to be styled.
    * @param {Boolean} isClustered Flag to show if feature is clustered.
    * @returns {ol/style} - The created style.
    */
    createStyle: function (feature, isClustered) {
        let style = this.getDefaultStyle();
        const styleClass = this.get("class").toUpperCase(),
            styleSubClass = this.get("subClass").toUpperCase(),
            labelField = this.get("labelField");

        if (feature === undefined) {
            return style;
        }
        else if (styleClass === "POINT") {
            style = this.createPointStyle(feature, styleSubClass, isClustered);
        }
        else if (styleClass === "LINE") {
            style = this.createLineStyle(feature, styleSubClass);
        }
        else if (styleClass === "POLYGON") {
            style = this.createPolygonStyle(feature, styleSubClass);
        }
        else {
            console.error("styleClass '" + styleClass + "' is not implemented yet");
        }

        // after style is derived, createTextStyle
        if (Array.isArray(style)) {
            style[0].setText(this.createTextStyle(feature, labelField, isClustered));
        }
        else {
            style.setText(this.createTextStyle(feature, labelField, isClustered));
        }

        return style;
    },

    /**
    * Creates openLayers Default Style
    * @returns {ol/style} - Open layers default style.
    */
    getDefaultStyle: function () {
        const fill = new Fill({
                color: "rgba(255,255,255,0.4)"
            }),
            stroke = new Stroke({
                color: "#3399CC",
                width: 1.25
            });

        return new Style({
            image: new CircleStyle({
                fill: fill,
                stroke: stroke,
                radius: 5
            }),
            fill: fill,
            stroke: stroke
        });
    },

    /**
    * Creates lineStyle depending on the attribute "subClass".
    * allowed values for "subClass" are "SIMPLE".
    * @param {ol/feature} feature Feature to be styled.
    * @param {String} styleSubClass Subclass of style.
    * @returns {ol/style} - The created style.
    */
    createLineStyle: function (feature, styleSubClass) {
        let style = this.getDefaultStyle();

        if (styleSubClass === "SIMPLE") {
            style = this.createSimpleLineStyle(feature);
        }

        return style;
    },

    /**
    * Creates a simpleLineStyle.
    * all features get the same style.
    * @param {ol/feature} feature Feature to be styled.
    * @returns {ol/style} - The created style.
    */
    createSimpleLineStyle: function (feature) {
        const strokeColor = this.returnColor(this.get("lineStrokeColor"), "rgb"),
            strokeWidth = parseFloat(this.get("lineStrokeWidth"), 10),
            strokeDash = this.get("lineStrokeDash"),
            styleFieldObj = this.getStyleFieldValueObject(feature, this.get("styleField"), this.get("styleFieldValues"), this.get("maxRangeAttribute"), this.get("minRangeAttribute")),
            strokeStyle = new Stroke({
                color: styleFieldObj && styleFieldObj.lineStrokeColor ? this.returnColor(styleFieldObj.lineStrokeColor, "rgb") : strokeColor,
                width: styleFieldObj && styleFieldObj.lineStrokeWidth ? parseFloat(styleFieldObj.lineStrokeWidth, 10) : strokeWidth,
                lineDash: styleFieldObj && styleFieldObj.lineStrokeDash ? styleFieldObj.lineStrokeDash : strokeDash
            }),
            style = new Style({
                stroke: strokeStyle
            });

        return style;
    },

    /**
    * Creates polygonStyle depending on the attribute "subClass".
    * allowed values for "subClass" are "SIMPLE".
    * @param {ol/feature} feature Feature to be styled.
    * @param {String} styleSubClass StyleSubClass
    * @returns {ol/style} - The created style.
    */
    createPolygonStyle: function (feature, styleSubClass) {
        let style = this.getDefaultStyle();

        if (styleSubClass === "SIMPLE") {
            style = this.createSimplePolygonStyle();
        }
        if (styleSubClass === "CUSTOM") {
            style = this.createCustomPolygonStyle(feature);
        }

        return style;
    },

    /**
    * Creates a simplePolygonStyle.
    * all features get the same style.
    * @returns {ol/style} - The created style.
    */
    createSimplePolygonStyle: function () {
        const strokestyle = new Stroke({
                color: this.returnColor(this.get("polygonStrokeColor"), "rgb"),
                width: parseFloat(this.get("polygonStrokeWidth"))
            }),
            fill = new Fill({
                color: this.returnColor(this.get("polygonFillColor"), "rgb")
            }),
            style = new Style({
                stroke: strokestyle,
                fill: fill
            });

        return style;
    },

    /**
     * Created a custom polygon style.
     * @param {ol/feature} feature Feature to be styled.
     * @returns {ol/style} - The created style.
     */
    createCustomPolygonStyle: function (feature) {
        const maxRangeAttribute = this.get("maxRangeAttribute"),
            minRangeAttribute = this.get("minRangeAttribute"),
            rangeMax = this.getRangeValueFromRangeAttribute(feature, maxRangeAttribute, false),
            rangeMin = this.getRangeValueFromRangeAttribute(feature, minRangeAttribute, 0);
        let styleField = this.get("styleField"),
            featureKeys = [],
            styleFieldValueObj,
            style = this.getDefaultStyle(),
            featureValue = false,
            polygonFillColor = false,
            polygonStrokeColor = false,
            polygonStrokeWidth = false,
            strokestyle = false,
            fillstyle = false;

        if (typeof styleField === "object") {
            featureKeys = feature.get("features") ? feature.get("features")[0].getKeys() : feature.getKeys();
            styleField = this.translateNameFromObject(featureKeys, styleField.name, styleField.condition);
        }

        featureValue = feature.get(styleField);

        if (featureValue !== undefined) {
            styleFieldValueObj = this.get("styleFieldValues").filter(function (styleFieldValue) {
                if (!styleFieldValue.hasOwnProperty("styleFieldValue")) {
                    return false;
                }

                if (typeof styleFieldValue.styleFieldValue === "string" && typeof featureValue === "string") {
                    // a normal string is given in styleFieldValue.styleFieldValue
                    return styleFieldValue.styleFieldValue.toUpperCase() === featureValue.toUpperCase();
                }

                // a range is given
                return this.isFeatureValueInStyleFieldRange(featureValue, styleFieldValue.styleFieldValue, rangeMax, rangeMin);
            }, this)[0];
        }

        if (styleFieldValueObj === undefined) {
            return style;
        }
        polygonFillColor = styleFieldValueObj.polygonFillColor ? styleFieldValueObj.polygonFillColor : this.get("polygonFillColor");
        polygonStrokeColor = styleFieldValueObj.polygonStrokeColor ? styleFieldValueObj.polygonStrokeColor : this.get("polygonStrokeColor");
        polygonStrokeWidth = styleFieldValueObj.polygonStrokeWidth ? styleFieldValueObj.polygonStrokeWidth : this.get("polygonStrokeWidth");

        strokestyle = new Stroke({
            color: this.returnColor(polygonStrokeColor, "rgb"),
            width: parseFloat(polygonStrokeWidth)
        });
        fillstyle = new Fill({
            color: this.returnColor(polygonFillColor, "rgb")
        });

        style = new Style({
            stroke: strokestyle,
            fill: fillstyle
        });

        return style;
    },

    /**
    * Creates pointStyle depending on the attribute "subClass".
    * allowed values for "subClass" are "SIMPLE", "CUSTOM" and "CIRCLE.
    * @param {ol/feature} feature Feature to be styled.
    * @param {String} styleSubClass StyleSubClass.
    * @param {Boolean} isClustered Flag if feature is clustered.
    * @returns {ol/style} - The created style.
    */
    createPointStyle: function (feature, styleSubClass, isClustered) {
        let style = this.getDefaultStyle();

        if (styleSubClass === "SIMPLE") {
            style = this.createSimplePointStyle(feature, isClustered);
        }
        else if (styleSubClass === "CUSTOM") {
            style = this.createCustomPointStyle(feature, isClustered);
        }
        else if (styleSubClass === "CIRCLE") {
            style = this.createCirclePointStyle(feature, isClustered);
        }
        else if (styleSubClass === "ADVANCED") {
            style = this.createAdvancedPointStyle(feature, isClustered);
        }

        return style;
    },

    /**
    * Creates clusterStyle depending on the attribute "clusterClass".
    * allowed values for "clusterClass" are "SIMPLE" and "CIRCLE".
    * @returns {ol/style} - The created style.
    */
    createClusterStyle: function () {
        const clusterClass = this.get("clusterClass");
        let clusterStyle;

        if (clusterClass === "SIMPLE") {
            clusterStyle = this.createSimpleClusterStyle();
        }
        else if (clusterClass === "CIRCLE") {
            clusterStyle = this.createCircleClusterStyle();
        }
        return clusterStyle;
    },

    /**
    * Creates simpleClusterStyle.
    * all clustered features get same image.
    * @returns {ol/style} - The created style.
    */
    createSimpleClusterStyle: function () {
        const src = this.get("imagePath") + this.get("clusterImageName"),
            isSVG = src.indexOf(".svg") > -1,
            width = this.get("clusterImageWidth"),
            height = this.get("clusterImageHeight"),
            scale = this.get("clusterImageScale"),
            offset = [parseFloat(this.get("clusterImageOffsetX")), parseFloat(this.get("clusterImageOffsetY"))],
            clusterStyle = new Icon({
                src: src,
                width: width,
                height: height,
                scale: scale,
                anchor: offset,
                imgSize: isSVG ? [width, height] : ""
            });

        return clusterStyle;
    },

    /**
    * Creates circleClusterStyle.
    * all clustered features get same circle.
    * @returns {ol/style} - The created style.
    */
    createCircleClusterStyle: function () {
        const radius = parseFloat(this.get("clusterCircleRadius"), 10),
            fillcolor = this.returnColor(this.get("clusterCircleFillColor"), "rgb"),
            strokecolor = this.returnColor(this.get("clusterCircleStrokeColor"), "rgb"),
            strokewidth = parseFloat(this.get("clusterCircleStrokeWidth"), 10),
            clusterStyle = new CircleStyle({
                radius: radius,
                fill: new Fill({
                    color: fillcolor
                }),
                stroke: new Stroke({
                    color: strokecolor,
                    width: strokewidth
                })
            });

        return clusterStyle;
    },

    /**
    * Creates simplePointStyle.
    * all features get same image.
    * @param {ol/feature} feature Feature to be styled.
    * @param {Boolean} isClustered Flag if feature is clustered.
    * @returns {ol/style} - The created style.
    */
    createSimplePointStyle: function (feature, isClustered) {
        let src,
            isSVG,
            width,
            height,
            scale,
            offset,
            imagestyle,
            offsetXUnit,
            offsetYUnit;

        if (isClustered && feature.get("features").length > 1) {
            imagestyle = this.createClusterStyle();
        }
        else {
            src = this.get("imagePath") + this.get("imageName");
            isSVG = src.indexOf(".svg") > -1;
            width = this.get("imageWidth");
            height = this.get("imageHeight");
            scale = parseFloat(this.get("imageScale"));
            offset = [parseFloat(this.get("imageOffsetX")), parseFloat(this.get("imageOffsetY"))];
            offsetXUnit = this.get("imageOffsetXUnit");
            offsetYUnit = this.get("imageOffsetYUnit");
            imagestyle = new Icon({
                src: src,
                width: width,
                height: height,
                scale: scale,
                anchor: offset,
                anchorXUnits: offsetXUnit,
                anchorYUnits: offsetYUnit,
                imgSize: isSVG ? [width, height] : ""
            });
        }

        return new Style({
            image: imagestyle
        });
    },

    /**
    * Creates customPointStyle.
    * each features gets a different image, depending on their attribute which is stored in "styleField".
    * @param {ol/feature} feature Feature to be styled.
    * @param {Boolean} isClustered Flag if feature is clustered.
    * @returns {ol/style} - The created style.
    */
    createCustomPointStyle: function (feature, isClustered) {
        const maxRangeAttribute = this.get("maxRangeAttribute"),
            minRangeAttribute = this.get("minRangeAttribute"),
            rangeMax = this.getRangeValueFromRangeAttribute(feature, maxRangeAttribute, false),
            rangeMin = this.getRangeValueFromRangeAttribute(feature, minRangeAttribute, 0);
        let styleField = this.get("styleField"),
            featureKeys = [],
            featureValue,
            styleFieldValueObj,
            src,
            isSVG,
            width,
            height,
            scale,
            imageoffsetx,
            imageoffsety,
            offset,
            offsetXUnit,
            offsetYUnit,
            imagestyle,
            style = this.getDefaultStyle();

        if (typeof styleField === "object") {
            featureKeys = feature.get("features") ? feature.get("features")[0].getKeys() : feature.getKeys();
            styleField = this.translateNameFromObject(featureKeys, styleField.name, styleField.condition);
        }

        if (isClustered && feature.get("features").length > 1) {
            imagestyle = this.createClusterStyle();
        }
        else {
            featureValue = feature.get("features") !== undefined ? feature.get("features")[0].get(styleField) : feature.get(styleField);

            if (featureValue !== undefined) {
                styleFieldValueObj = this.get("styleFieldValues").filter(function (styleFieldValue) {
                    if (!styleFieldValue.hasOwnProperty("styleFieldValue")) {
                        return false;
                    }

                    if (typeof styleFieldValue.styleFieldValue === "string" && typeof featureValue === "string") {
                        // a normal string is given in styleFieldValue.styleFieldValue
                        return styleFieldValue.styleFieldValue.toUpperCase() === featureValue.toUpperCase();
                    }

                    // a range is given
                    return this.isFeatureValueInStyleFieldRange(featureValue, styleFieldValue.styleFieldValue, rangeMax, rangeMin);
                }, this)[0];
            }
            if (styleFieldValueObj === undefined) {
                return style;
            }
            src = styleFieldValueObj !== undefined && styleFieldValueObj.hasOwnProperty("imageName") ? this.get("imagePath") + styleFieldValueObj.imageName : this.get("imagePath") + this.get("imageName");
            isSVG = src.indexOf(".svg") > -1;
            width = styleFieldValueObj.imageWidth ? styleFieldValueObj.imageWidth : this.get("imageWidth");
            height = styleFieldValueObj.imageHeight ? styleFieldValueObj.imageHeight : this.get("imageHeight");
            scale = styleFieldValueObj.imageScale ? styleFieldValueObj.imageScale : parseFloat(this.get("imageScale"));
            imageoffsetx = styleFieldValueObj.imageOffsetX ? styleFieldValueObj.imageOffsetX : this.get("imageOffsetX");
            imageoffsety = styleFieldValueObj.imageOffsetY ? styleFieldValueObj.imageOffsetY : this.get("imageOffsetY");
            offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)];
            offsetXUnit = this.get("imageOffsetXUnit");
            offsetYUnit = this.get("imageOffsetYUnit");
            imagestyle = new Icon({
                src: src,
                width: width,
                height: height,
                scale: scale,
                anchor: offset,
                anchorXUnits: offsetXUnit,
                anchorYUnits: offsetYUnit,
                imgSize: isSVG ? [width, height] : ""
            });
        }

        style = new Style({
            image: imagestyle
        });

        return style;
    },

    /**
     * checks wheather or not featureValue is in the range of styleFieldRange (depending on rangeMax and rangeMin - if given)
     * @param {Float} featureValue the featureValue to be checked (e.g. 732 cars)
     * @param {Float[]} styleFieldRange a range as an array [x, y] - x and y should be relative if rangeMax is given, absolute otherwise - x and y can be null for infinite
     * @param {Integer|Boolean} rangeMax the maximum value to be expected as featureValue gets - if not given styleFieldRange should be absolute
     * @param {Integer} rangeMin the minimum value to be expected for featureValue - is only taken into account if rangeMax is given
     * @return {Boolean}  false if featureValue is not in the range - true if featureValue is in the range
     */
    isFeatureValueInStyleFieldRange: function (featureValue, styleFieldRange, rangeMax, rangeMin) {
        const rMax = isNaN(rangeMax) ? false : rangeMax,
            rMin = isNaN(rangeMin) ? 0 : rangeMin;
        let value = featureValue;

        if (!Array.isArray(styleFieldRange) || styleFieldRange.length !== 2) {
            // there is no range - so featureValue can't be in it
            return false;
        }
        else if (isNaN(value) || value === null) {
            // if featureValue is not a number it can't be in the range
            // as null stands for infinit, null can't be in any range
            return false;
        }

        if (rMax !== false) {
            // if rMax is set, a relative range is expected: value has to be set to be relative to max-min
            value = 1 / (parseInt(rMax, 10) - parseInt(rMin, 10)) * (value - parseInt(rMin, 10));
        }

        if (styleFieldRange[0] === null && styleFieldRange[1] === null) {
            // everything is in a range of [null, null]
            return true;
        }
        else if (styleFieldRange[0] === null) {
            // if a range [null, x] is given, x should not be included
            return value < styleFieldRange[1];
        }
        else if (styleFieldRange[1] === null) {
            // if a range [x, null] is given, x should be included
            return value >= styleFieldRange[0];
        }

        // if a range [x, y] is given, x should be included but y should not be included
        return value >= styleFieldRange[0] && value < styleFieldRange[1];
    },

    /**
     * special handling of min/max-range values for the use of ranges in styleFieldValue
     * checkes if rangeAttribute exists and is an instant number or a key for a fieldValue
     * @param {ol/feature} feature Feature to relay on
     * @param {*} rangeAttribute the rangeAttribute (maxRangeAttribute, minRangeAttribute) from the config
     * @param {*} defaultValue the to use default value if rangeAttribute seems to be absent
     * @returns {Number}  the range value to go with
     */
    getRangeValueFromRangeAttribute: function (feature, rangeAttribute, defaultValue) {
        if (rangeAttribute !== undefined) {
            // handle rangeAttribute to get the result if necessary
            if (isNaN(rangeAttribute) || rangeAttribute === " ") {
                // if rangeAttribute is not a number, rangeAttribute is the identifier for the attribute field used for the max number
                return feature && typeof feature.get === "function" && feature.get(rangeAttribute) !== undefined ? feature.get(rangeAttribute) : defaultValue;
            }

            // if rangeAttribute is just a number: use rangeAttribute as result
            return rangeAttribute;
        }

        // default for rangeMax is false (no maximum value given)
        return defaultValue;
    },

    /**
     * searches in a list of styleFieldValues for the value that equals styleFieldParam or matches its range with styleFieldParam
     * @param {ol/feature} feature Feature to be styled.
     * @param {String|Object} styleFieldParam Attribute name to be styled with. Or object with name and condition.
     * @param {Object[]} styleFieldValues Values of attribute name with its style definition.
     * @param {String|Number|Boolean} [maxRangeAttribute=false] if String: the features attribute to get the maximum value for a range from; if number: the maximum value in itself; if false: no maximum value, therefore no relative range
     * @param {String|Number} [minRangeAttribute=0] only taken into effekt if maxRangeAttribute is given; if String: the features attribute to get the minimum value for a range from; if number: the minimum value in itslef;
     * @returns {Object/Boolean}  returns the found styleFieldValue, null if no value has matched or false if no feature, styleField or any styleFieldValues exists
     */
    getStyleFieldValueObject: function (feature, styleFieldParam, styleFieldValues, maxRangeAttribute, minRangeAttribute) {
        if (!feature || typeof styleFieldParam !== "object" && typeof styleFieldParam !== "string" || !styleFieldValues) {
            return false;
        }

        const rangeMax = this.getRangeValueFromRangeAttribute(feature, maxRangeAttribute, false),
            rangeMin = this.getRangeValueFromRangeAttribute(feature, minRangeAttribute, 0);
        let featureKeys,
            featureValue = false,
            styleField = styleFieldParam,
            obj,
            idx;

        if (typeof styleField === "object") {
            featureKeys = feature.get("features") && feature.get("features").length ? feature.get("features")[0].getKeys() : feature.getKeys();
            styleField = this.translateNameFromObject(featureKeys, styleField.name, styleField.condition);
        }

        featureValue = feature.get(styleField);
        if (featureValue === undefined) {
            return null;
        }

        for (idx in styleFieldValues) {
            obj = styleFieldValues[idx];

            if (!obj || !obj.hasOwnProperty("styleFieldValue")) {
                continue;
            }

            if (typeof obj.styleFieldValue === "string" && typeof featureValue === "string") {
                // a normal string is given in obj.styleFieldValue
                if (obj.styleFieldValue.toUpperCase() === featureValue.toUpperCase()) {
                    return obj;
                }
            }

            if (this.isFeatureValueInStyleFieldRange(featureValue, obj.styleFieldValue, rangeMax, rangeMin)) {
                return obj;
            }
        }

        return null;
    },

    /**
     * Translates the given name from gfiAttribute Object based on the condition type
     * @param {Object} keys List of all keys that the feature has.
     * @param {String} name The name to be proofed against the keys.
     * @param {String} condition Condition to be proofed.
     * @returns {String} - Attribute key if condition matches exactly one key; undefined if unexpected params where given
     */
    translateNameFromObject: function (keys, name, condition) {
        let match,
            matches = [];

        if (!Array.isArray(keys) || typeof name !== "string" || typeof condition !== "string") {
            return undefined;
        }

        if (condition === "contains") {
            matches = keys.filter(key => {
                return key.length !== name.length && key.includes(name);
            });
            if (this.checkIfMatchesValid(name, condition, matches)) {
                match = matches[0];
            }
        }
        else if (condition === "startsWith") {
            matches = keys.filter(key => {
                return key.length !== name.length && key.startsWith(name);
            });
            if (this.checkIfMatchesValid(name, condition, matches)) {
                match = matches[0];
            }
        }
        else if (condition === "endsWith") {
            matches = keys.filter(key => {
                return key.length !== name.length && key.endsWith(name);
            });
            if (this.checkIfMatchesValid(name, condition, matches)) {
                match = matches[0];
            }
        }
        else {
            console.error("unknown matching type for styling condition");
        }
        return match;
    },

    /**
     * Checks if the matches have exact one entry.
     * @param {String} origName The name to be proofed against the keys.
     * @param {String} condition Matching conditon.
     * @param {String[]} matches An array of all keys matching the condition.
     * @returns {Boolean} - Flag of array has exacly one entry.
     */
    checkIfMatchesValid: function (origName, condition, matches) {
        let isValid = false;

        if (matches.length === 0) {
            console.error("no match found at the feature for styling condition: '" + condition + "', '" + origName + "'");
        }
        else if (matches.length > 1) {
            console.error("more than 1 match found at the feature for styling condition: " + condition + "', '" + origName + "'");
        }
        else {
            isValid = true;
        }
        return isValid;
    },

    /**
    * Creates circlePointStyle.
    * all features get same circle.
    * @param {ol/feature} feature Feature to be styled.
    * @param {Boolean} isClustered Flag if feature is clustered.
    * @returns {ol/style} - The created style.
    */
    createCirclePointStyle: function (feature, isClustered) {
        let radius,
            fillcolor,
            strokecolor,
            strokewidth,
            circleStyle;

        if (isClustered) {
            circleStyle = this.createClusterStyle();
        }
        else {
            radius = parseFloat(this.get("circleRadius"), 10);
            fillcolor = this.returnColor(this.get("circleFillColor"), "rgb");
            strokecolor = this.returnColor(this.get("circleStrokeColor"), "rgb");
            strokewidth = parseFloat(this.get("circleStrokeWidth"), 10);
            circleStyle = new CircleStyle({
                radius: radius,
                fill: new Fill({
                    color: fillcolor
                }),
                stroke: new Stroke({
                    color: strokecolor,
                    width: strokewidth
                })
            });
        }

        return new Style({
            image: circleStyle
        });
    },

    /**
     * create advanced style for pointFeatures
     * @param  {ol.Feature} feature - feature to be draw
     * @param  {boolean} isClustered - Value includes whether features should be clustered
     * @return {ol.Style} style
     */
    createAdvancedPointStyle: function (feature, isClustered) {
        const styleScaling = this.get("scaling").toUpperCase();
        let style,
            imagestyle,
            workingFeature = feature;

        if (isClustered && feature.get("features").length > 1) {
            imagestyle = this.createClusterStyle();

            style = new Style({
                image: imagestyle
            });
        }
        else {

            // parse from array
            if (Array.isArray(workingFeature.get("features"))) {
                workingFeature = workingFeature.get("features")[0];
            }

            // check scaling
            if (styleScaling === "NOMINAL") {
                style = this.createNominalAdvancedPointStyle(workingFeature);
            }
            else if (styleScaling === "INTERVAL") {
                style = this.createIntervalAdvancedPointStyle(workingFeature);
            }
        }

        return style;
    },

    /**
     * create nominal scaled advanced style for pointFeatures
     * @param  {ol.Feature} feature - feature to be draw
     * @return {ol.Style} style
     */
    createNominalAdvancedPointStyle: function (feature) {
        const styleScalingShape = this.get("scalingShape").toUpperCase(),
            imageName = this.get("imageName"),
            imageNameDefault = this.defaults.imageName;
        let svgPath,
            style,
            imageStyle;

        if (styleScalingShape === "CIRCLESEGMENTS") {
            svgPath = this.createNominalCircleSegments(feature);
            style = this.createSVGStyle(svgPath);
        }

        // create style from svg and image
        if (imageName !== imageNameDefault) {
            imageStyle = this.createSimplePointStyle(feature, false);
            style = [style, imageStyle];
        }

        return style;
    },

    /**
     * create interval scaled advanced style for pointFeatures
     * @param  {ol.Feature} feature - feature to be draw
     * @return {ol.Style} style
     */
    createIntervalAdvancedPointStyle: function (feature) {
        const styleScalingShape = this.get("scalingShape").toUpperCase();
        let svgPath;

        if (styleScalingShape === "CIRCLE_BAR") {
            svgPath = this.createIntervalCircleBar(feature);
        }

        return this.createSVGStyle(svgPath);
    },

    /**
     * create Style for SVG
     * @param  {String} svgPath - contains the params to be draw
     * @return {ol.Style} style
     */
    createSVGStyle: function (svgPath) {
        const size = this.get("size");

        return new Style({
            image: new Icon({
                src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgPath),
                imgSize: [size, size]
            })
        });
    },

    /**
    * Creates textStyle if feature is clustered OR "labelField" is set
    * @param {ol/feature} feature Feature to be styled.
    * @param {String} labelField Attribute name of feature.
    * @param {Boolean} isClustered Flag if featured is clustered.
    * @returns {ol/style} - The created style.
    */
    createTextStyle: function (feature, labelField, isClustered) {
        let textStyle,
            textObj = {};

        if (isClustered) {
            textObj = this.createClusteredTextStyle(feature, labelField);

            if (textObj !== undefined) {
                textStyle = this.createTextStyleFromObject(textObj);
            }
        }
        else if (labelField.length === 0) {
            textStyle = undefined;
        }
        else {
            textObj.text = feature.get(labelField) ? feature.get(labelField).toString() : "";
            textObj.textAlign = this.get("textAlign");
            textObj.font = this.get("textFont").toString();
            textObj.scale = parseFloat(this.get("textScale"), 10);
            textObj.offsetX = parseFloat(this.get("textOffsetX"), 10);
            textObj.offsetY = parseFloat(this.get("textOffsetY"), 10);
            textObj.fillcolor = this.returnColor(this.get("textFillColor"), "rgb");
            textObj.strokecolor = this.returnColor(this.get("textStrokeColor"), "rgb");
            textObj.strokewidth = parseFloat(this.get("textStrokeWidth"), 10);

            textStyle = this.createTextStyleFromObject(textObj);
        }

        return textStyle;
    },
    /**
     * Creates an text style from given object.
     * @param {Object} textObj Object with parameters.
     * @returns {ol/style} - The created style.
     */
    createTextStyleFromObject: function (textObj) {
        const textStyle = new Text({
            text: textObj.text,
            textAlign: textObj.textAlign,
            offsetX: textObj.offsetX,
            offsetY: textObj.offsetY,
            font: textObj.font,
            scale: textObj.scale,
            fill: new Fill({
                color: textObj.fillcolor
            }),
            stroke: new Stroke({
                color: textObj.strokecolor,
                width: textObj.strokewidth
            })
        });

        return textStyle;
    },
    /**
    * Creates clusteredTextStyle.
    * if "clusterText" === "COUNTER" then the number if features are set
    * if "clusterText" === "NONE" no Text is shown
    * else all features get the text that is defined in "clusterText".
    * @param {ol/feature} feature Feature to be styled.
    * @param {String} labelField Attribute name of feature to build the label style.
    * @returns {ol/style} - The created style.
    */
    createClusteredTextStyle: function (feature, labelField) {
        let clusterTextObj = {};

        if (feature.get("features").length === 1) {
            clusterTextObj.text = feature.get("features")[0].get(labelField);
            clusterTextObj.textAlign = this.get("textAlign");
            clusterTextObj.font = this.get("textFont").toString();
            clusterTextObj.scale = parseFloat(this.get("textScale"), 10);
            clusterTextObj.offsetX = parseFloat(this.get("textOffsetX"), 10);
            clusterTextObj.offsetY = parseFloat(this.get("textOffsetY"), 10);
            clusterTextObj.fillcolor = this.returnColor(this.get("textFillColor"), "rgb");
            clusterTextObj.strokecolor = this.returnColor(this.get("textStrokeColor"), "rgb");
            clusterTextObj.strokewidth = parseFloat(this.get("textStrokeWidth"), 10);
        }
        else if (this.get("clusterText") === "COUNTER") {
            clusterTextObj.text = feature.get("features").length.toString();
            clusterTextObj = this.extendClusterTextStyle(clusterTextObj);
        }
        else if (this.get("clusterText") === "NONE") {
            clusterTextObj = undefined;
        }
        else {
            clusterTextObj.text = this.get("clusterText");
            clusterTextObj = this.extendClusterTextStyle(clusterTextObj);
        }

        return clusterTextObj;
    },

    /**
     * Extends the cluster text style object.
     * @param {Object} clusterTextObj The given object.
     * @returns {Object} - The extended object.
     */
    extendClusterTextStyle: function (clusterTextObj) {
        clusterTextObj.textAlign = this.get("clusterTextAlign");
        clusterTextObj.font = this.get("clusterTextFont").toString();
        clusterTextObj.scale = parseFloat(this.get("clusterTextScale"), 10);
        clusterTextObj.offsetX = parseFloat(this.get("clusterTextOffsetX"), 10);
        clusterTextObj.offsetY = parseFloat(this.get("clusterTextOffsetY"), 10);
        clusterTextObj.fillcolor = this.returnColor(this.get("clusterTextFillColor"), "rgb");
        clusterTextObj.strokecolor = this.returnColor(this.get("clusterTextStrokeColor"), "rgb");
        clusterTextObj.strokewidth = parseFloat(this.get("clusterTextStrokeWidth"), 10);

        return clusterTextObj;
    },

    /**
    * Returns input color to destinated color.
    * possible values for dest are "rgb" and "hex".
    * color has to come as hex (e.g. "#ffffff" || "#fff") or as array (e.g [255,255,255,0]) or as String ("[255,255,255,0]")
    * @param {Number[]|String} color The color to return.
    * @param {String} dest Destination color type.
    * @returns {String|Number[]} - The converted color.
    */
    returnColor: function (color, dest) {
        let src,
            newColor = color,
            pArray = [];

        if (Array.isArray(newColor)) {
            src = "rgb";
        }
        else if (typeof newColor === "string" && newColor.indexOf("#") === 0) {
            src = "hex";
        }
        else if (typeof newColor === "string" && newColor.indexOf("#") === -1) {
            src = "rgb";

            pArray = newColor.replace("[", "").replace("]", "").replace(/ /g, "").split(",");
            newColor = [
                pArray[0], pArray[1], pArray[2], pArray[3]
            ];
        }

        if (src === "hex" && dest === "rgb") {
            newColor = this.hexToRgb(newColor);
        }
        else if (src === "rgb" && dest === "hex") {
            newColor = this.rgbToHex(newColor[0], newColor[1], newColor[2]);
        }

        newColor = dest === "rgb" ? this.normalizeRgbColor(newColor) : newColor;

        return newColor;
    },
    /**
     * Converts rgb to hex.
     * @param {Number} r Red value.
     * @param {Number} g Green Value.
     * @param {Number} b Blue value.
     * @returns {String} - Hex color string.
     */
    rgbToHex: function (r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    },

    /**
     * Converts number to hex string.
     * @param {Number} c Color value as number.
     * @returns {String} - Converted color number as hex string.
     */
    componentToHex: function (c) {
        const hex = c.toString(16);

        return hex.length === 1 ? "0" + hex : hex;
    },

    /**
     * Converts hex value to rgbarray.
     * @param {String} hex Color as hex string.
     * @returns {Number[]} - Color als rgb array.
     */
    hexToRgb: function (hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
            hexReplace = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });
        let result;

        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        result = result.exec(hexReplace);

        return result ? [parseFloat(result[1], 16), parseFloat(result[2], 16), parseFloat(result[3], 16)] : null;
    },

    /**
     * Makes sure that one rgb color always consists of four values
     * @param {array} newColor Color in rgb
     * @return {array} normColor
     */
    normalizeRgbColor: function (newColor) {
        let normColor = newColor;

        if (normColor.length === 4) {
            return normColor;
        }
        else if (newColor.length > 4) {
            normColor = normColor.slice(0, 3);
        }
        else if (newColor.length < 4) {
            while (newColor.length !== 4) {
                newColor.push(1);
            }
        }

        return normColor;
    },

    /**
     * Create a svg with colored circle segments by nominal scaling
     * @param  {ol.Feature} feature - feature to be draw
     * @return {String} svg with colored circle segments
     */
    createNominalCircleSegments: function (feature) {
        const circleSegmentsRadius = parseFloat(this.get("circleSegmentsRadius"), 10),
            circleSegmentsStrokeWidth = parseFloat(this.get("circleSegmentsStrokeWidth"), 10),
            circleSegBCArray = this.get("circleSegmentsBackgroundColor"),
            circleSegmentsFillOpacity = Array.isArray(circleSegBCArray) && circleSegBCArray[circleSegBCArray.length - 1],
            circleSegmentsBackgroundColor = this.returnColor(this.get("circleSegmentsBackgroundColor"), "hex"),
            scalingValueDefaultColor = this.returnColor(this.get("scalingValueDefaultColor"), "hex"),
            scalingValues = this.get("scalingValues"),
            scalingAttributesAsObject = this.getScalingAttributesAsObject(scalingValues),
            scalingAttribute = feature.get(this.get("scalingAttribute")),
            scalingObject = this.fillScalingAttributes(scalingAttributesAsObject, scalingAttribute),
            totalSegments = Object.values(scalingObject).reduce(function (memo, num) {
                return memo + num;
            }, 0),
            degreeSegment = totalSegments >= 0 ? 360 / totalSegments : 360,
            gap = parseFloat(this.get("circleSegmentsGap"), 10);
        let size = 10,
            startAngelDegree = 0,
            endAngelDegree = degreeSegment,
            svg,
            d,
            strokeColor,
            i,
            key,
            value;

        // calculate size
        if (((circleSegmentsRadius + circleSegmentsStrokeWidth) * 2) >= size) {
            size = size + ((circleSegmentsRadius + circleSegmentsStrokeWidth) * 2);
        }

        // is required for the display in the Internet Explorer,
        // because in addition to the SVG and the size must be specified
        this.setSize(size);

        svg = this.createSvgNominalCircleSegments(size, circleSegmentsRadius, circleSegmentsBackgroundColor, circleSegmentsStrokeWidth, circleSegmentsFillOpacity);


        for (key in scalingObject) {
            value = scalingObject[key];

            if (scalingValues !== undefined && (key !== "empty")) {
                strokeColor = this.returnColor(scalingValues[key], "hex");
            }
            else {
                strokeColor = scalingValueDefaultColor;
            }

            // create segments
            for (i = 0; i < value; i++) {

                d = this.calculateCircleSegment(startAngelDegree, endAngelDegree, circleSegmentsRadius, size, gap);

                svg = this.extendsSvgNominalCircleSegments(svg, circleSegmentsStrokeWidth, strokeColor, d);

                // set degree for next circular segment
                startAngelDegree = startAngelDegree + degreeSegment;
                endAngelDegree = endAngelDegree + degreeSegment;
            }
        }

        svg = svg + "</svg>";

        return svg;
    },

    /**
     * Fills the object with values
     * @param {object} scalingAttributesAsObject - object with possible attributes as keys and values = 0
     * @param {string} scalingAttribute - actual states from feature
     * @return {Object} scalingObject - contains the states
     */
    fillScalingAttributes: function (scalingAttributesAsObject, scalingAttribute) {
        const scalingObject = scalingAttributesAsObject === undefined || Object.keys(scalingAttributesAsObject).length === 0
            ? {empty: 0} : scalingAttributesAsObject;
        let states = scalingAttribute;

        if (states === undefined) {
            return scalingObject;
        }

        states = states.split(" | ");

        states.forEach(function (state) {
            if (scalingObject.hasOwnProperty(state)) {
                scalingObject[state] = scalingObject[state] + 1;
            }
            else {
                scalingObject.empty = scalingObject.empty + 1;
            }
        });

        return scalingObject;
    },

    /**
     * Convert scalingAttributes to object
     * @param {object} scalingValues - contains attribute with color
     * @return {object} scalingAttribute with value 0
     */
    getScalingAttributesAsObject: function (scalingValues) {
        const obj = {};
        let key;

        if (scalingValues !== undefined) {
            for (key in scalingValues) {
                obj[key] = 0;
            }
        }

        obj.empty = 0;

        return obj;
    },

    /**
     * Create SVG for nominalscaled circle segments
     * @param  {number} size - size of the section to be drawn
     * @param  {number} circleSegmentsRadius - radius from circlesegment
     * @param  {String} circleSegmentsBackgroundColor - backgroundcolor from circlesegment
     * @param  {number} circleSegmentsStrokeWidth - strokewidth from circlesegment
     * @param  {String} circleSegmentsFillOpacity - opacity from circlesegment
     * @return {String} svg
     */
    createSvgNominalCircleSegments: function (size, circleSegmentsRadius, circleSegmentsBackgroundColor, circleSegmentsStrokeWidth, circleSegmentsFillOpacity) {
        const halfSize = size / 2;
        let svg = "<svg width='" + size + "'" +
            " height='" + size + "'" +
            " xmlns='http://www.w3.org/2000/svg'" +
            " xmlns:xlink='http://www.w3.org/1999/xlink'>";

        svg = svg + "<circle cx='" + halfSize + "'" +
            " cy='" + halfSize + "'" +
            " r='" + circleSegmentsRadius + "'" +
            " stroke='" + circleSegmentsBackgroundColor + "'" +
            " stroke-width='" + circleSegmentsStrokeWidth + "'" +
            " fill='" + circleSegmentsBackgroundColor + "'" +
            " fill-opacity='" + circleSegmentsFillOpacity + "'/>";

        return svg;
    },

    /**
     * Extends the SVG with given tags
     * @param  {String} svg - String with svg tags
     * @param  {number} circleSegmentsStrokeWidth strokewidth from circlesegment
     * @param  {String} strokeColor - strokecolor from circlesegment
     * @param  {String} d - circle segment
     * @return {String} extended svg
     */
    extendsSvgNominalCircleSegments: function (svg, circleSegmentsStrokeWidth, strokeColor, d) {
        return svg + "<path" +
            " fill='none'" +
            " stroke-width='" + circleSegmentsStrokeWidth + "'" +
            " stroke='" + strokeColor + "'" +
            " d='" + d + "'/>";
    },

    /**
     * Create circle segments
     * @param  {number} startAngelDegree - start with circle segment
     * @param  {number} endAngelDegree - finish with circle segment
     * @param  {number} circleRadius - radius from circle
     * @param  {number} size - size of the window to be draw
     * @param  {number} gap - gap between segments
     * @return {String} all circle segments
     */
    calculateCircleSegment: function (startAngelDegree, endAngelDegree, circleRadius, size, gap) {
        const rad = Math.PI / 180,
            xy = size / 2,
            isCircle = startAngelDegree === 0 && endAngelDegree === 360,
            endAngelDegreeActual = isCircle ? endAngelDegree / 2 : endAngelDegree,
            gapActual = isCircle ? 0 : gap,
            // convert angle from degree to radiant
            startAngleRad = (startAngelDegree + (gapActual / 2)) * rad,
            endAngleRad = (endAngelDegreeActual - (gapActual / 2)) * rad,
            xStart = xy + (Math.cos(startAngleRad) * circleRadius),
            yStart = xy - (Math.sin(startAngleRad) * circleRadius),
            xEnd = xy + (Math.cos(endAngleRad) * circleRadius),
            yEnd = xy - (Math.sin(endAngleRad) * circleRadius);

        if (isCircle) {
            return [
                "M", xStart, yStart,
                "A", circleRadius, circleRadius, 0, 0, 0, xEnd, yEnd,
                "A", circleRadius, circleRadius, 0, 0, 0, xStart, yStart
            ].join(" ");
        }

        return [
            "M", xStart, yStart,
            "A", circleRadius, circleRadius, 0, 0, 0, xEnd, yEnd
        ].join(" ");
    },

    /**
     * Create interval circle bar
     * @param  {ol.Feature} feature - contains features to draw
     * @return {String} svg
     */
    createIntervalCircleBar: function (feature) {
        const circleBarScalingFactor = parseFloat(this.get("circleBarScalingFactor")),
            circleBarRadius = parseFloat(this.get("circleBarRadius"), 10),
            circleBarLineStroke = parseFloat(this.get("circleBarLineStroke"), 10),
            circleBarCircleFillColor = this.returnColor(this.get("circleBarCircleFillColor"), "hex"),
            circleBarCircleStrokeColor = this.returnColor(this.get("circleBarCircleStrokeColor"), "hex"),
            circleBarCircleStrokeWidth = this.get("circleBarCircleStrokeWidth"),
            circleBarLineStrokeColor = this.returnColor(this.get("circleBarLineStrokeColor"), "hex"),
            scalingAttribute = feature.get(this.get("scalingAttribute")),
            stateValue = scalingAttribute !== undefined && scalingAttribute.indexOf(" ") !== -1 ? scalingAttribute.split(" ")[0] : scalingAttribute,
            size = this.calculateSizeIntervalCircleBar(stateValue, circleBarScalingFactor, circleBarLineStroke, circleBarRadius),
            barLength = this.calculateLengthIntervalCircleBar(size, circleBarRadius, stateValue, circleBarScalingFactor);

        this.setSize(size);

        // create svg
        return this.createSvgIntervalCircleBar(size, barLength, circleBarCircleFillColor, circleBarCircleStrokeColor, circleBarCircleStrokeWidth, circleBarLineStrokeColor, circleBarLineStroke, circleBarRadius);
    },

    /**
     * Calculate size for intervalscaled circle bar
     * @param  {number} stateValue - value from feature
     * @param  {number} circleBarScalingFactor - factor is multiplied by the stateValue
     * @param  {number} circleBarLineStroke - stroke from bar
     * @param  {number} circleBarRadius - radius from point
     * @return {number} size - size of the section to be drawn
     */
    calculateSizeIntervalCircleBar: function (stateValue, circleBarScalingFactor, circleBarLineStroke, circleBarRadius) {
        let size = circleBarRadius * 2;

        if (((stateValue * circleBarScalingFactor) + circleBarLineStroke) >= size) {
            size = size + (stateValue * circleBarScalingFactor) + circleBarLineStroke;
        }

        return size;
    },

    /**
     * Calculate the length for the bar
     * @param  {number} size - size of the section to be drawn
     * @param  {number} circleBarRadius - radius from point
     * @param  {number} stateValue - value from feature
     * @param  {number} circleBarScalingFactor - factor is multiplied by the stateValue
     * @return {number} barLength
     */
    calculateLengthIntervalCircleBar: function (size, circleBarRadius, stateValue, circleBarScalingFactor) {
        let barLength;

        if (stateValue >= 0) {
            barLength = (size / 2) - circleBarRadius - (stateValue * circleBarScalingFactor);
        }
        else if (stateValue < 0) {
            barLength = (size / 2) + circleBarRadius - (stateValue * circleBarScalingFactor);
        }
        else {
            barLength = 0;
        }

        return barLength;
    },

    /**
     * Create SVG for intervalscaled circle bars
     * @param  {number} size - size of the section to be drawn
     * @param  {number} barLength - length from bar
     * @param  {String} circleBarCircleFillColor - fill color from circle
     * @param  {String} circleBarCircleStrokeColor - stroke color from circle
     * @param  {number} circleBarCircleStrokeWidth - stroke width from circle
     * @param  {String} circleBarLineStrokeColor - stroke color from bar
     * @param  {number} circleBarLineStroke - stroke from bar
     * @param  {number} circleBarRadius - radius from point
     * @return {String} svg
     */
    createSvgIntervalCircleBar: function (size, barLength, circleBarCircleFillColor, circleBarCircleStrokeColor, circleBarCircleStrokeWidth, circleBarLineStrokeColor, circleBarLineStroke, circleBarRadius) {
        let svg = "<svg width='" + size + "'" +
                " height='" + size + "'" +
                " xmlns='http://www.w3.org/2000/svg'" +
                " xmlns:xlink='http://www.w3.org/1999/xlink'>";

        // draw bar
        svg = svg + "<line x1='" + (size / 2) + "'" +
            " y1='" + (size / 2) + "'" +
            " x2='" + (size / 2) + "'" +
            " y2='" + barLength + "'" +
            " stroke='" + circleBarLineStrokeColor + "'" +
            " stroke-width='" + circleBarLineStroke + "' />";

        // draw circle
        svg = svg + "<circle cx='" + (size / 2) + "'" +
            " cy='" + (size / 2) + "'" +
            " r='" + circleBarRadius + "'" +
            " stroke='" + circleBarCircleStrokeColor + "'" +
            " stroke-width='" + circleBarCircleStrokeWidth + "'" +
            " fill='" + circleBarCircleFillColor + "' />";
        svg = svg + "</svg>";

        return svg;
    },
    getLegendInfos: function () {
        return this.get("legendInfos");
    },

    /**
     * Setter for circleSegmentsBackgroundColor
     * @param {Number[]} value Color
     * @returns {void}
     */
    setCircleSegmentsBackgroundColor: function (value) {
        this.set("circleSegmentsBackgroundColor", value);
    },

    /**
     * Setter for size.
     * @param {*} size Size
     * @returns {void}
     */
    setSize: function (size) {
        this.set("size", size);
    },

    /**
     * Setter for imagePath.
     * @param {String} value Image path.
     * @returns {void}
     */
    setImagePath: function (value) {
        this.set("imagePath", value);
    },

    /**
     * Setter for class.
     * @param {String} value Class.
     * @returns {void}
     */
    setClass: function (value) {
        this.set("class", value);
    },

    /**
     * Setter for subClass.
     * @param {String} value SubClass.
     * @returns {void}
     */
    setSubClass: function (value) {
        this.set("subClass", value);
    },

    /**
     * Setter for styleField.
     * @param {String} value styleField.
     * @returns {void}
     */
    setStyleField: function (value) {
        this.set("styleField", value);
    },

    /**
     * Setter for styleFieldValues.
     * @param {Object[]} value styleFieldValues.
     * @returns {void}
     */
    setStyleFieldValues: function (value) {
        this.set("styleFieldValues", value);
    },

    /**
     * Setter for labelField.
     * @param {String} value labelField.
     * @returns {void}
     */
    setLabelField: function (value) {
        this.set("labelField", value);
    },
    /**
     * Setter for imageName.
     * @param {String} value Image name.
     * @returns {void}
     */
    setImageName: function (value) {
        this.set("imageName", value);
    },

    /**
     * Setter for imageWidth.
     * @param {Number} value Image width.
     * @returns {void}
     */
    setImageWidth: function (value) {
        this.set("imageWidth", value);
    },

    /**
     * Setter for imageHeight.
     * @param {Number} value Image height.
     * @returns {void}
     */
    setImageHeight: function (value) {
        this.set("imageHeight", value);
    },

    /**
     * Setter for imageScale.
     * @param {Number} value Image scale.
     * @returns {void}
     */
    setImageScale: function (value) {
        this.set("imageScale", value);
    },

    /**
     * Setter for imageOffsetX.
     * @param {Number} value Image offsetX.
     * @returns {void}
     */
    setImageOffsetX: function (value) {
        this.set("imageOffsetX", value);
    },

    /**
     * Setter for imageOffsetY.
     * @param {Number} value Image offsetY.
     * @returns {void}
     */
    setImageOffsetY: function (value) {
        this.set("imageOffsetY", value);
    },

    /**
     * Setter for imageOffsetXUnit.
     * @param {String} value Image offsetX unit.
     * @returns {void}
     */
    setImageOffsetXUnit: function (value) {
        this.set("imageOffsetXUnit", value);
    },

    /**
     * Setter for imageOffsetYUnit.
     * @param {String} value Image offsetY unit.
     * @returns {void}
     */
    setImageOffsetYUnit: function (value) {
        this.set("imageOffsetYUnit", value);
    },

    /**
     * Setter for circleRadius.
     * @param {Number} value CircleRadius.
     * @returns {void}
     */
    setCircleRadius: function (value) {
        this.set("circleRadius", value);
    },

    /**
     * Setter for circleFillColor.
     * @param {Number[]} value CircleFillColor.
     * @returns {void}
     */
    setCircleFillColor: function (value) {
        this.set("circleFillColor", value);
    },

    /**
     * Setter for circleStrokeColor.
     * @param {Number[]} value CircleStrokeColor.
     * @returns {void}
     */
    setCircleStrokeColor: function (value) {
        this.set("circleStrokeColor", value);
    },

    /**
     * Setter for circleStrokeWidth.
     * @param {Number} value CircleStrokeWidth.
     * @returns {void}
     */
    setCircleStrokeWidth: function (value) {
        this.set("circleStrokeWidth", value);
    },

    /**
     * Setter for textAlign.
     * @param {String} value textAlign.
     * @returns {void}
     */
    setTextAlign: function (value) {
        this.set("textAlign", value);
    },

    /**
     * Setter for textFont.
     * @param {String} value textFont.
     * @returns {void}
     */
    setTextFont: function (value) {
        this.set("textFont", value);
    },

    /**
     * Setter for textScale.
     * @param {Number} value textScale.
     * @returns {void}
     */
    setTextScale: function (value) {
        this.set("textScale", value);
    },

    /**
     * Setter for textOffsetX.
     * @param {Number} value TextOffsetX.
     * @returns {void}
     */
    setTextOffsetX: function (value) {
        this.set("textOffsetX", value);
    },

    /**
     * Setter for textOffsetY.
     * @param {Number} value TextOffsetY.
     * @returns {void}
     */
    setTextOffsetY: function (value) {
        this.set("textOffsetY", value);
    },

    /**
     * Setter for textFillColor.
     * @param {Object[]} value TextFillColor.
     * @returns {void}
     */
    setTextFillColor: function (value) {
        this.set("textFillColor", value);
    },

    /**
     * Setter for textStrokeColor.
     * @param {Object[]} value TextStrokeColor.
     * @returns {void}
     */
    setTextStrokeColor: function (value) {
        this.set("textStrokeColor", value);
    },

    /**
     * Setter for textStrokeWidth.
     * @param {Number} value textStrokeWidth.
     * @returns {void}
     */
    setTextStrokeWidth: function (value) {
        this.set("textStrokeWidth", value);
    },

    /**
     * Setter for clusterClass.
     * @param {String} value ClusterClass.
     * @returns {void}
     */
    setClusterClass: function (value) {
        this.set("clusterClass", value);
    },

    /**
     * Setter for clusterCircleRadius.
     * @param {String} value ClusterCircleRadius.
     * @returns {void}
     */
    setClusterCircleRadius: function (value) {
        this.set("clusterCircleRadius", value);
    },

    /**
     * Setter for clusterCircleFillColor.
     * @param {Object[]} value ClusterCircleFillColor.
     * @returns {void}
     */
    setClusterCircleFillColor: function (value) {
        this.set("clusterCircleFillColor", value);
    },

    /**
     * Setter for clusterCircleStrokeColor.
     * @param {Object[]} value ClusterCircleStrokeColor.
     * @returns {void}
     */
    setClusterCircleStrokeColor: function (value) {
        this.set("clusterCircleStrokeColor", value);
    },

    /**
     * Setter for clusterCircleStrokeWidth.
     * @param {Number} value ClusterCircleStrokeWidth.
     * @returns {void}
     */
    setClusterCircleStrokeWidth: function (value) {
        this.set("clusterCircleStrokeWidth", value);
    },

    /**
     * Setter for clusterImageName.
     * @param {String} value ClusterImageName.
     * @returns {void}
     */
    setClusterImageName: function (value) {
        this.set("clusterImageName", value);
    },

    /**
     * Setter for clusterImageWidth.
     * @param {Number} value ClusterImageWidth.
     * @returns {void}
     */
    setClusterImageWidth: function (value) {
        this.set("clusterImageWidth", value);
    },

    /**
     * Setter for clusterImageHeight.
     * @param {Number} value ClusterImageHeight.
     * @returns {void}
     */
    setClusterImageHeight: function (value) {
        this.set("clusterImageHeight", value);
    },

    /**
     * Setter for clusterImageScale.
     * @param {Number} value ClusterImageScale.
     * @returns {void}
     */
    setClusterImageScale: function (value) {
        this.set("clusterImageScale", value);
    },

    /**
     * Setter for clusterImageOffsetX.
     * @param {Number} value ClusterImageOffsetX.
     * @returns {void}
     */
    setClusterImageOffsetX: function (value) {
        this.set("clusterImageOffsetX", value);
    },

    /**
     * Setter for clusterImageOffsetY.
     * @param {Number} value ClusterImageOffsetY.
     * @returns {void}
     */
    setClusterImageOffsetY: function (value) {
        this.set("clusterImageOffsetY", value);
    },

    /**
     * Setter for clusterText.
     * @param {String} value ClusterText.
     * @returns {void}
     */
    setClusterText: function (value) {
        this.set("clusterText", value);
    },

    /**
     * Setter for clusterTextAlign.
     * @param {String} value ClusterTextAlign.
     * @returns {void}
     */
    setClusterTextAlign: function (value) {
        this.set("clusterTextAlign", value);
    },

    /**
     * Setter for clusterTextFont.
     * @param {String} value ClusterTextFont.
     * @returns {void}
     */
    setClusterTextFont: function (value) {
        this.set("clusterTextFont", value);
    },

    /**
     * Setter for clusterTextScale.
     * @param {Number} value ClusterTextScale.
     * @returns {void}
     */
    setClusterTextScale: function (value) {
        this.set("clusterTextScale", value);
    },

    /**
     * Setter for clusterTextOffsetX.
     * @param {Number} value ClusterTextOffsetX.
     * @returns {void}
     */
    setClusterTextOffsetX: function (value) {
        this.set("clusterTextOffsetX", value);
    },

    /**
     * Setter for clusterTextOffsetY.
     * @param {Number} value ClusterTextOffsetY.
     * @returns {void}
     */
    setClusterTextOffsetY: function (value) {
        this.set("clusterTextOffsetY", value);
    },

    /**
     * Setter for clusterTextFillColor.
     * @param {Object[]} value ClusterTextFillColor.
     * @returns {void}
     */
    setClusterTextFillColor: function (value) {
        this.set("clusterTextFillColor", value);
    },

    /**
     * Setter for clusterTextStrokeColor.
     * @param {Object[]} value ClusterTextStrokeColor.
     * @returns {void}
     */
    setClusterTextStrokeColor: function (value) {
        this.set("clusterTextStrokeColor", value);
    },

    /**
     * Setter for clusterTextStrokeWidth.
     * @param {Number} value ClusterTextStrokeWidth.
     * @returns {void}
     */
    setClusterTextStrokeWidth: function (value) {
        this.set("clusterTextStrokeWidth", value);
    },

    /**
     * Setter for polygonFillColor.
     * @param {Object[]} value PolygonFillColor.
     * @returns {void}
     */
    setPolygonFillColor: function (value) {
        this.set("polygonFillColor", value);
    },

    /**
     * Setter for polygonStrokeColor.
     * @param {Object[]} value PolygonStrokeColor.
     * @returns {void}
     */
    setPolygonStrokeColor: function (value) {
        this.set("polygonStrokeColor", value);
    },

    /**
     * Setter for polygonStrokeWidth.
     * @param {Number} value PolygonStrokeWidth.
     * @returns {void}
     */
    setPolygonStrokeWidth: function (value) {
        this.set("polygonStrokeWidth", value);
    },

    /**
     * Setter for lineStrokeColor.
     * @param {Object[]} value LineStrokeColor.
     * @returns {void}
     */
    setLineStrokeColor: function (value) {
        this.set("lineStrokeColor", value);
    },

    /**
     * Setter for lineStrokeWidth.
     * @param {Number} value LineStrokeWidth.
     * @returns {void}
     */
    setLineStrokeWidth: function (value) {
        this.set("lineStrokeWidth", value);
    }
});

export default VectorStyleModel;
