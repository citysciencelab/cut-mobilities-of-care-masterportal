define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "config"
], function (Backbone, Radio, ol, Config) {

    var WFSStyle = Backbone.Model.extend({
        defaults: {
            imagePath: "",
            class: "",
            subClass: "SIMPLE",
            styleField: "",
            styleFieldValues: [],
            labelField: "",
            // für subclass SIMPLE
            imageName: "blank.png",
            imageWidth: 1,
            imageHeight: 1,
            imageScale: 1,
            imageOffsetX: 0,
            imageOffsetY: 0,
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
            // Für Cluster Image
            clusterImageName: "blank.png",
            clusterImageWidth: 1,
            clusterImageHeight: 1,
            clusterImageScale: 1,
            clusterImageOffsetX: 0,
            clusterImageOffsetY: 0,
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
        createStyle: function (feature, isClustered) {
            var style,
                styleClass = this.get("class").toUpperCase(),
                styleSubClass = this.get("subClass").toUpperCase(),
                labelField = this.get("labelField");

            if (styleClass === "POINT") {
                style = this.createPointStyle(feature, styleSubClass, isClustered, labelField);
            }
            if (styleClass === "POLYGON") {
                style = this.createPolygonStyle(feature, styleSubClass, isClustered, labelField);
            }
            if (styleClass === "LINE") {
                style = this.createLineStyle(feature, styleSubClass, isClustered, labelField);
            }
            return style;
        },
        createLineStyle: function (feature, styleSubClass, isClustered, labelField) {
            var style;
            if (styleSubClass === "SIMPLE") {
                style = this.createSimpleLineStyle(feature, isClustered, labelField);
                style.setText(this.createTextStyle(feature, labelField, isClustered));
            }
            return style;
        },
        createSimpleLineStyle: function (feature, isClustered, labelField) {
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
        createPolygonStyle: function (feature, styleSubClass, isClustered, labelField) {
            var style;

            if (styleSubClass === "SIMPLE") {
                style = this.createSimplePolygonStyle(feature, isClustered, labelField);
                style.setText(this.createTextStyle(feature, labelField, isClustered));
            }
            return style;
        },
        createSimplePolygonStyle: function (feature, isClustered, labelField) {
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
        createPointStyle: function (feature, styleSubClass, isClustered, labelField) {
            var style;

            if (styleSubClass === "SIMPLE") {
                style = this.createSimplePointStyle(feature, isClustered);
                style.setText(this.createTextStyle(feature, labelField, isClustered));
            }
            else if (styleSubClass === "CUSTOM") {
                style = this.createCustomPointStyle(feature, isClustered);
                style.setText(this.createTextStyle(feature, labelField, isClustered));
            }
            else if (styleSubClass === "CIRCLE") {
                style = this.createCirclePointStyle(feature, isClustered);
                style.setText(this.createTextStyle(feature, labelField, isClustered));
            }
            return style;
        },
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
                    src = this.get("imagePath") + this.get("clusterImageName"),
                    isSVG = src.indexOf(".svg") > -1 ? true : false,
                    width = this.get("clusterImageWidth"),
                    height = this.get("clusterImageHeight"),
                    scale = parseFloat(this.get("clusterImageScale")),
                    offset = [parseFloat(this.get("clusterImageOffsetX")), parseFloat(this.get("clusterImageOffsetY"))],
                    imagestyle = new ol.style.Icon({
                        src: src,
                        width: width,
                        height: height,
                        scale: scale,
                        anchor: offset,
                        imgSize: isSVG ? [width, height] : ""
                    }),
                    style = new ol.style.Style({
                        image: imagestyle
                    });
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
                    style = new ol.style.Style({
                        image: imagestyle
                    });
                }

            return style;

        },
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

                // clustered
                if (isClustered) {
                    // clusterstyle aber nur 1 feature, dann custom style anwenden
                    if (feature.get("features").length === 1) {
                        featureValue = feature.get("features")[0].get(styleField);

                        styleFieldValueObj = _.filter(this.get("styleFieldValues"), function (styleFieldValue) {
                            return styleFieldValue.styleFieldValue === featureValue;
                        })[0];

                        src = (!_.isUndefined(styleFieldValueObj) && _.has(styleFieldValueObj, "imageName")) ? this.get("imagePath") + styleFieldValueObj.imageName : this.get("imagePath") + this.get("imageName");
                        isSVG = src.indexOf(".svg") > -1 ? true : false;
                        width = styleFieldValueObj.imageWidth ? styleFieldValueObj.imageWidth : this.get("imageWidth");
                        height = styleFieldValueObj.imageHeight ? styleFieldValueObj.imageHeight : this.get("imageHeight");
                        scale = styleFieldValueObj.imageScale ? styleFieldValueObj.imageScale : parseFloat(this.get("imageScale"));
                        imageoffsetx = styleFieldValueObj.imageOffsetX ? styleFieldValueObj.imageOffsetX : this.get("imageOffsetX");
                        imageoffsety = styleFieldValueObj.imageOffsetY ? styleFieldValueObj.imageOffsetY : this.get("imageOffsetY");
                        offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)];
                    }
                    // bei clusterstyle mit mehreren Features wird das Icon genommen, das im style unter imageName definiert ist
                    else {
                        src = this.get("imagePath") + this.get("clusterImageName");
                        isSVG = src.indexOf(".svg") > -1 ? true : false;
                        width = this.get("clusterImageWidth");
                        height = this.get("clusterImageHeight");
                        scale = parseFloat(this.get("clusterImageScale"));
                        imageoffsetx = this.get("clusterImageOffsetX");
                        imageoffsety = this.get("clusterImageOffsetY");
                        offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)];
                    }

                }
                // Custom Style bei nicht geclustertem Feature
                else {
                    featureValue = feature.get(styleField);
                    styleFieldValueObj = _.filter(this.get("styleFieldValues"), function (styleFieldValue) {
                        return styleFieldValue.styleFieldValue === featureValue;
                    })[0],
                    src = (!_.isUndefined(styleFieldValueObj) && _.has(styleFieldValueObj, "imageName")) ? this.get("imagePath") + styleFieldValueObj.imageName : this.get("imagePath") + this.get("imageName"),
                    isSVG = src.indexOf(".svg") > -1 ? true : false,
                    width = styleFieldValueObj.imageWidth ? styleFieldValueObj.imageWidth : this.get("imageWidth"),
                    height = styleFieldValueObj.imageHeight ? styleFieldValueObj.imageHeight : this.get("imageHeight"),
                    scale = styleFieldValueObj.imageScale ? styleFieldValueObj.imageScale : parseFloat(this.get("imageScale")),
                    imageoffsetx = styleFieldValueObj.imageOffsetX ? styleFieldValueObj.imageOffsetX : this.get("imageOffsetX"),
                    imageoffsety = styleFieldValueObj.imageOffsetY ? styleFieldValueObj.imageOffsetY : this.get("imageOffsetY"),
                    offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)];
                }

                imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height,
                    scale: scale,
                    anchor: offset,
                    imgSize: isSVG ? [width, height] : ""
                });
                style = new ol.style.Style({
                    image: imagestyle
                });

            return style;
        },
        createCirclePointStyle: function (feature, isClustered) {
            var radius,
                fillcolor,
                strokecolor,
                strokewidth = parseInt(this.get("circleStrokeWidth"), 10),
                circleStyle,
                style;

            if (isClustered && feature.get("features").length > 1) {
                src = this.get("imagePath") + this.get("clusterImageName");
                isSVG = src.indexOf(".svg") > -1 ? true : false;
                width = this.get("clusterImageWidth");
                height = this.get("clusterImageHeight");
                scale = parseFloat(this.get("clusterImageScale"));
                offset = [parseFloat(this.get("clusterImageOffsetX")), parseFloat(this.get("clusterImageOffsetY"))];
                imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height,
                    scale: scale,
                    anchor: offset,
                    imgSize: isSVG ? [width, height] : ""
                });
                style = new ol.style.Style({
                    image: imagestyle
                });

            }
            else {
                radius = parseInt(this.get("circleRadius"), 10),
                fillcolor = this.returnColor(this.get("circleFillColor"), "rgb"),
                strokecolor = this.returnColor(this.get("circleStrokeColor"), "rgb"),
                circleStyle = new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokecolor,
                        width: strokewidth
                    })
                }),
                style = new ol.style.Style({
                    image: circleStyle
                });
            }

            return style;
        },
        createTextStyle: function (feature, labelField, isClustered) {
            var text,
                textAlign,
                font,
                scale,
                offsetX,
                offsetY,
                fillcolor,
                strokecolor,
                strokewidth,
                textStyle;

                if (isClustered) {
                    if (feature.get("features").length === 1) {
                        text = feature.get("features")[0].get(labelField);
                        textAlign = this.get("textAlign");
                        font = this.get("textFont").toString();
                        scale = parseInt(this.get("textScale"), 10);
                        offsetX = parseInt(this.get("textOffsetX"), 10);
                        offsetY = parseInt(this.get("textOffsetY"), 10);
                        fillcolor = this.returnColor(this.get("textFillColor"), "rgb");
                        strokecolor = this.returnColor(this.get("textStrokeColor"), "rgb");
                        strokewidth = parseInt(this.get("textStrokeWidth"), 10);
                    }
                    else {
                        if (this.get("clusterText") === "COUNTER") {
                            text = feature.get("features").length.toString();
                        }
                        else if (this.get("clusterText") === "NONE") {
                            return;
                        }
                        else {
                            text = this.get("clusterText")
                        }
                        textAlign = this.get("clusterTextAlign");
                        font = this.get("clusterTextFont").toString();
                        scale = parseInt(this.get("clusterTextScale"), 10);
                        offsetX = parseInt(this.get("clusterTextOffsetX"), 10);
                        offsetY = parseInt(this.get("clusterTextOffsetY"), 10);
                        fillcolor = this.returnColor(this.get("clusterTextFillColor"), "rgb");
                        strokecolor = this.returnColor(this.get("clusterTextStrokeColor"), "rgb");
                        strokewidth = parseInt(this.get("clusterTextStrokeWidth"), 10);
                    }
                }
                else {
                    if (labelField.length === 0) {
                        return;
                    }
                    else {
                        text = feature.get(labelField);
                        textAlign = this.get("textAlign");
                        font = this.get("textFont").toString();
                        scale = parseInt(this.get("textScale"), 10);
                        offsetX = parseInt(this.get("textOffsetX"), 10);
                        offsetY = parseInt(this.get("textOffsetY"), 10);
                        fillcolor = this.returnColor(this.get("textFillColor"), "rgb");
                        strokecolor = this.returnColor(this.get("textStrokeColor"), "rgb");
                        strokewidth = parseInt(this.get("textStrokeWidth"), 10);
                    }
                }

                textStyle = new ol.style.Text({
                    text: text,
                    textAlign: textAlign,
                    offsetX: offsetX,
                    offsetY: offsetY,
                    font: font,
                    scale: scale,
                    fill: new ol.style.Fill({
                        color: fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokecolor,
                        width: strokewidth
                    })
                });

                return textStyle;
        },
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

            return hex.length == 1 ? "0" + hex : hex;
        },
        hexToRgb: function (hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

            return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
        }
    });

    return WFSStyle;
});
