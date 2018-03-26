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
                style = this.createLineStyle(feature, styleSubClass, isClustered);
            }
            else if (styleClass === "POLYGON") {
                style = this.createPolygonStyle(feature, styleSubClass, isClustered);
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
        createLineStyle: function (feature, styleSubClass, isClustered) {
            var style = this.getDefaultStyle();

            if (styleSubClass === "SIMPLE") {
                style = this.createSimpleLineStyle(feature, isClustered);
            }
            return style;
        },

        /*
        * creates a simpleLineStyle.
        * all features get the same style.
        */
        createSimpleLineStyle: function () {
            var strokecolor = this.returnColor(this.getLineStrokeColor(), "rgb"),
                strokewidth = parseInt(this.getLineStrokeWidth(), 10),
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
        createPolygonStyle: function (feature, styleSubClass, isClustered) {
            var style = this.getDefaultStyle();

            if (styleSubClass === "SIMPLE") {
                style = this.createSimplePolygonStyle(feature, isClustered);
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
                    width: this.returnColor(this.getPolygonStrokeWidth(), "rgb")
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
                isSVG = src.indexOf(".svg") > -1 ? true : false,
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
            var radius = parseInt(this.getClusterCircleRadius(), 10),
                fillcolor = this.returnColor(this.getClusterCircleFillColor(), "rgb"),
                strokecolor = this.returnColor(this.getClusterCircleStrokeColor(), "rgb"),
                strokewidth = parseInt(this.getClusterCircleStrokeWidth(), 10),
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
                isSVG = src.indexOf(".svg") > -1 ? true : false;
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
                src = (!_.isUndefined(styleFieldValueObj) && _.has(styleFieldValueObj, "imageName")) ? this.getImagePath() + styleFieldValueObj.imageName : this.getImagePath() + this.getImageName();
                isSVG = src.indexOf(".svg") > -1 ? true : false;
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
                radius = parseInt(this.getCircleRadius(), 10),
                fillcolor = this.returnColor(this.getCircleFillColor(), "rgb"),
                strokecolor = this.returnColor(this.getCircleStrokeColor(), "rgb"),
                strokewidth = parseInt(this.getCircleStrokeWidth(), 10),
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
                textObj.textAlign = this.getTextAlign();
                textObj.font = this.getTextFont().toString();
                textObj.scale = parseInt(this.getTextScale(), 10);
                textObj.offsetX = parseInt(this.getTextOffsetX(), 10);
                textObj.offsetY = parseInt(this.getTextOffsetY(), 10);
                textObj.fillcolor = this.returnColor(this.getTextFillColor(), "rgb");
                textObj.strokecolor = this.returnColor(this.getTextStrokeColor(), "rgb");
                textObj.strokewidth = parseInt(this.getTextStrokeWidth(), 10);
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
                clusterTextObj.textAlign = this.getTextAlign();
                clusterTextObj.font = this.getTextFont().toString();
                clusterTextObj.scale = parseInt(this.getTextScale(), 10);
                clusterTextObj.offsetX = parseInt(this.getTextOffsetX(), 10);
                clusterTextObj.offsetY = parseInt(this.getTextOffsetY(), 10);
                clusterTextObj.fillcolor = this.returnColor(this.getTextFillColor(), "rgb");
                clusterTextObj.strokecolor = this.returnColor(this.getTextStrokeColor(), "rgb");
                clusterTextObj.strokewidth = parseInt(this.getTextStrokeWidth(), 10);
            }
            else {
                if (this.getClusterText() === "COUNTER") {
                    clusterTextObj.text = feature.get("features").length.toString();
                }
                else if (this.getClusterText() === "NONE") {
                    return;
                }
                else {
                    clusterTextObj.text = this.getClusterText();
                }
                clusterTextObj.textAlign = this.getClusterTextAlign();
                clusterTextObj.font = this.getClusterTextFont().toString();
                clusterTextObj.scale = parseInt(this.getClusterTextScale(), 10);
                clusterTextObj.offsetX = parseInt(this.getClusterTextOffsetX(), 10);
                clusterTextObj.offsetY = parseInt(this.getClusterTextOffsetY(), 10);
                clusterTextObj.fillcolor = this.returnColor(this.getClusterTextFillColor(), "rgb");
                clusterTextObj.strokecolor = this.returnColor(this.getClusterTextStrokeColor(), "rgb");
                clusterTextObj.strokewidth = parseInt(this.getClusterTextStrokeWidth(), 10);
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

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

            return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
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
