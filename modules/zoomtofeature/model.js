import Feature from "ol/Feature.js";
import {WFS} from "ol/format.js";
import Point from "ol/geom/Point.js";
import {Icon, Style} from "ol/style.js";
import {Vector as VectorLayer} from "ol/layer.js";
import VectorSource from "ol/source/Vector.js";

const ZoomToFeature = Backbone.Model.extend({
    defaults: {
        ids: [],
        attribute: "flaechenid",
        imgLink: "/lgv-config/img/location_eventlotse.svg",
        layerId: "4561",
        wfsId: "4560",
        centerList: [],
        format: new WFS(),
        features: [],
        offsetX: 24
    },
    initialize: function () {
        this.setIds(Radio.request("ParametricURL", "getZoomToFeatureIds"));
        this.getFeaturesFromWFS();
        this.createCenterList();
        this.setIconsForFeatureIds(this.get("centerList"), this.get("imgLink"), this.get("offsetX"));
        this.zoomToFeatures();
    },
    setIconsForFeatureIds: function (featureCenterList, imgLink, offsetX) {
        var vectorLayer,
            icons = [];

        _.each(featureCenterList, function (featureCenter, index) {
            var id = "featureIcon" + index,
                iconFeature,
                iconStyle;

            iconFeature = new Feature({
                geometry: new Point(featureCenter),
                name: id
            });

            iconStyle = new Style({
                image: new Icon({
                    anchor: [0.5, offsetX],
                    anchorXUnits: "fraction",
                    anchorYUnits: "pixels",
                    src: imgLink
                })
            });

            iconFeature.setStyle(iconStyle);
            icons.push(iconFeature);
        }, this);

        vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: icons
            })
        });
        Radio.trigger("Map", "addLayerOnTop", vectorLayer);
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
                    extent = _.isEmpty(feature) ? [] : feature[0].getGeometry().getExtent(),
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
            typename = LayerPrefs.featureType,
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
                    extent = _.isEmpty(feature) ? [] : feature[0].getGeometry().getExtent();

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

export default ZoomToFeature;
