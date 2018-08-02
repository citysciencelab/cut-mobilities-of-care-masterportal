define(function (require) {
    var Config = require("config"),
        $ = require("jquery"),
        ol = require("openlayers"),
        ZoomToFeature;

    ZoomToFeature = Backbone.Model.extend({
        defaults: {
            prefs: {},
            centerList: [],
            format: new ol.format.WFS(),
            features: []
        },
        initialize: function () {
            var channel = Radio.channel("ZoomToFeature"),
                prefs = Config.zoomtofeature;

            channel.on({
                "zoomtofeatures": this.zoomtofeatures
            }, this);
            channel.reply({
                "getCenterList": function () {
                    return this.get("centerList");
                }
            }, this);

            this.setPrefs(prefs);
            this.getFeaturesFromWFS();
            this.createCenterList();
        },
        getFeaturesFromWFS: function () {
            var prefs = this.get("prefs");

            if (!_.isUndefined(prefs.ids)) {
                this.requestFeaturesFromWFS(prefs);
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
        setPrefs: function (value) {
            this.set("prefs", value);
        },
        setCenterList: function (value) {
            this.set("centerList", value);
        },

        // holt sich "zoomtofeature" aus der Config, prüft ob ID vorhanden ist
        createCenterList: function () {
            var prefs = this.get("prefs"),
                ids = prefs.ids ? prefs.ids : null,
                attribute = prefs.attribute ? prefs.attribute : null,
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
        requestFeaturesFromWFS: function (prefs) {
            var LayerId = prefs.WFSid,
                LayerPrefs = Radio.request("RawLayerList", "getLayerAttributesWhere", {id: LayerId}),
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
        zoomtofeatures: function () {
            var bbox = [],
                prefs = this.get("prefs"),
                ids = prefs.ids ? prefs.ids : null,
                attribute = prefs.attribute ? prefs.attribute : null,
                features = this.get("features");

            if (_.isNull(ids) === false) {
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
        }
    });

    return ZoomToFeature;
});
