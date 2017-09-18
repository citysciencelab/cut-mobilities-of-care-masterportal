define([
    "backbone",
    "openlayers",
    "backbone.radio",
    "config"
    ], function (Backbone, ol, Radio, Config) {
    "use strict";
    var MapHandlerModel = Backbone.Model.extend({
        defaults: {
            marker: new ol.Overlay({
                positioning: "bottom-center",
                stopEvent: false
            }),
            wkt: "",
            markers: [],
            source: new ol.source.Vector(),
            zoomLevel: 7
        },
        initialize: function () {
            Radio.trigger("Map", "addOverlay", this.get("marker"));
            var searchConf = Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr;

            if (_.has(searchConf, "zoomLevel")) {
                this.set("zoomLevel", searchConf.zoomLevel);
            }
            this.askForMarkers();
        },

        getExtentFromString: function () {
            var format = new ol.format.WKT(),
                feature = format.readFeature(this.get("wkt")),
                extent = feature.getGeometry().getExtent();

            return extent;
        },

        /**
        * @description Hilsfunktion zum ermitteln eines Features mit textueller Beschreibung
        */
        getWKTFromString: function (type, geom) {
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
            this.set("wkt", wkt);

            return wkt;
        },

        // frägt das model in zoomtofeatures ab und bekommt ein Array mit allen Centerpoints der pro Feature-BBox
        askForMarkers: function () {
            if (_.has(Config, "zoomtofeature")) {
                var centers = Radio.request("ZoomToFeature", "getCenterList"),
                    imglink = Config.zoomtofeature.imglink;

                _.each(centers, function (center, i) {
                    var id = "featureMarker" + i;

                    // lokaler Pfad zum IMG-Ordner ist anders
                    $("#map").append("<div id=" + id + " class='featureMarker'><img src='" + Radio.request("Util", "getPath", imglink) + "'></div>");

                    var marker = new ol.Overlay({
                        id: id,
                        offset: [-12, 0],
                        positioning: "bottom-center",
                        element: document.getElementById(id),
                        stopEvent: false
                    });

                    marker.setPosition(center);
                    var markers = this.get("markers");

                    markers.push(marker);
                    this.set("markers", markers);
                    Radio.trigger("Map", "addOverlay", marker);
                }, this);
                Radio.trigger("ZoomToFeature", "zoomtofeatures");
            }
        }
    });

    return MapHandlerModel;
});
