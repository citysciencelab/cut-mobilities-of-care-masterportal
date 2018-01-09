define(function (require) {

    var Config = require("config"),
        WFSStyle;

        WFSStyle = Backbone.Model.extend({
        defaults: {
            imagePath: "",
            class: "POINT",
            subClass: "SIMPLE",
            styleField: "",
            styleFieldValues: [],
            labelField: "",
            // für subclass SIMPLE
            imageName: "blank.png",
            imageWidth: 1,
            imageHeight: 1,
            imageScale: 1,
            imageOffsetX: 0.5,
            imageOffsetY: 0.5,
            // für subclass CIRCLE
            circleRadius: 10,
            circleFillColor: [0, 153, 255, 1],
            circleStrokeColor: [0, 0, 0, 1],
            circleStrokeWidth: 2,
            // Für Label
            textAlign: "left",
            textFont: "Courier",
            textScale: 1,
            textOffsetX: 0,
            textOffsetY: 0,
            textFillColor: [255, 255, 255, 1],
            textStrokeColor: [0, 0, 0, 1],
            textStrokeWidth: 3,
            // Für Cluster
            clusterClass: "CIRCLE",
            // Für Cluster Class CIRCLE
            clusterCircleRadius: 10,
            clusterCircleFillColor: [0, 153, 255, 1],
            clusterCircleStrokeColor: [0, 0, 0, 1],
            clusterCircleStrokeWidth: 2,
            // Für Cluster Class SIMPLE
            clusterImageName: "blank.png",
            clusterImageWidth: 1,
            clusterImageHeight: 1,
            clusterImageScale: 1,
            clusterImageOffsetX: 0.5,
            clusterImageOffsetY: 0.5,
            // Für Cluster Text
            clusterText: "COUNTER",
            clusterTextAlign: "left",
            clusterTextFont: "Courier",
            clusterTextScale: 1,
            clusterTextOffsetX: 0,
            clusterTextOffsetY: 0,
            clusterTextFillColor: [255, 255, 255, 1],
            clusterTextStrokeColor: [0, 0, 0, 1],
            clusterTextStrokeWidth: 3,
            // Für Polygon
            polygonFillColor: [255, 255, 255, 1],
            polygonStrokeColor: [0, 0, 0, 1],
            polygonStrokeWidth: 2,
            // Für Line
            lineStrokeColor: [0, 0, 0, 1],
            lineStrokeWidth: 2
        },
        initialize: function () {
            this.set("imagePath", Radio.request("Util", "getPath", Config.wfsImgPath));
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

            if (styleClass === "POINT") {
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
            var style;

            if (styleSubClass === "SIMPLE") {
                style = this.createSimpleLineStyle(feature, isClustered);
            }
            return style;
        },

        /*
        * creates a simpleLineStyle.
        * all features get the same style.
        */
        createSimpleLineStyle: function (feature, isClustered) {
            var strokecolor = this.returnColor(this.get("lineStrokeColor"), "rgb"),
                strokewidth = parseInt(this.get("lineStrokeWidth"), 10),
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
            var style;

            if (styleSubClass === "SIMPLE") {
                style = this.createSimplePolygonStyle(feature, isClustered);
            }

            return style;
        },

        /*
        * creates a simplePolygonStyle.
        * all features get the same style.
        */
        createSimplePolygonStyle: function (feature, isClustered) {
            var strokestyle = new ol.style.Stroke({
                    color: this.returnColor(this.get("polygonStrokeColor"), "rgb"),
                    width: this.returnColor(this.get("polygonStrokeWidth"), "rgb")
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

        /*
        * creates pointStyle depending on the attribute "subClass".
        * allowed values for "subClass" are "SIMPLE", "CUSTOM" and "CIRCLE.
        */
        createPointStyle: function (feature, styleSubClass, isClustered) {
            var style;

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
                isSVG = src.indexOf(".svg") > -1 ? true : false,
                width = this.get("clusterImageWidth"),
                height = this.get("clusterImageHeight"),
                scale = parseFloat(this.get("clusterImageScale")),
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
            var radius = parseInt(this.get("clusterCircleRadius"), 10),
                fillcolor = this.returnColor(this.get("clusterCircleFillColor"), "rgb"),
                strokecolor = this.returnColor(this.get("clusterCircleStrokeColor"), "rgb"),
                strokewidth = parseInt(this.get("clusterCircleStrokeWidth"), 10),
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
                    isSVG = src.indexOf(".svg") > -1 ? true : false;
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
                style;

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
                    if (!_.isUndefined(styleFieldValueObj)) {
                        src = (!_.isUndefined(styleFieldValueObj) && _.has(styleFieldValueObj, "imageName")) ? this.get("imagePath") + styleFieldValueObj.imageName : this.get("imagePath") + this.get("imageName");
                        isSVG = src.indexOf(".svg") > -1 ? true : false;
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
                radius = parseInt(this.get("circleRadius"), 10),
                fillcolor = this.returnColor(this.get("circleFillColor"), "rgb"),
                strokecolor = this.returnColor(this.get("circleStrokeColor"), "rgb"),
                strokewidth = parseInt(this.get("circleStrokeWidth"), 10),
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
                clusteredTextObj = {};

                if (isClustered) {
                    clusteredTextObj = this.createClusteredTextStyle(feature, labelField);
                }
                else if (labelField.length === 0) {
                    return;
                }
                else {
                    clusteredTextObj.text = feature.get(labelField);
                    clusteredTextObj.textAlign = this.get("textAlign");
                    clusteredTextObj.font = this.get("textFont").toString();
                    clusteredTextObj.scale = parseInt(this.get("textScale"), 10);
                    clusteredTextObj.offsetX = parseInt(this.get("textOffsetX"), 10);
                    clusteredTextObj.offsetY = parseInt(this.get("textOffsetY"), 10);
                    clusteredTextObj.fillcolor = this.returnColor(this.get("textFillColor"), "rgb");
                    clusteredTextObj.strokecolor = this.returnColor(this.get("textStrokeColor"), "rgb");
                    clusteredTextObj.strokewidth = parseInt(this.get("textStrokeWidth"), 10);
                }

                textStyle = new ol.style.Text({
                    text: clusteredTextObj.text,
                    textAlign: clusteredTextObj.textAlign,
                    offsetX: clusteredTextObj.offsetX,
                    offsetY: clusteredTextObj.offsetY,
                    font: clusteredTextObj.font,
                    scale: clusteredTextObj.scale,
                    fill: new ol.style.Fill({
                        color: clusteredTextObj.fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: clusteredTextObj.strokecolor,
                        width: clusteredTextObj.strokewidth
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
                clusterTextObj.scale = parseInt(this.get("textScale"), 10);
                clusterTextObj.offsetX = parseInt(this.get("textOffsetX"), 10);
                clusterTextObj.offsetY = parseInt(this.get("textOffsetY"), 10);
                clusterTextObj.fillcolor = this.returnColor(this.get("textFillColor"), "rgb");
                clusterTextObj.strokecolor = this.returnColor(this.get("textStrokeColor"), "rgb");
                clusterTextObj.strokewidth = parseInt(this.get("textStrokeWidth"), 10);
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
                clusterTextObj.scale = parseInt(this.get("clusterTextScale"), 10);
                clusterTextObj.offsetX = parseInt(this.get("clusterTextOffsetX"), 10);
                clusterTextObj.offsetY = parseInt(this.get("clusterTextOffsetY"), 10);
                clusterTextObj.fillcolor = this.returnColor(this.get("clusterTextFillColor"), "rgb");
                clusterTextObj.strokecolor = this.returnColor(this.get("clusterTextStrokeColor"), "rgb");
                clusterTextObj.strokewidth = parseInt(this.get("clusterTextStrokeWidth"), 10);
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
        }
    });

    return WFSStyle;
});
