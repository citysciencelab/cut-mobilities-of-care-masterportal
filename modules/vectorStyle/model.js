import {Circle as CircleStyle, Fill, Stroke, Style, Icon, Text} from "ol/style.js";

const WFSStyle = Backbone.Model.extend({
    defaults: {
        "imagePath": "",
        "class": "POINT",
        "subClass": "SIMPLE",
        "styleField": "",
        "styleFieldValues": [],
        "labelField": "",
        // für subclass SIMPLE
        "imageName": "blank.png",
        "imageWidth": 1,
        "imageHeight": 1,
        "imageScale": 1,
        "imageOffsetX": 0.5,
        "imageOffsetY": 0.5,
        // für subclass CIRCLE
        "circleRadius": 10,
        "circleFillColor": [
            0, 153, 255, 1
        ],
        "circleStrokeColor": [
            0, 0, 0, 1
        ],
        "circleStrokeWidth": 2,
        // Für Label
        "textAlign": "left",
        "textFont": "10px sans-serif",
        "textScale": 1,
        "textOffsetX": 0,
        "textOffsetY": 0,
        "textFillColor": [
            255, 255, 255, 1
        ],
        "textStrokeColor": [
            0, 0, 0, 1
        ],
        "textStrokeWidth": 3,
        // Für Cluster
        "clusterClass": "CIRCLE",
        // Für Cluster Class CIRCLE
        "clusterCircleRadius": 10,
        "clusterCircleFillColor": [
            0, 153, 255, 1
        ],
        "clusterCircleStrokeColor": [
            0, 0, 0, 1
        ],
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
        "clusterTextAlign": "left",
        "clusterTextFont": "Courier",
        "clusterTextScale": 1,
        "clusterTextOffsetX": 0,
        "clusterTextOffsetY": 0,
        "clusterTextFillColor": [
            255, 255, 255, 1
        ],
        "clusterTextStrokeColor": [
            0, 0, 0, 1
        ],
        "clusterTextStrokeWidth": 3,
        // Für Polygon
        "polygonFillColor": [
            255, 255, 255, 1
        ],
        "polygonStrokeColor": [
            0, 0, 0, 1
        ],
        "polygonStrokeWidth": 2,
        // Für Line
        "lineStrokeColor": [
            0, 0, 0, 1
        ],
        "lineStrokeWidth": 2,
        // Für subClass ADVANCED
        // Für scalingShape CIRCLESEGMENTS
        "circleSegmentsRadius": 10,
        "circleSegmentsStrokeWidth": 4,
        "circleSegmentsBackgroundColor": [
            255, 255, 255, 0
        ],
        "scalingValueDefaultColor": [
            0, 0, 0, 1
        ],
        "circleSegmentsGap": 10,
        // Für scalingShape CIRCLE_BAR
        "circleBarScalingFactor": 1,
        "circleBarRadius": 6,
        "circleBarLineStroke": 5,
        "circleBarCircleFillColor": [
            0, 0, 0, 1
        ],
        "circleBarCircleStrokeColor": [
            0, 0, 0, 1
        ],
        "circleBarCircleStrokeWidth": 1,
        "circleBarLineStrokeColor": [
            0, 0, 0, 1
        ]
    },
    initialize: function () {
        this.setImagePath(Config.wfsImgPath);
    },

    /*
    * in WFS.js this function ist set as style. for each feature, this function is called.
    * Depending on the attribute "class" the respective style is created.
    * allowed values for "class" are "POINT", "LINE", "POLYGON".
    */
    createStyle: function (feature, isClustered) {
        var style = this.getDefaultStyle(),
            styleClass = this.get("class").toUpperCase(),
            styleSubClass = this.get("subClass").toUpperCase(),
            labelField = this.get("labelField");

        if (_.isUndefined(feature)) {
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

        // after style is derived, createTextStyle
        if (_.isArray(style)) {
            style[0].setText(this.createTextStyle(feature, labelField, isClustered));
        }
        else {
            style.setText(this.createTextStyle(feature, labelField, isClustered));
        }

        return style;
    },

    /*
    * create openLayers Default Style
    */
    getDefaultStyle: function () {
        var fill = new Fill({
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

    /*
    * creates lineStyle depending on the attribute "subClass".
    * allowed values for "subClass" are "SIMPLE".
    */
    createLineStyle: function (feature, styleSubClass) {
        var style = this.getDefaultStyle();

        if (styleSubClass === "SIMPLE") {
            style = this.createSimpleLineStyle();
        }
        return style;
    },

    /*
    * creates a simpleLineStyle.
    * all features get the same style.
    */
    createSimpleLineStyle: function () {
        var strokecolor = this.returnColor(this.get("lineStrokeColor"), "rgb"),
            strokewidth = parseFloat(this.get("lineStrokeWidth"), 10),
            strokestyle = new Stroke({
                color: strokecolor,
                width: strokewidth
            }),
            style;

        style = style = new Style({
            stroke: strokestyle
        });

        return style;
    },

    /*
    * creates polygonStyle depending on the attribute "subClass".
    * allowed values for "subClass" are "SIMPLE".
    */
    createPolygonStyle: function (feature, styleSubClass) {
        var style = this.getDefaultStyle();

        if (styleSubClass === "SIMPLE") {
            style = this.createSimplePolygonStyle();
        }
        if (styleSubClass === "CUSTOM") {
            style = this.createCustomPolygonStyle(feature);
        }

        return style;
    },

    /*
    * creates a simplePolygonStyle.
    * all features get the same style.
    */
    createSimplePolygonStyle: function () {
        var strokestyle = new Stroke({
                color: this.returnColor(this.get("polygonStrokeColor"), "rgb"),
                width: parseFloat(this.get("polygonStrokeWidth"))
            }),
            fill = new Fill({
                color: this.returnColor(this.get("polygonFillColor"), "rgb")
            }),
            style;

        style = new Style({
            stroke: strokestyle,
            fill: fill
        });

        return style;
    },
    createCustomPolygonStyle: function (feature) {
        var styleField = this.get("styleField"),
            featureValue,
            styleFieldValueObj,
            polygonFillColor,
            polygonStrokeColor,
            polygonStrokeWidth,
            strokestyle,
            fillstyle,
            style = this.getDefaultStyle();

        featureValue = feature.get(styleField);
        if (!_.isUndefined(featureValue)) {
            styleFieldValueObj = _.filter(this.get("styleFieldValues"), function (styleFieldValue) {
                return styleFieldValue.styleFieldValue.toUpperCase() === featureValue.toUpperCase();
            })[0];
        }

        if (_.isUndefined(styleFieldValueObj)) {
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

    /*
    * creates pointStyle depending on the attribute "subClass".
    * allowed values for "subClass" are "SIMPLE", "CUSTOM" and "CIRCLE.
    */
    createPointStyle: function (feature, styleSubClass, isClustered) {
        var style = this.getDefaultStyle();

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

    /*
    * creates clusterStyle depending on the attribute "clusterClass".
    * allowed values for "clusterClass" are "SIMPLE" and "CIRCLE".
    */
    createClusterStyle: function () {
        var clusterClass = this.get("clusterClass"),
            clusterStyle;

        if (clusterClass === "SIMPLE") {
            clusterStyle = this.createSimpleClusterStyle();
        }
        else if (clusterClass === "CIRCLE") {
            clusterStyle = this.createCircleClusterStyle();
        }
        return clusterStyle;
    },

    /*
    * creates simpleClusterStyle.
    * all clustered features get same image.
    */
    createSimpleClusterStyle: function () {
        var src = this.get("imagePath") + this.get("clusterImageName"),
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

    /*
    * creates circleClusterStyle.
    * all clustered features get same circle.
    */
    createCircleClusterStyle: function () {
        var radius = parseFloat(this.get("clusterCircleRadius"), 10),
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

    /*
    * creates simplePointStyle.
    * all features get same image.
    */
    createSimplePointStyle: function (feature, isClustered) {
        var src,
            isSVG,
            width,
            height,
            scale,
            offset,
            imagestyle,
            style;

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
            imagestyle = new Icon({
                src: src,
                width: width,
                height: height,
                scale: scale,
                anchor: offset,
                imgSize: isSVG ? [width, height] : ""
            });
        }

        style = new Style({
            image: imagestyle
        });

        return style;

    },

    /*
    * creates customPointStyle.
    * each features gets a different image, depending on their attribute which is stored in "styleField".
    */
    createCustomPointStyle: function (feature, isClustered) {
        var styleField = this.get("styleField"),
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
            imagestyle,
            style = this.getDefaultStyle();

        if (isClustered && feature.get("features").length > 1) {
            imagestyle = this.createClusterStyle();
        }
        else {
            featureValue = !_.isUndefined(feature.get("features")) ? feature.get("features")[0].get(styleField) : feature.get(styleField);
            if (!_.isUndefined(featureValue)) {
                styleFieldValueObj = _.filter(this.get("styleFieldValues"), function (styleFieldValue) {
                    return styleFieldValue.styleFieldValue.toUpperCase() === featureValue.toUpperCase();
                })[0];
            }
            if (_.isUndefined(styleFieldValueObj)) {
                return style;
            }
            src = !_.isUndefined(styleFieldValueObj) && _.has(styleFieldValueObj, "imageName") ? this.get("imagePath") + styleFieldValueObj.imageName : this.get("imagePath") + this.get("imageName");
            isSVG = src.indexOf(".svg") > -1;
            width = styleFieldValueObj.imageWidth ? styleFieldValueObj.imageWidth : this.get("imageWidth");
            height = styleFieldValueObj.imageHeight ? styleFieldValueObj.imageHeight : this.get("imageHeight");
            scale = styleFieldValueObj.imageScale ? styleFieldValueObj.imageScale : parseFloat(this.get("imageScale"));
            imageoffsetx = styleFieldValueObj.imageOffsetX ? styleFieldValueObj.imageOffsetX : this.get("imageOffsetX");
            imageoffsety = styleFieldValueObj.imageOffsetY ? styleFieldValueObj.imageOffsetY : this.get("imageOffsetY");
            offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)];
            imagestyle = new Icon({
                src: src,
                width: width,
                height: height,
                scale: scale,
                anchor: offset,
                imgSize: isSVG ? [width, height] : ""
            });
        }

        style = new Style({
            image: imagestyle
        });

        return style;
    },

    /*
    * creates circlePointStyle.
    * all features get same circle.
    */
    createCirclePointStyle: function (feature, isClustered) {
        var radius,
            fillcolor,
            strokecolor,
            strokewidth,
            circleStyle,
            style;

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
        style = new Style({
            image: circleStyle
        });

        return style;
    },

    /**
     * create advanced style for pointFeatures
     * @param  {ol.Feature} feature - feature to be draw
     * @param  {boolean} isClustered - Value includes whether features should be clustered
     * @return {ol.Style} style
     */
    createAdvancedPointStyle: function (feature, isClustered) {
        var styleScaling = this.get("scaling").toUpperCase(),
            style,
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
            if (_.isArray(workingFeature.get("features"))) {
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
        var styleScalingShape = this.get("scalingShape").toUpperCase(),
            imageName = this.get("imageName"),
            imageNameDefault = this.defaults.imageName,
            svgPath,
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
        var styleScalingShape = this.get("scalingShape").toUpperCase(),
            svgPath,
            style;

        if (styleScalingShape === "CIRCLE_BAR") {
            svgPath = this.createIntervalCircleBar(feature);
        }

        style = this.createSVGStyle(svgPath);

        return style;

    },

    /**
     * create Style for SVG
     * @param  {String} svgPath - contains the params to be draw
     * @return {ol.Style} style
     */
    createSVGStyle: function (svgPath) {
        var size = this.get("size");

        return new Style({
            image: new Icon({
                src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgPath),
                imgSize: [size, size]
            })
        });
    },

    /*
    * creates textStyle if feature is clustered OR "labelField" is set
    */
    createTextStyle: function (feature, labelField, isClustered) {
        var textStyle,
            textObj = {};

        if (isClustered) {
            textObj = this.createClusteredTextStyle(feature, labelField);

            if (!_.isUndefined(textObj)) {
                textStyle = this.createTextStyleFromObject(textObj);
            }
        }
        else if (labelField.length === 0) {
            textStyle = undefined;
        }
        else {
            textObj.text = feature.get(labelField);
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
    createTextStyleFromObject: function (textObj) {
        var textStyle = new Text({
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
    /*
    * creates clusteredTextStyle.
    * if "clusterText" === "COUNTER" then the number if features are set
    * if "clusterText" === "NONE" no Text is shown
    * else all features get the text that is defined in "clusterText"
    */
    createClusteredTextStyle: function (feature, labelField) {
        var clusterTextObj = {};

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

    /*
    * returns input color to destinated color.
    * possible values for dest are "rgb" and "hex".
    * color has to come as hex (e.g. "#ffffff" || "#fff") or as array (e.g [255,255,255,0]) or as String ("[255,255,255,0]")
    */
    returnColor: function (color, dest) {
        var src,
            newColor = color,
            pArray = [];

        if (_.isArray(newColor) && !_.isString(newColor)) {
            src = "rgb";
        }
        else if (_.isString(newColor) && newColor.indexOf("#") === 0) {
            src = "hex";
        }
        else if (_.isString(newColor) && newColor.indexOf("#") === -1) {
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
    rgbToHex: function (r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    },
    componentToHex: function (c) {
        var hex = c.toString(16);

        return hex.length === 1 ? "0" + hex : hex;
    },
    hexToRgb: function (hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
            result,
            hexReplace;

        hexReplace = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        result = result.exec(hexReplace);

        return result ? [parseFloat(result[1], 16), parseFloat(result[2], 16), parseFloat(result[3], 16)] : null;
    },

    /**
     * makes sure that one rgb color always consists of four values
     * @param {array} newColor Color in rgb
     * @return {array} normColor
     */
    normalizeRgbColor: function (newColor) {
        var normColor = newColor;

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
     * create a svg with colored circle segments by nominal scaling
     * @param  {ol.Feature} feature - feature to be draw
     * @return {String} svg with colored circle segments
     */
    createNominalCircleSegments: function (feature) {
        var size = 10,
            circleSegmentsRadius = parseFloat(this.get("circleSegmentsRadius"), 10),
            circleSegmentsStrokeWidth = parseFloat(this.get("circleSegmentsStrokeWidth"), 10),
            circleSegmentsFillOpacity = _.last(this.get("circleSegmentsBackgroundColor")),
            circleSegmentsBackgroundColor = this.returnColor(this.get("circleSegmentsBackgroundColor"), "hex"),
            scalingValueDefaultColor = this.returnColor(this.get("scalingValueDefaultColor"), "hex"),
            scalingValues = this.get("scalingValues"),
            scalingAttributesAsObject = this.getScalingAttributesAsObject(scalingValues),
            scalingAttribute = feature.get(this.get("scalingAttribute")),
            scalingObject = this.fillScalingAttributes(scalingAttributesAsObject, scalingAttribute),
            totalSegments = _.reduce(_.values(scalingObject), function (memo, num) {
                return memo + num;
            }, 0),
            degreeSegment = totalSegments >= 0 ? 360 / totalSegments : 360,
            startAngelDegree = 0,
            endAngelDegree = degreeSegment,
            svg,
            d,
            strokeColor,
            i,
            gap = parseFloat(this.get("circleSegmentsGap"), 10);

        // calculate size
        if (((circleSegmentsRadius + circleSegmentsStrokeWidth) * 2) >= size) {
            size = size + ((circleSegmentsRadius + circleSegmentsStrokeWidth) * 2);
        }

        // is required for the display in the Internet Explorer,
        // because in addition to the SVG and the size must be specified
        this.setSize(size);

        svg = this.createSvgNominalCircleSegments(size, circleSegmentsRadius, circleSegmentsBackgroundColor, circleSegmentsStrokeWidth, circleSegmentsFillOpacity);

        _.each(scalingObject, function (value, key) {
            if (!_.isUndefined(scalingValues) && (key !== "empty")) {
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
        }, this);

        svg = svg + "</svg>";

        return svg;
    },

    /**
     * fills the object with values
     * @param {object} scalingAttributesAsObject - object with possible attributes as keys and values = 0
     * @param {string} scalingAttribute - actual states from feature
     * @return {Object} scalingObject - contains the states
     */
    fillScalingAttributes: function (scalingAttributesAsObject, scalingAttribute) {
        var scalingObject = _.isUndefined(scalingAttributesAsObject) || _.isEmpty(scalingAttributesAsObject)
                ? {empty: 0} : scalingAttributesAsObject,
            states = scalingAttribute;

        if (_.contains(states, "|")) {
            states = states.split(" | ");
        }
        else if (_.isUndefined(states)) {
            states = undefined;
        }
        else {
            states = [states];
        }

        _.each(states, function (state) {
            if (_.contains(_.keys(scalingObject), String(state))) {
                scalingObject[state] = scalingObject[state] + 1;
            }
            else {
                scalingObject.empty = scalingObject.empty + 1;
            }
        });

        return scalingObject;
    },

    /**
     * convert scalingAttributes to object
     * @param {object} scalingValues - contains attribute with color
     * @return {object} scalingAttribute with value 0
     */
    getScalingAttributesAsObject: function (scalingValues) {
        var obj = {};

        if (!_.isUndefined(scalingValues)) {
            _.each(scalingValues, function (key, value) {
                obj[value] = 0;
            });
        }

        obj.empty = 0;

        return obj;
    },

    /**
     * create SVG for nominalscaled circle segments
     * @param  {number} size - size of the section to be drawn
     * @param  {number} circleSegmentsRadius - radius from circlesegment
     * @param  {String} circleSegmentsBackgroundColor - backgroundcolor from circlesegment
     * @param  {number} circleSegmentsStrokeWidth - strokewidth from circlesegment
     * @param  {String} circleSegmentsFillOpacity - opacity from circlesegment
     * @return {String} svg
     */
    createSvgNominalCircleSegments: function (size, circleSegmentsRadius, circleSegmentsBackgroundColor, circleSegmentsStrokeWidth, circleSegmentsFillOpacity) {
        var halfSize = size / 2,
            svg = "<svg width='" + size + "'" +
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
     * extends the SVG with given tags
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
     * create circle segments
     * @param  {number} startAngelDegree - start with circle segment
     * @param  {number} endAngelDegree - finish with circle segment
     * @param  {number} circleRadius - radius from circle
     * @param  {number} size - size of the window to be draw
     * @param  {number} gap - gap between segments
     * @return {String} all circle segments
     */
    calculateCircleSegment: function (startAngelDegree, endAngelDegree, circleRadius, size, gap) {
        var rad = Math.PI / 180,
            xy = size / 2,
            isCircle = startAngelDegree === 0 && endAngelDegree === 360,
            startAngleRad,
            endAngleRad,
            xStart,
            yStart,
            xEnd,
            yEnd,
            d,
            endAngelDegreeActual = endAngelDegree,
            gapActual = gap;

        if (isCircle) {
            endAngelDegreeActual = endAngelDegreeActual / 2;
            gapActual = 0;
        }

        // convert angle from degree to radiant
        startAngleRad = (startAngelDegree + (gapActual / 2)) * rad;
        endAngleRad = (endAngelDegreeActual - (gapActual / 2)) * rad;

        xStart = xy + (Math.cos(startAngleRad) * circleRadius);
        yStart = xy - (Math.sin(startAngleRad) * circleRadius);

        xEnd = xy + (Math.cos(endAngleRad) * circleRadius);
        yEnd = xy - (Math.sin(endAngleRad) * circleRadius);

        if (isCircle) {
            d = [
                "M", xStart, yStart,
                "A", circleRadius, circleRadius, 0, 0, 0, xEnd, yEnd,
                "A", circleRadius, circleRadius, 0, 0, 0, xStart, yStart
            ].join(" ");
        }
        else {
            d = [
                "M", xStart, yStart,
                "A", circleRadius, circleRadius, 0, 0, 0, xEnd, yEnd
            ].join(" ");
        }

        return d;
    },

    /**
     * create interval circle bar
     * @param  {ol.Feature} feature - contains features to draw
     * @return {String} svg
     */
    createIntervalCircleBar: function (feature) {
        var stateValue = feature.get(this.get("scalingAttribute")),
            circleBarScalingFactor = parseFloat(this.get("circleBarScalingFactor")),
            circleBarRadius = parseFloat(this.get("circleBarRadius"), 10),
            circleBarLineStroke = parseFloat(this.get("circleBarLineStroke"), 10),
            circleBarCircleFillColor = this.returnColor(this.get("circleBarCircleFillColor"), "hex"),
            circleBarCircleStrokeColor = this.returnColor(this.get("circleBarCircleStrokeColor"), "hex"),
            circleBarCircleStrokeWidth = this.get("circleBarCircleStrokeWidth"),
            circleBarLineStrokeColor = this.returnColor(this.get("circleBarLineStrokeColor"), "hex"),
            size,
            barLength,
            svg;

        if (_.contains(stateValue, " ")) {
            stateValue = stateValue.split(" ")[0];
        }

        size = this.calculateSizeIntervalCircleBar(stateValue, circleBarScalingFactor, circleBarLineStroke, circleBarRadius);
        barLength = this.calculateLengthIntervalCircleBar(size, circleBarRadius, stateValue, circleBarScalingFactor);

        this.setSize(size);

        // create svg
        svg = this.createSvgIntervalCircleBar(size, barLength, circleBarCircleFillColor, circleBarCircleStrokeColor, circleBarCircleStrokeWidth, circleBarLineStrokeColor, circleBarLineStroke, circleBarRadius);

        return svg;
    },

    /**
     * calculate size for intervalscaled circle bar
     * @param  {number} stateValue - value from feature
     * @param  {number} circleBarScalingFactor - factor is multiplied by the stateValue
     * @param  {number} circleBarLineStroke - stroke from bar
     * @param  {number} circleBarRadius - radius from point
     * @return {number} size - size of the section to be drawn
     */
    calculateSizeIntervalCircleBar: function (stateValue, circleBarScalingFactor, circleBarLineStroke, circleBarRadius) {
        var size = circleBarRadius * 2;

        if (((stateValue * circleBarScalingFactor) + circleBarLineStroke) >= size) {
            size = size + (stateValue * circleBarScalingFactor) + circleBarLineStroke;
        }

        return size;
    },

    /**
     * calculate the length for the bar
     * @param  {number} size - size of the section to be drawn
     * @param  {number} circleBarRadius - radius from point
     * @param  {number} stateValue - value from feature
     * @param  {number} circleBarScalingFactor - factor is multiplied by the stateValue
     * @return {number} barLength
     */
    calculateLengthIntervalCircleBar: function (size, circleBarRadius, stateValue, circleBarScalingFactor) {
        var barLength;

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
     * create SVG for intervalscaled circle bars
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
        var svg = "<svg width='" + size + "'" +
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

    setCircleSegmentsBackgroundColor: function (value) {
        this.set("circleSegmentsBackgroundColor", value);
    },

    setSize: function (size) {
        this.set("size", size);
    },

    // setter for imagePath
    setImagePath: function (value) {
        this.set("imagePath", value);
    },

    // setter for class
    setClass: function (value) {
        this.set("class", value);
    },

    // setter for subClass
    setSubClass: function (value) {
        this.set("subClass", value);
    },

    // setter for styleField
    setStyleField: function (value) {
        this.set("styleField", value);
    },

    // setter for styleFieldValues
    setStyleFieldValues: function (value) {
        this.set("styleFieldValues", value);
    },

    // setter for labelField
    setLabelField: function (value) {
        this.set("labelField", value);
    },
    // für subclass SIMPLE
    // setter for imageName
    setImageName: function (value) {
        this.set("imageName", value);
    },

    // setter for imageWidth
    setImageWidth: function (value) {
        this.set("imageWidth", value);
    },

    // setter for imageHeight
    setImageHeight: function (value) {
        this.set("imageHeight", value);
    },

    // setter for imageScale
    setImageScale: function (value) {
        this.set("imageScale", value);
    },

    // setter for imageOffsetX
    setImageOffsetX: function (value) {
        this.set("imageOffsetX", value);
    },

    // setter for imageOffsetY
    setImageOffsetY: function (value) {
        this.set("imageOffsetY", value);
    },
    // setter for circleRadius
    setCircleRadius: function (value) {
        this.set("circleRadius", value);
    },

    // setter for circleFillColor
    setCircleFillColor: function (value) {
        this.set("circleFillColor", value);
    },

    // setter for circleStrokeColor
    setCircleStrokeColor: function (value) {
        this.set("circleStrokeColor", value);
    },

    // setter for circleStrokeWidth
    setCircleStrokeWidth: function (value) {
        this.set("circleStrokeWidth", value);
    },
    // Für Label
    // setter for textAlign
    setTextAlign: function (value) {
        this.set("textAlign", value);
    },

    // setter for textFont
    setTextFont: function (value) {
        this.set("textFont", value);
    },

    // setter for textScale
    setTextScale: function (value) {
        this.set("textScale", value);
    },

    // setter for textOffsetX
    setTextOffsetX: function (value) {
        this.set("textOffsetX", value);
    },

    // setter for textOffsetY
    setTextOffsetY: function (value) {
        this.set("textOffsetY", value);
    },

    // setter for textFillColor
    setTextFillColor: function (value) {
        this.set("textFillColor", value);
    },

    // setter for textStrokeColor
    setTextStrokeColor: function (value) {
        this.set("textStrokeColor", value);
    },

    // setter for textStrokeWidth
    setTextStrokeWidth: function (value) {
        this.set("textStrokeWidth", value);
    },
    // Für Cluster
    // setter for clusterClass
    setClusterClass: function (value) {
        this.set("clusterClass", value);
    },
    // Für Cluster Class CIRCLE
    // setter for clusterCircleRadius
    setClusterCircleRadius: function (value) {
        this.set("clusterCircleRadius", value);
    },

    // setter for clusterCircleFillColor
    setClusterCircleFillColor: function (value) {
        this.set("clusterCircleFillColor", value);
    },

    // setter for clusterCircleStrokeColor
    setClusterCircleStrokeColor: function (value) {
        this.set("clusterCircleStrokeColor", value);
    },

    // setter for clusterCircleStrokeWidth
    setClusterCircleStrokeWidth: function (value) {
        this.set("clusterCircleStrokeWidth", value);
    },
    // Für Cluster Class SIMPLE

    // setter for clusterImageName
    setClusterImageName: function (value) {
        this.set("clusterImageName", value);
    },

    // setter for clusterImageWidth
    setClusterImageWidth: function (value) {
        this.set("clusterImageWidth", value);
    },

    // setter for clusterImageHeight
    setClusterImageHeight: function (value) {
        this.set("clusterImageHeight", value);
    },

    // setter for clusterImageScale
    setClusterImageScale: function (value) {
        this.set("clusterImageScale", value);
    },

    // setter for clusterImageOffsetX
    setClusterImageOffsetX: function (value) {
        this.set("clusterImageOffsetX", value);
    },

    // setter for clusterImageOffsetY
    setClusterImageOffsetY: function (value) {
        this.set("clusterImageOffsetY", value);
    },
    // Für Cluster Text
    // setter for clusterText
    setClusterText: function (value) {
        this.set("clusterText", value);
    },

    // setter for clusterTextAlign
    setClusterTextAlign: function (value) {
        this.set("clusterTextAlign", value);
    },

    // setter for clusterTextFont
    setClusterTextFont: function (value) {
        this.set("clusterTextFont", value);
    },

    // setter for clusterTextScale
    setClusterTextScale: function (value) {
        this.set("clusterTextScale", value);
    },

    // setter for clusterTextOffsetX
    setClusterTextOffsetX: function (value) {
        this.set("clusterTextOffsetX", value);
    },

    // setter for clusterTextOffsetY
    setClusterTextOffsetY: function (value) {
        this.set("clusterTextOffsetY", value);
    },

    // setter for clusterTextFillColor
    setClusterTextFillColor: function (value) {
        this.set("clusterTextFillColor", value);
    },

    // setter for clusterTextStrokeColor
    setClusterTextStrokeColor: function (value) {
        this.set("clusterTextStrokeColor", value);
    },

    // setter for clusterTextStrokeWidth
    setClusterTextStrokeWidth: function (value) {
        this.set("clusterTextStrokeWidth", value);
    },
    // Für Polygon
    // setter for polygonFillColor
    setPolygonFillColor: function (value) {
        this.set("polygonFillColor", value);
    },

    // setter for polygonStrokeColor
    setPolygonStrokeColor: function (value) {
        this.set("polygonStrokeColor", value);
    },

    // setter for polygonStrokeWidth
    setPolygonStrokeWidth: function (value) {
        this.set("polygonStrokeWidth", value);
    },
    // Für Line
    // setter for lineStrokeColor
    setLineStrokeColor: function (value) {
        this.set("lineStrokeColor", value);
    },

    // setter for lineStrokeWidth
    setLineStrokeWidth: function (value) {
        this.set("lineStrokeWidth", value);
    }
});

export default WFSStyle;
