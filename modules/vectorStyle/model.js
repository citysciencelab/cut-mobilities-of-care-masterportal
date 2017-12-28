define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "config"
], function (Backbone, Radio, ol, Config) {

    var WFSStyle = Backbone.Model.extend({
        defaults: {
            styleCache: [],
            class: "POINT",
            subclass: "SIMPLE",
            styleField: "",
            styleFieldValues: [],
            labelField: "",
            // für SIMPLE
            imagename: "blank.png",
            imagewidth: 1,
            imageheight: 1,
            imagescale: 1,
            imageoffsetx: 0,
            imageoffsety: 0,
            // für Circle
            circleradius: 10,
            circlefillcolor: [0, 153, 255, 1],
            circlestrokecolor: [0, 0, 0, 1],
            // Für Label
            textAlign: "left",
            textfont: "Courier",
            textscale: 1,
            textoffsetx: 0,
            textoffsety: 0,
            textfillcolor: [255, 255, 255, 1],
            textstrokecolor: [0, 0, 0, 1],
            textstrokewidth: 3,
            // Für ClusterText
            clusterfont: "Courier",
            clusterscale: 1,
            clusteroffsetx: 0,
            clusteroffsety: 0,
            clusterfillcolor: [255, 255, 255, 1],
            clusterstrokecolor: [0, 0, 0, 1],
            clusterstrokewidth: 3,
            // Für Polygon
            fillcolor: [255, 255, 255, 1]
        },
        initialize: function () {
            this.set("imagepath", Radio.request("Util", "getPath", Config.wfsImgPath))
        },
        createStyle: function (feature) {
            var style,
                styleClass = this.get("class").toUpperCase();

            if (styleClass === "POINT") {
                style = this.createPointStyle(feature);
            }
            return style;
        },
        createPointStyle: function (feature) {
            var style,
                styleSubClass = this.get("subclass").toUpperCase(),
                labelField = this.get("labelField");

            if (styleSubClass === "SIMPLE") {
                style = this.createSimplePointStyle();
                if (labelField.length > 0) {
                    style.setText(this.createTextStyle(feature, labelField));
                }
            }
            else if (styleSubClass === "CUSTOM") {
                style = this.createCustomPointStyle(feature);
                if (labelField.length > 0) {
                    style.setText(this.createTextStyle(feature, labelField));
                }
            }
            else if (styleSubClass === "CIRCLE") {
                style = this.createCirclePointStyle();
                if (labelField.length > 0) {
                    style.setText(this.createTextStyle(feature, labelField));
                }
            }
            return style;
        },
        createSimplePointStyle: function () {
            var src = this.get("imagepath") + this.get("imagename"),
                isSVG = src.indexOf(".svg") > -1 ? true : false,
                width = this.get("imagewidth"),
                height = this.get("imageheight"),
                scale = parseFloat(this.get("imagescale")),
                offset = [parseFloat(this.get("imageoffsetx")), parseFloat(this.get("imageoffsety"))],
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

            return style;
        },
        createCustomPointStyle: function (feature) {
            var styleField = this.get("styleField"),
                featureValue = feature.get(styleField),
                styleFieldValueObj = _.filter(this.get("styleFieldValues"), function (styleFieldValue) {
                    return styleFieldValue.styleFieldValue === featureValue
                })[0],
                src = this.get("imagepath") + styleFieldValueObj.imagename,
                isSVG = src.indexOf(".svg") > -1 ? true : false,
                width = styleFieldValueObj.imagewidth ? styleFieldValueObj.imagewidth : this.get("imagewidth"),
                height = styleFieldValueObj.imageheight ? styleFieldValueObj.imageheight : this.get("imageheight"),
                scale = styleFieldValueObj.imagescale ? styleFieldValueObj.imagescale : parseFloat(this.get("imagescale")),
                imageoffsetx = styleFieldValueObj.imageoffsetx ? styleFieldValueObj.imageoffsetx : this.get("imageoffsetx"),
                imageoffsety = styleFieldValueObj.imageoffsety ? styleFieldValueObj.imageoffsety : this.get("imageoffsety"),
                offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)],
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

            return style;
        },
        createCirclePointStyle: function () {
            var radius = parseInt(this.get("circleradius"), 10),
                fillcolor = this.returnColor(this.get("circlefillcolor")),
                strokecolor = this.returnColor(this.get("circlestrokecolor")),
                circleStyle = new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokecolor
                    })
                }),
                style = new ol.style.Style({
                    image: circleStyle
                });

                return style;
        },
        createTextStyle: function (feature, labelField) {
            var text = feature.get(labelField),
                textAlign = this.get("textAlign"),
                font = this.get("textfont").toString(),
                scale = parseInt(this.get("textscale"), 10),
                offsetX = parseInt(this.get("textoffsetx"), 10),
                offsetY = parseInt(this.get("textoffsety"), 10),
                fillcolor = this.returnColor(this.get("textfillcolor")),
                strokecolor = this.returnColor(this.get("textstrokecolor")),
                strokewidth = parseInt(this.get("textstrokewidth"), 10),
                textStyle;

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
        returnColor: function (textstring) {
            if (typeof textstring === "string") {
                var pArray = [];

                pArray = textstring.replace("[", "").replace("]", "").replace(/ /g, "").split(",");
                return [pArray[0], pArray[1], pArray[2], pArray[3]];
            }
            else {
                return textstring;
            }
        },

        // getter for createdStyle
        getCreatedStyle: function () {
            return this.get("createdStyle");
        },
        // setter for createdStyle
        setCreatedStyle: function (value) {
            this.set("createdStyle", value);
        }
        /*
        * Fügt dem normalen Symbol ein Symbol für das Cluster hinzu und gibt evtl. den Cache zurück
        */
        // getClusterStyle: function (feature) {
        //     var mycoll = new ol.Collection(feature.get("features")),
        //         size = mycoll.getLength(),
        //         style = this.get("styleCache")[size];
        //     if (!style) {
        //         if (size !== 1) {
        //             style = this.getClusterSymbol(size);
        //         }
        //         else {
        //             style = this.getSimpleStyle();
        //         }
        //         this.get("styleCache")[size] = style;
        //     }
        //     return style;
        // },
        // getClusterSymbol: function (anzahl) {
        //     if (anzahl !== "") {
        //         var font = this.get("clusterfont").toString(),
        //             color = this.returnColor(this.get("clustercolor")),
        //             scale = parseInt(this.get("clusterscale"), 10),
        //             offsetX = parseInt(this.get("clusteroffsetx"), 10),
        //             offsetY = parseInt(this.get("clusteroffsety"), 10),
        //             fillcolor = this.returnColor(this.get("clusterfillcolor")),
        //             strokecolor = this.returnColor(this.get("clusterstrokecolor")),
        //             strokewidth = parseInt(this.get("clusterstrokewidth"), 10),
        //             clusterText = new ol.style.Text({
        //                 text: anzahl.toString(),
        //                 offsetX: offsetX,
        //                 offsetY: offsetY,
        //                 font: font,
        //                 color: color,
        //                 scale: scale,
        //                 fill: new ol.style.Fill({
        //                     color: fillcolor
        //                 }),
        //                 stroke: new ol.style.Stroke({
        //                     color: strokecolor,
        //                     width: strokewidth
        //                 })
        //             }),
        //             style = this.getSimpleStyle();

        //         style.push(
        //         new ol.style.Style({
        //             text: clusterText,
        //             zIndex: "Infinity"
        //         }));
        //         return style;
        //     }
        // },
        // getCustomLabeledStyle: function (label) {
        //     this.set("textlabel", label);
        //     var style = this.getSimpleStyle();

        //     return style;
        // },
        // getSimpleStyle: function () {
        //     var imagestyle, symbolText, strokestyle, fill;

        //     this.set("imagepath", Radio.request("Util", "getPath", Config.wfsImgPath))
        //     if (this.get("subclass") === "Icon") {
        //         var src = this.get("imagepath") + this.get("imagename"),
        //             isSVG = src.indexOf(".svg") > -1 ? true : false,
        //             width = this.get("imagewidth"),
        //             height = this.get("imageheight"),
        //             scale = parseFloat(this.get("imagescale")),
        //             offset = [parseFloat(this.get("imageoffsetx")), parseFloat(this.get("imageoffsety"))];

        //             imagestyle = new ol.style.Icon({
        //                 src: src,
        //                 width: width,
        //                 height: height,
        //                 scale: scale,
        //                 anchor: offset,
        //                 imgSize: isSVG ? [width, height] : ""
        //             });
        //     }
        //     else if (this.get("subclass") === "IconWithText") {
        //         var src = this.get("imagepath") + this.get("imagename"),
        //             width = this.get("imagewidth"),
        //             height = this.get("imageheight"),
        //             scale = parseFloat(this.get("imagescale")),
        //             font = this.get("textfont").toString(),
        //             text = this.get("textlabel"),
        //             color = this.returnColor(this.get("textcolor")),
        //             scale = parseInt(this.get("textscale"), 10),
        //             offsetX = parseInt(this.get("textoffsetx"), 10),
        //             offsetY = parseInt(this.get("textoffsety"), 10),
        //             fillcolor = this.returnColor(this.get("textfillcolor")),
        //             strokecolor = this.returnColor(this.get("textstrokecolor")),
        //             strokewidth = parseInt(this.get("textstrokewidth"), 10);

        //             imagestyle = new ol.style.Icon({
        //                 src: src,
        //                 width: width,
        //                 height: height,
        //                 scale: scale
        //             });
        //             symbolText = new ol.style.Text({
        //                 text: text,
        //                 offsetX: offsetX,
        //                 offsetY: offsetY,
        //                 font: font,
        //                 color: color,
        //                 scale: scale,
        //                 fill: new ol.style.Fill({
        //                     color: fillcolor
        //                 }),
        //                 stroke: new ol.style.Stroke({
        //                     color: strokecolor,
        //                     width: strokewidth
        //                 })
        //             });
        //     }
        //     else if (this.get("subclass") === "Circle") {
        //         var radius = parseInt(this.get("circleradius"), 10),
        //             fillcolor = this.returnColor(this.get("circlefillcolor")),
        //             strokecolor = this.returnColor(this.get("circlestrokecolor"));

        //             imagestyle = new ol.style.Circle({
        //                 radius: radius,
        //                 fill: new ol.style.Fill({
        //                     color: fillcolor
        //                 }),
        //                 stroke: new ol.style.Stroke({
        //                     color: strokecolor
        //                 })
        //             });
        //     }
        //     else if (this.get("subclass") === "Stroke") {
        //         var strokecolor = this.returnColor(this.get("strokecolor")),
        //             strokewidth = parseInt(this.get("strokewidth"), 10);

        //             strokestyle = new ol.style.Stroke({
        //                 color: strokecolor,
        //                 width: strokewidth
        //             });
        //     }
        //     else if (this.get("subclass") === "Polygon") {
        //         var strokestyle = new ol.style.Stroke({
        //             color: this.returnColor(this.get("color")),
        //             width: this.returnColor(this.get("strokewidth"))
        //         });

        //         fill = new ol.style.Fill({
        //             color: this.returnColor(this.get("fillcolor"))
        //         });
        //     }
        //     else {
        //         return;
        //     }
        //     var style = [
        //         new ol.style.Style({
        //             image: imagestyle,
        //             text: symbolText,
        //             zIndex: "Infinity",
        //             stroke: strokestyle,
        //             fill: fill
        //         })
        //     ];

        //     return style;
        // }
    });

    return WFSStyle;
});
