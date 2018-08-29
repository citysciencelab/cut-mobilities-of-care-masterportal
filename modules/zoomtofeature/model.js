define(function (require) {
    var $ = require("jquery"),
        ol = require("openlayers"),
        ZoomToFeature;

    ZoomToFeature = Backbone.Model.extend({
        defaults: {
            ids: [],
            attribute: "flaechenid",
            imgLink: "../img/location_eventlotse.svg",
            layerId: "4561",
            wfsId: "4560",
            centerList: [],
            format: new ol.format.WFS(),
            features: [],
            markers: []
        },
        initialize: function () {
            this.setIds(Radio.request("ParametricURL", "getZoomToFeatureIds"));
            this.getFeaturesFromWFS();
            this.createCenterList();
            this.setMarkerForFeatureIds();
            this.zoomToFeatures();
        },
        setMarkerForFeatureIds: function () {
            _.each(this.get("centerList"), function (center, i) {
                var id = "featureMarker" + i,
                    marker;

                // lokaler Pfad zum IMG-Ordner ist anders
                $("#map").append("<div id=" + id + " class='featureMarker'><img src='" + Radio.request("Util", "getPath", this.get("imgLink")) + "'></div>");

                marker = new ol.Overlay({
                    id: id,
                    offset: [-12, 0],
                    positioning: "bottom-center",
                    element: document.getElementById(id),
                    stopEvent: false
                });

                marker.setPosition(center);
                this.get("markers").push(marker);
                Radio.trigger("Map", "addOverlay", marker);
            }, this);
        },
        getFeaturesFromWFS: function () {
            if (!_.isUndefined(this.get("ids"))) {
                this.requestFeaturesFromWFS(this.get("wfsId"));
            }
        },

        // setter for features
        setFeatures: function (value) {
            this.set("features", value);
        },
        // setter for format
        setFormat: function (value) {
            this.set("format", value);
        },
        setCenterList: function (value) {
            this.set("centerList", value);
        },

        // holt sich "zoomtofeature" aus der Config, prüft ob ID vorhanden ist
        createCenterList: function () {
            var ids = this.get("ids") || null,
                attribute = this.get("attribute") || null,
                features = this.get("features");

            if (_.isNull(ids) === false) {
                _.each(ids, function (id) {
                    var feature = _.filter(features, function (feat) {
                            if (feat.get(attribute) === id) {
                                return 1;
                            }
                            return 0;
                        }),
                        extent = feature[0].getGeometry().getExtent(),
                        deltaX = extent[2] - extent[0],
                        deltaY = extent[3] - extent[1],
                        center = [extent[0] + (deltaX / 2), extent[1] + (deltaY / 2)];

                    this.get("centerList").push(center);
                }, this);
            }
        },

        // baut sich aus den Config-prefs die URL zusammen
        requestFeaturesFromWFS: function (wfsId) {
            var LayerPrefs = Radio.request("RawLayerList", "getLayerAttributesWhere", {id: wfsId}),
                url = LayerPrefs.url,
                version = LayerPrefs.version,
                typename = LayerPrefs.name,
                data = "service=WFS&version=" + version + "&request=GetFeature&TypeName=" + typename;

            this.sendRequest(url, data);
        },

        // feuert den AJAX request ab
        sendRequest: function (url, data) {
            $.ajax({
                url: Radio.request("Util", "getProxyURL", url),
                data: encodeURI(data),
                context: this,
                async: false,
                type: "GET",
                success: this.parseFeatures,
                timeout: 6000,
                error: function () {
                    var msg = "URL: " + Radio.request("Util", "getProxyURL", url) + " nicht erreichbar.";

                    Radio.trigger("Alert", "alert", msg);
                }
            });
        },

        // holt sich aus der AJAX response die Daten und speichert sie als ol.Features
        parseFeatures: function (data) {
            var format = this.get("format"),
                features = format.readFeatures(data);

            this.setFeatures(features);
        },

        // holt sich das "bboxes"-array, berechnet aus allen bboxes die finale bbox und sendet diese an die map
        zoomToFeatures: function () {
            var bbox = [],
                ids = this.get("ids"),
                attribute = this.get("attribute") || null,
                features = this.get("features");

            if (ids.length > 0) {
                _.each(ids, function (id, index) {
                    var feature = _.filter(features, function (feat) {
                            return feat.get(attribute) === id ? 1 : 0;
                        }),
                        extent = feature[0].getGeometry().getExtent();

                    // erste bbox direkt füllen
                    if (index === 0) {
                        bbox.push(extent[0]);
                        bbox.push(extent[1]);
                        bbox.push(extent[2]);
                        bbox.push(extent[3]);
                    }
                    else {
                    // kleinste xMin- & yMin-Werte
                        bbox[0] = bbox[0] > extent[0] ? extent[0] : bbox[0]; // xMin
                        bbox[1] = bbox[1] > extent[1] ? extent[1] : bbox[1]; // yMin
                        // größte xMax- & yMax-Werte
                        bbox[2] = bbox[2] < extent[2] ? extent[2] : bbox[2]; // xMax
                        bbox[3] = bbox[3] < extent[3] ? extent[3] : bbox[3]; // yMax
                    }
                }, this);
                Radio.trigger("Map", "setBBox", bbox);
            }
        },
        setIds: function (value) {
            this.set("ids", value);
        }
    });

    return ZoomToFeature;
});
