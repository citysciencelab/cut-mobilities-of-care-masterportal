define([
    "backbone",
    "openlayers",
    "eventbus"
    ], function (Backbone, ol, EventBus) {
    "use strict";
    var MapHandlerModel = Backbone.Model.extend({
        defaults: {
            marker: new ol.Overlay({
                positioning: "bottom-center",
                element: $("#searchMarker"), // Element aus der index.html
                stopEvent: false
            })
        },
        initialize: function () {
            EventBus.trigger("addOverlay", this.get("marker"));
        },
        /**
        * @description Hilsfunktion zum ermitteln eines Features mit textueller Beschreibung
        */
        getExtentFromString: function (type, geom) {
            var wkt;

            if (type === "POLYGON") {
                var split = geom.split(" ");

                wkt = type + "((";
            _.each(split, function (element, index, list) {
                if (index % 2 === 0) {
                    wkt += element + " ";
                }
                else if (index === list.length - 1) {
                    wkt += element + "))";
                }
                else {
                    wkt += element + ", ";
                }
            });
            }
            else if (type === "POINT") {
                var wkt;

                wkt = type + "(";
                wkt += geom[0] + " " + geom[1];
                wkt += ")";
            }
            else if (type === "MULTIPOLYGON") {
                wkt = type + "(((";
                _.each(geom, function (element, index) {
                    var split = geom[index].split(" ");

                    _.each(split, function (element, index, list) {
                        if (index % 2 === 0) {
                            wkt += element + " ";
                        }
                        else if (index === list.length - 1) {
                            wkt += element + "))";
                        }
                        else {
                            wkt += element + ", ";
                        }
                    });
                    if (index === geom.length - 1) {
                        wkt += ")";
                    }
                    else {
                        wkt += ",((";
                    }
                });
                var regExp = new RegExp(", \\)\\?\\(", "g");

                wkt = wkt.replace(regExp, "),(");
            }
            var format = new ol.format.WKT(),
                feature = format.readFeature(wkt),
                extent = feature.getGeometry().getExtent();

            return extent;
        }
    });

    return new MapHandlerModel();
});
