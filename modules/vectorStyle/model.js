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
            "circleFillColor": [0, 153, 255, 1],
            "circleStrokeColor": [0, 0, 0, 1],
            "circleStrokeWidth": 2,
            // Für Label
            "textAlign": "left",
            "textFont": "Courier",
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
            "clusterTextAlign": "left",
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
            "lineStrokeWidth": 2
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
            style.setText(this.createTextStyle(feature, labelField, isClustered));
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
            var strokecolor = this.returnColor(this.get("lineStrokeColor"), "rgb"),
                strokewidth = parseFloat(this.get("lineStrokeWidth"), 10),
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
                    color: this.returnColor(this.get("polygonStrokeColor"), "rgb"),
                    width: parseFloat(this.get("polygonStrokeWidth"))
                }),
                fill = new ol.style.Fill({
                    color: this.returnColor(this.get("polygonFillColor"), "rgb")
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
            }),
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
                height =this.get("clusterImageHeight"),
                scale = this.get("clusterImageScale"),
                offset = [parseFloat(this.get("clusterImageOffsetX")), parseFloat(this.get("clusterImageOffsetY"))],
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
            var radius = parseFloat(this.get("clusterCircleRadius"), 10),
                fillcolor = this.returnColor(this.get("clusterCircleFillColor"), "rgb"),
                strokecolor = this.returnColor(this.get("clusterCircleStrokeColor"), "rgb"),
                strokewidth = parseFloat(this.get("clusterCircleStrokeWidth"), 10),
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
                src = this.get("imagePath") + this.get("imageName");
                isSVG = src.indexOf(".svg") > -1;
                width = this.get("imageWidth");
                height = this.get("imageHeight");
                scale = parseFloat(this.get("imageScale"));
                offset = [parseFloat(this.get("imageOffsetX")), parseFloat(this.get("imageOffsetY"))];
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
                radius = parseFloat(this.get("circleRadius"), 10),
                fillcolor = this.returnColor(this.get("circleFillColor"), "rgb"),
                strokecolor = this.returnColor(this.get("circleStrokeColor"), "rgb"),
                strokewidth = parseFloat(this.get("circleStrokeWidth"), 10),
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

        /*
        * creates textStyle if feature is clustered OR "labelField" is set
        */
        createTextStyle: function (feature, labelField, isClustered) {
            var textStyle,
                textObj = {};

            if (isClustered) {
                textObj = this.createClusteredTextStyle(feature, labelField);
                if (_.isUndefined(textObj)) {
                    return;
                }
            }
            else if (labelField.length === 0) {
                return;
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
            }

            textStyle = new ol.style.Text({
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
                clusterTextObj.textAlign = this.get("textAlign");
                clusterTextObj.font = this.get("textFont").toString();
                clusterTextObj.scale = parseFloat(this.get("textScale"), 10);
                clusterTextObj.offsetX = parseFloat(this.get("textOffsetX"), 10);
                clusterTextObj.offsetY = parseFloat(this.get("textOffsetY"), 10);
                clusterTextObj.fillcolor = this.returnColor(this.get("textFillColor"), "rgb");
                clusterTextObj.strokecolor = this.returnColor(this.get("textStrokeColor"), "rgb");
                clusterTextObj.strokewidth = parseFloat(this.get("textStrokeWidth"), 10);
            }
            else {
                if (this.get("clusterText") === "COUNTER") {
                    clusterTextObj.text = feature.get("features").length.toString();
                }
                else if (this.get("clusterText") === "NONE") {
                    return;
                }
                else {
                    clusterTextObj.text = this.get("clusterText");
                }
                clusterTextObj.textAlign = this.get("clusterTextAlign");
                clusterTextObj.font = this.get("clusterTextFont").toString();
                clusterTextObj.scale = parseFloat(this.get("clusterTextScale"), 10);
                clusterTextObj.offsetX = parseFloat(this.get("clusterTextOffsetX"), 10);
                clusterTextObj.offsetY = parseFloat(this.get("clusterTextOffsetY"), 10);
                clusterTextObj.fillcolor = this.returnColor(this.get("clusterTextFillColor"), "rgb");
                clusterTextObj.strokecolor = this.returnColor(this.get("clusterTextStrokeColor"), "rgb");
                clusterTextObj.strokewidth = parseFloat(this.get("clusterTextStrokeWidth"), 10);
            }
            return clusterTextObj;
        },

        /*
        * returns input color to destinated color.
        * possible values for dest are "rgb" and "hex".
        * color has to come as hex (e.g. "#ffffff" || "#fff") or as array (e.g [255,255,255,0]) or as String ("[255,255,255,0]")
        */
        returnColor: function (color, dest) {
            var src,
                newColor,
                pArray = [];

            if (_.isArray(color) && !_.isString(color)) {
                src = "rgb";
            }
            else if (_.isString(color) && color.indexOf("#") === 0) {
                src = "hex";
            }
            else if (_.isString(color) && color.indexOf("#") === -1) {
                src = "rgb";

                pArray = color.replace("[", "").replace("]", "").replace(/ /g, "").split(",");
                color = [pArray[0], pArray[1], pArray[2], pArray[3]];
            }

            if (src === "hex" && dest === "rgb") {
                newColor = this.hexToRgb(color);
            }
            else if (src === "rgb" && dest === "hex") {
                newColor = this.rgbToHex(color[0], color[1], color[2]);
            }
            else {
                newColor = color;
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
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).exec(hex);

            return result ? [parseFloat(result[1], 16), parseFloat(result[2], 16), parseFloat(result[3], 16)] : null;
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
        // getter for clusterCircleRadius
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

    return WFSStyle;
});
