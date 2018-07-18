define(function (require) {

    var Config = require("config"),
        ol = require("openlayers"),
        Radio = require("backbone.radio"),
        WFSStyle;

    WFSStyle = Backbone.Model.extend({
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
            "textFont": "Courier",
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
            this.setImagePath(Radio.request("Util", "getPath", Config.wfsImgPath));
        },

        /*
        * in WFS.js this function ist set as style. for each feature, this function is called.
        * Depending on the attribute "class" the respective style is created.
        * allowed values for "class" are "POINT", "LINE", "POLYGON".
        */
        createStyle: function (feature, isClustered) {
            var style = this.getDefaultStyle(),
                styleClass = this.getClass().toUpperCase(),
                styleSubClass = this.getSubClass().toUpperCase(),
                labelField = this.getLabelField();

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
            var fill = new ol.style.Fill({
                    color: "rgba(255,255,255,0.4)"
                }),
                stroke = new ol.style.Stroke({
                    color: "#3399CC",
                    width: 1.25
                });

            return new ol.style.Style({
                image: new ol.style.Circle({
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
            var strokecolor = this.returnColor(this.getLineStrokeColor(), "rgb"),
                strokewidth = parseFloat(this.getLineStrokeWidth(), 10),
                strokestyle = new ol.style.Stroke({
                    color: strokecolor,
                    width: strokewidth
                }),
                style;

            style = style = new ol.style.Style({
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
            var strokestyle = new ol.style.Stroke({
                    color: this.returnColor(this.getPolygonStrokeColor(), "rgb"),
                    width: parseFloat(this.getPolygonStrokeWidth())
                }),
                fill = new ol.style.Fill({
                    color: this.returnColor(this.getPolygonFillColor(), "rgb")
                }),
                style;

            style = new ol.style.Style({
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

            strokestyle = new ol.style.Stroke({
                color: this.returnColor(polygonStrokeColor, "rgb"),
                width: parseFloat(polygonStrokeWidth)
            });
            fillstyle = new ol.style.Fill({
                color: this.returnColor(polygonFillColor, "rgb")
            });

            style = new ol.style.Style({
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
            var clusterClass = this.getClusterClass(),
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
            var src = this.getImagePath() + this.getClusterImageName(),
                isSVG = src.indexOf(".svg") > -1,
                width = this.getClusterImageWidth(),
                height = this.getClusterImageHeight(),
                scale = parseFloat(this.getClusterImageScale()),
                offset = [parseFloat(this.getClusterImageOffsetX()), parseFloat(this.getClusterImageOffsetY())],
                clusterStyle = new ol.style.Icon({
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
            var radius = parseFloat(this.getClusterCircleRadius(), 10),
                fillcolor = this.returnColor(this.getClusterCircleFillColor(), "rgb"),
                strokecolor = this.returnColor(this.getClusterCircleStrokeColor(), "rgb"),
                strokewidth = parseFloat(this.getClusterCircleStrokeWidth(), 10),
                clusterStyle = new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: fillcolor
                    }),
                    stroke: new ol.style.Stroke({
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
                src = this.getImagePath() + this.getImageName();
                isSVG = src.indexOf(".svg") > -1;
                width = this.getImageWidth();
                height = this.getImageHeight();
                scale = parseFloat(this.getImageScale());
                offset = [parseFloat(this.getImageOffsetX()), parseFloat(this.getImageOffsetY())];
                imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height,
                    scale: scale,
                    anchor: offset,
                    imgSize: isSVG ? [width, height] : ""
                });
            }

            style = new ol.style.Style({
                image: imagestyle
            });

            return style;

        },

        /*
        * creates customPointStyle.
        * each features gets a different image, depending on their attribute which is stored in "styleField".
        */
        createCustomPointStyle: function (feature, isClustered) {
            var styleField = this.getStyleField(),
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
                    styleFieldValueObj = _.filter(this.getStyleFieldValues(), function (styleFieldValue) {
                        return styleFieldValue.styleFieldValue.toUpperCase() === featureValue.toUpperCase();
                    })[0];
                }
                if (_.isUndefined(styleFieldValueObj)) {
                    return style;
                }
                src = !_.isUndefined(styleFieldValueObj) && _.has(styleFieldValueObj, "imageName") ? this.getImagePath() + styleFieldValueObj.imageName : this.getImagePath() + this.getImageName();
                isSVG = src.indexOf(".svg") > -1;
                width = styleFieldValueObj.imageWidth ? styleFieldValueObj.imageWidth : this.getImageWidth();
                height = styleFieldValueObj.imageHeight ? styleFieldValueObj.imageHeight : this.getImageHeight();
                scale = styleFieldValueObj.imageScale ? styleFieldValueObj.imageScale : parseFloat(this.getImageScale());
                imageoffsetx = styleFieldValueObj.imageOffsetX ? styleFieldValueObj.imageOffsetX : this.getImageOffsetX();
                imageoffsety = styleFieldValueObj.imageOffsetY ? styleFieldValueObj.imageOffsetY : this.getImageOffsetY();
                offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)];
                imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height,
                    scale: scale,
                    anchor: offset,
                    imgSize: isSVG ? [width, height] : ""
                });
            }

            style = new ol.style.Style({
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
                radius = parseFloat(this.getCircleRadius(), 10);
                fillcolor = this.returnColor(this.getCircleFillColor(), "rgb");
                strokecolor = this.returnColor(this.getCircleStrokeColor(), "rgb");
                strokewidth = parseFloat(this.getCircleStrokeWidth(), 10);
                circleStyle = new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokecolor,
                        width: strokewidth
                    })
                });
            }
            style = new ol.style.Style({
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

                style = new ol.style.Style({
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
            var size = this.getSize();

            return new ol.style.Style({
                image: new ol.style.Icon({
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
                textObj.textAlign = this.getTextAlign();
                textObj.font = this.getTextFont().toString();
                textObj.scale = parseFloat(this.getTextScale(), 10);
                textObj.offsetX = parseFloat(this.getTextOffsetX(), 10);
                textObj.offsetY = parseFloat(this.getTextOffsetY(), 10);
                textObj.fillcolor = this.returnColor(this.getTextFillColor(), "rgb");
                textObj.strokecolor = this.returnColor(this.getTextStrokeColor(), "rgb");
                textObj.strokewidth = parseFloat(this.getTextStrokeWidth(), 10);

                textStyle = this.createTextStyleFromObject(textObj);
            }

            return textStyle;
        },
        createTextStyleFromObject: function (textObj) {
            var textStyle = new ol.style.Text({
                text: textObj.text,
                textAlign: textObj.textAlign,
                offsetX: textObj.offsetX,
                offsetY: textObj.offsetY,
                font: textObj.font,
                scale: textObj.scale,
                fill: new ol.style.Fill({
                    color: textObj.fillcolor
                }),
                stroke: new ol.style.Stroke({
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
                clusterTextObj.textAlign = this.getTextAlign();
                clusterTextObj.font = this.getTextFont().toString();
                clusterTextObj.scale = parseFloat(this.getTextScale(), 10);
                clusterTextObj.offsetX = parseFloat(this.getTextOffsetX(), 10);
                clusterTextObj.offsetY = parseFloat(this.getTextOffsetY(), 10);
                clusterTextObj.fillcolor = this.returnColor(this.getTextFillColor(), "rgb");
                clusterTextObj.strokecolor = this.returnColor(this.getTextStrokeColor(), "rgb");
                clusterTextObj.strokewidth = parseFloat(this.getTextStrokeWidth(), 10);
            }
            else if (this.getClusterText() === "COUNTER") {
                clusterTextObj.text = feature.get("features").length.toString();
                clusterTextObj = this.extendClusterTextStyle(clusterTextObj);
            }
            else if (this.getClusterText() === "NONE") {
                clusterTextObj = undefined;
            }
            else {
                clusterTextObj.text = this.getClusterText();
                clusterTextObj = this.extendClusterTextStyle(clusterTextObj);
            }

            return clusterTextObj;
        },

        extendClusterTextStyle: function (clusterTextObj) {
            clusterTextObj.textAlign = this.getClusterTextAlign();
            clusterTextObj.font = this.getClusterTextFont().toString();
            clusterTextObj.scale = parseFloat(this.getClusterTextScale(), 10);
            clusterTextObj.offsetX = parseFloat(this.getClusterTextOffsetX(), 10);
            clusterTextObj.offsetY = parseFloat(this.getClusterTextOffsetY(), 10);
            clusterTextObj.fillcolor = this.returnColor(this.getClusterTextFillColor(), "rgb");
            clusterTextObj.strokecolor = this.returnColor(this.getClusterTextStrokeColor(), "rgb");
            clusterTextObj.strokewidth = parseFloat(this.getClusterTextStrokeWidth(), 10);

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

        getSize: function () {
            return this.get("size");
        },

        // getter for imagePath
        getImagePath: function () {
            return this.get("imagePath");
        },
        // setter for imagePath
        setImagePath: function (value) {
            this.set("imagePath", value);
        },

        // getter for class
        getClass: function () {
            return this.get("class");
        },
        // setter for class
        setClass: function (value) {
            this.set("class", value);
        },

        // getter for subClass
        getSubClass: function () {
            return this.get("subClass");
        },
        // setter for subClass
        setSubClass: function (value) {
            this.set("subClass", value);
        },

        // getter for styleField
        getStyleField: function () {
            return this.get("styleField");
        },
        // setter for styleField
        setStyleField: function (value) {
            this.set("styleField", value);
        },

        // getter for styleFieldValues
        getStyleFieldValues: function () {
            return this.get("styleFieldValues");
        },
        // setter for styleFieldValues
        setStyleFieldValues: function (value) {
            this.set("styleFieldValues", value);
        },

        // getter for labelField
        getLabelField: function () {
            return this.get("labelField");
        },
        // setter for labelField
        setLabelField: function (value) {
            this.set("labelField", value);
        },
        // für subclass SIMPLE
        // getter for imageName
        getImageName: function () {
            return this.get("imageName");
        },
        // setter for imageName
        setImageName: function (value) {
            this.set("imageName", value);
        },

        // getter for imageWidth
        getImageWidth: function () {
            return this.get("imageWidth");
        },
        // setter for imageWidth
        setImageWidth: function (value) {
            this.set("imageWidth", value);
        },

        // getter for imageHeight
        getImageHeight: function () {
            return this.get("imageHeight");
        },
        // setter for imageHeight
        setImageHeight: function (value) {
            this.set("imageHeight", value);
        },

        // getter for imageScale
        getImageScale: function () {
            return this.get("imageScale");
        },
        // setter for imageScale
        setImageScale: function (value) {
            this.set("imageScale", value);
        },

        // getter for imageOffsetX
        getImageOffsetX: function () {
            return this.get("imageOffsetX");
        },
        // setter for imageOffsetX
        setImageOffsetX: function (value) {
            this.set("imageOffsetX", value);
        },

        // getter for imageOffsetY
        getImageOffsetY: function () {
            return this.get("imageOffsetY");
        },
        // setter for imageOffsetY
        setImageOffsetY: function (value) {
            this.set("imageOffsetY", value);
        },
        // Für subclass CIRCLE
        // getter for circleRadius
        getCircleRadius: function () {
            return this.get("circleRadius");
        },
        // setter for circleRadius
        setCircleRadius: function (value) {
            this.set("circleRadius", value);
        },

        // getter for circleFillColor
        getCircleFillColor: function () {
            return this.get("circleFillColor");
        },
        // setter for circleFillColor
        setCircleFillColor: function (value) {
            this.set("circleFillColor", value);
        },

        // getter for circleStrokeColor
        getCircleStrokeColor: function () {
            return this.get("circleStrokeColor");
        },
        // setter for circleStrokeColor
        setCircleStrokeColor: function (value) {
            this.set("circleStrokeColor", value);
        },

        // getter for circleStrokeWidth
        getCircleStrokeWidth: function () {
            return this.get("circleStrokeWidth");
        },
        // setter for circleStrokeWidth
        setCircleStrokeWidth: function (value) {
            this.set("circleStrokeWidth", value);
        },
        // Für Label
        // getter for textAlign
        getTextAlign: function () {
            return this.get("textAlign");
        },
        // setter for textAlign
        setTextAlign: function (value) {
            this.set("textAlign", value);
        },

        // getter for textFont
        getTextFont: function () {
            return this.get("textFont");
        },
        // setter for textFont
        setTextFont: function (value) {
            this.set("textFont", value);
        },

        // getter for textScale
        getTextScale: function () {
            return this.get("textScale");
        },
        // setter for textScale
        setTextScale: function (value) {
            this.set("textScale", value);
        },

        // getter for textOffsetX
        getTextOffsetX: function () {
            return this.get("textOffsetX");
        },
        // setter for textOffsetX
        setTextOffsetX: function (value) {
            this.set("textOffsetX", value);
        },

        // getter for textOffsetY
        getTextOffsetY: function () {
            return this.get("textOffsetY");
        },
        // setter for textOffsetY
        setTextOffsetY: function (value) {
            this.set("textOffsetY", value);
        },

        // getter for textFillColor
        getTextFillColor: function () {
            return this.get("textFillColor");
        },
        // setter for textFillColor
        setTextFillColor: function (value) {
            this.set("textFillColor", value);
        },

        // getter for textStrokeColor
        getTextStrokeColor: function () {
            return this.get("textStrokeColor");
        },
        // setter for textStrokeColor
        setTextStrokeColor: function (value) {
            this.set("textStrokeColor", value);
        },

        // getter for textStrokeWidth
        getTextStrokeWidth: function () {
            return this.get("textStrokeWidth");
        },
        // setter for textStrokeWidth
        setTextStrokeWidth: function (value) {
            this.set("textStrokeWidth", value);
        },
        // Für Cluster
        // getter for clusterClass
        getClusterClass: function () {
            return this.get("clusterClass");
        },
        // setter for clusterClass
        setClusterClass: function (value) {
            this.set("clusterClass", value);
        },
        // Für Cluster Class CIRCLE
        // getter for clusterCircleRadius
        getClusterCircleRadius: function () {
            return this.get("clusterCircleRadius");
        },
        // setter for clusterCircleRadius
        setClusterCircleRadius: function (value) {
            this.set("clusterCircleRadius", value);
        },

        // getter for clusterCircleFillColor
        getClusterCircleFillColor: function () {
            return this.get("clusterCircleFillColor");
        },
        // setter for clusterCircleFillColor
        setClusterCircleFillColor: function (value) {
            this.set("clusterCircleFillColor", value);
        },

        // getter for clusterCircleStrokeColor
        getClusterCircleStrokeColor: function () {
            return this.get("clusterCircleStrokeColor");
        },
        // setter for clusterCircleStrokeColor
        setClusterCircleStrokeColor: function (value) {
            this.set("clusterCircleStrokeColor", value);
        },

        // getter for clusterCircleStrokeWidth
        getClusterCircleStrokeWidth: function () {
            return this.get("clusterCircleStrokeWidth");
        },
        // setter for clusterCircleStrokeWidth
        setClusterCircleStrokeWidth: function (value) {
            this.set("clusterCircleStrokeWidth", value);
        },
        // Für Cluster Class SIMPLE
        // getter for clusterImageName
        getClusterImageName: function () {
            return this.get("clusterImageName");
        },
        // setter for clusterImageName
        setClusterImageName: function (value) {
            this.set("clusterImageName", value);
        },

        // getter for clusterImageWidth
        getClusterImageWidth: function () {
            return this.get("clusterImageWidth");
        },
        // setter for clusterImageWidth
        setClusterImageWidth: function (value) {
            this.set("clusterImageWidth", value);
        },

        // getter for clusterImageHeight
        getClusterImageHeight: function () {
            return this.get("clusterImageHeight");
        },
        // setter for clusterImageHeight
        setClusterImageHeight: function (value) {
            this.set("clusterImageHeight", value);
        },

        // getter for clusterImageScale
        getClusterImageScale: function () {
            return this.get("clusterImageScale");
        },
        // setter for clusterImageScale
        setClusterImageScale: function (value) {
            this.set("clusterImageScale", value);
        },

        // getter for clusterImageOffsetX
        getClusterImageOffsetX: function () {
            return this.get("clusterImageOffsetX");
        },
        // setter for clusterImageOffsetX
        setClusterImageOffsetX: function (value) {
            this.set("clusterImageOffsetX", value);
        },

        // getter for clusterImageOffsetY
        getClusterImageOffsetY: function () {
            return this.get("clusterImageOffsetY");
        },
        // setter for clusterImageOffsetY
        setClusterImageOffsetY: function (value) {
            this.set("clusterImageOffsetY", value);
        },
        // Für Cluster Text
        // getter for clusterText
        getClusterText: function () {
            return this.get("clusterText");
        },
        // setter for clusterText
        setClusterText: function (value) {
            this.set("clusterText", value);
        },

        // getter for clusterTextAlign
        getClusterTextAlign: function () {
            return this.get("clusterTextAlign");
        },
        // setter for clusterTextAlign
        setClusterTextAlign: function (value) {
            this.set("clusterTextAlign", value);
        },

        // getter for clusterTextFont
        getClusterTextFont: function () {
            return this.get("clusterTextFont");
        },
        // setter for clusterTextFont
        setClusterTextFont: function (value) {
            this.set("clusterTextFont", value);
        },

        // getter for clusterTextScale
        getClusterTextScale: function () {
            return this.get("clusterTextScale");
        },
        // setter for clusterTextScale
        setClusterTextScale: function (value) {
            this.set("clusterTextScale", value);
        },

        // getter for clusterTextOffsetX
        getClusterTextOffsetX: function () {
            return this.get("clusterTextOffsetX");
        },
        // setter for clusterTextOffsetX
        setClusterTextOffsetX: function (value) {
            this.set("clusterTextOffsetX", value);
        },

        // getter for clusterTextOffsetY
        getClusterTextOffsetY: function () {
            return this.get("clusterTextOffsetY");
        },
        // setter for clusterTextOffsetY
        setClusterTextOffsetY: function (value) {
            this.set("clusterTextOffsetY", value);
        },

        // getter for clusterTextFillColor
        getClusterTextFillColor: function () {
            return this.get("clusterTextFillColor");
        },
        // setter for clusterTextFillColor
        setClusterTextFillColor: function (value) {
            this.set("clusterTextFillColor", value);
        },

        // getter for clusterTextStrokeColor
        getClusterTextStrokeColor: function () {
            return this.get("clusterTextStrokeColor");
        },
        // setter for clusterTextStrokeColor
        setClusterTextStrokeColor: function (value) {
            this.set("clusterTextStrokeColor", value);
        },

        // getter for clusterTextStrokeWidth
        getClusterTextStrokeWidth: function () {
            return this.get("clusterTextStrokeWidth");
        },
        // setter for clusterTextStrokeWidth
        setClusterTextStrokeWidth: function (value) {
            this.set("clusterTextStrokeWidth", value);
        },
        // Für Polygon
        // getter for polygonFillColor
        getPolygonFillColor: function () {
            return this.get("polygonFillColor");
        },
        // setter for polygonFillColor
        setPolygonFillColor: function (value) {
            this.set("polygonFillColor", value);
        },

        // getter for polygonStrokeColor
        getPolygonStrokeColor: function () {
            return this.get("polygonStrokeColor");
        },
        // setter for polygonStrokeColor
        setPolygonStrokeColor: function (value) {
            this.set("polygonStrokeColor", value);
        },

        // getter for polygonStrokeWidth
        getPolygonStrokeWidth: function () {
            return this.get("polygonStrokeWidth");
        },
        // setter for polygonStrokeWidth
        setPolygonStrokeWidth: function (value) {
            this.set("polygonStrokeWidth", value);
        },
        // Für Line
        // getter for lineStrokeColor
        getLineStrokeColor: function () {
            return this.get("lineStrokeColor");
        },
        // setter for lineStrokeColor
        setLineStrokeColor: function (value) {
            this.set("lineStrokeColor", value);
        },

        // getter for lineStrokeWidth
        getLineStrokeWidth: function () {
            return this.get("lineStrokeWidth");
        },
        // setter for lineStrokeWidth
        setLineStrokeWidth: function (value) {
            this.set("lineStrokeWidth", value);
        }
    });

    return WFSStyle;
});
