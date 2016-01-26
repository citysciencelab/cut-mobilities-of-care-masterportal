define([
    "underscore",
    "backbone",
    "openlayers",
    "eventbus",
    "config",
    "modules/layer/Layer",
    "modules/layer/wfsStyle/list",
    "modules/core/util",
    "modules/core/mapView",
    "modules/wfslist/view"
], function (_, Backbone, ol, EventBus, Config, Layer, StyleList, Util) {
    var WFSLayer = Layer.extend({
        updateData: function () {
            Util.showLoader();

            this.buildGetRequest();
            $.ajax({
                url: this.get("url"),
                data: this.get("data"),
                async: true,
                type: "GET",
                context: this,
                success: function (data) {
                    Util.hideLoader();
                    try {
                        var wfsReader = new ol.format.WFS({
                            featureNS: this.get("featureNS"),
                            featureType: this.get("featureType")
                        });

                        if (this.get("clusterDistance") <= 0 || !this.get("clusterDistance")) {
                            var src = new ol.source.Vector({
                                attributions: this.get("olAttribution")
                            });

                            src.addFeatures(wfsReader.readFeatures(data));
                            this.set("source", src);
                            // für WFS-T wichtig --> benutzt den ol-default Style
                            if (_.isUndefined(this.get("editable")) === true || this.get("editable") === false) {
                                this.styling();
                            }
                            this.set("layer", new ol.layer.Vector({
                                source: this.get("source"),
                                name: this.get("name"),
                                typ: this.get("typ"),
                                style: this.get("style"),
                                gfiAttributes: this.get("gfiAttributes"),
                                routable: this.get("routable"),
                                gfiTheme: this.get("gfiTheme"),
                                visible: true
                            }));
                            this.reload();
                        }
                        else {
                            var src = new ol.source.Vector({
                                attributions: this.get("olAttribution")
                            });

                            src.addFeatures(wfsReader.readFeatures(data));
                            var cluster = new ol.source.Cluster({
                                source: src,
                                distance: this.get("clusterDistance")
                            });

                            this.set("source", cluster);
                            if (_.isUndefined(this.get("editable")) === true || this.get("editable") === false) {
                                this.styling();
                            }
                            this.set("layer", new ol.layer.Vector({
                                source: this.get("source"),
                                name: this.get("name"),
                                typ: this.get("typ"),
                                style: this.get("style"),
                                gfiAttributes: this.get("gfiAttributes"),
                                routable: this.get("routable"),
                                gfiTheme: this.get("gfiTheme"),
                                visible: true
                            }));
                            this.reload();
                        }
                        this.get("layer").id = this.get("id");
                        // schmutzig, aber einzihe Möglichkeit... :-(
                        var that = this;
                        window.setTimeout(function () {
                            that.set("visibility", true);
                        }, 1);
                    }
                    catch (e) {
                        EventBus.trigger("alert", {
                            text: "<strong>Fehler bei Datenverarbeitung aufgetreten! </strong>" + e.message,
                            kategorie: "alert-warning"
                        });
                    }
                },
                error: function (jqXHR, errorText, error) {
                    Util.hideLoader();
                    EventBus.trigger("alert", {
                        text: "<strong>Fehler bei Dienstabfrage aufgetreten </strong>" + errorText + error,
                        kategorie: "alert-warning"
                    });
                }
            });
        },
        setAttributionLayerSource: function () {
            // Nur einmalig und nicht beim reload.
            if (this.get("layer") === undefined) {
                var id = this.get("id"),
                    layerIDs = _.find(Config.tree.layer, function (num) {
                        return num.id === id;
                    });

                this.set("styleId", layerIDs.style);
                this.set("clusterDistance", layerIDs.clusterDistance);
                this.set("searchField", layerIDs.searchField);
                this.set("styleField", layerIDs.styleField);
                this.set("styleLabelField", layerIDs.styleLabelField);
            }
        },
        /**
         * wird von Layer.js aufgerufen
         */
        setAttributionLayer: function () {
            // Dummy-Layer, damit initialize des Layer durchläuft. Nur einmalig und nicht beim reload.
            if (this.get("layer") === undefined) {
                this.set("layer", new ol.layer.Vector({
                    source: new ol.source.Vector(),
                    visible: false
                }));
                this.setVisibility();
            }
        },
        setVisibility: function () {
            var visibility = this.get("visibility");

            this.toggleEventAttribution(visibility);
            if (visibility === true) {
                if (this.get("layer").getSource().getFeatures().length === 0) {
                    this.set("visibility", false);
                    this.updateData();
                }
                else {
                    this.get("layer").setVisible(true);
                }
            }
            else {
                this.get("layer").setVisible(false);
            }
        },
        styling: function () {
            // NOTE Hier werden die Styles zugeordnet
            if (this.get("styleField") && this.get("styleField") !== "") {
                if (this.get("clusterDistance") <= 0 || !this.get("clusterDistance")) {
                    if (this.get("styleLabelField") && this.get("styleLabelField") !== "") {
                        this.setSimpleStyleForStyleFieldAndLabel();
                    }
                    else {
                        this.setSimpleStyleForStyleField();
                    }
                }
                else {
                    if (this.get("styleLabelField") && this.get("styleLabelField") !== "") {
                        // TODO
                    }
                    else {
                        this.setClusterStyleForStyleField();
                    }
                }
            }
            else {
                if (this.get("clusterDistance") <= 0 || !this.get("clusterDistance")) {
                    if (this.get("styleLabelField") && this.get("styleLabelField") !== "") {
                        this.setSimpleCustomLabeledStyle();
                    }
                    else {
                        this.setSimpleStyle();
                    }
                }
                else {
                    if (this.get("styleLabelField") && this.get("styleLabelField") !== "") {
                        this.getClusterStyle();
                    }
                    else {
                        this.setClusterStyle();
                    }
                }
            }
        },
        setSimpleCustomLabeledStyle: function () {
            var styleId = this.get("styleId"),
                styleLabelField = this.get("styleLabelField");

            this.set("style", function (feature) {
                var stylelistmodel = StyleList.returnModelById(styleId),
                    label = _.values(_.pick(feature.getProperties(), styleLabelField))[0].toString();

                return stylelistmodel.getCustomLabeledStyle(label);
            });
        },
        setSimpleStyleForStyleField: function () {
            var styleId = this.get("styleId"),
                styleField = this.get("styleField");

            this.set("style", function (feature) {
                var styleFieldValue = _.values(_.pick(feature.getProperties(), styleField))[0],
                    stylelistmodel = StyleList.returnModelByValue(styleId, styleFieldValue);

                return stylelistmodel.getSimpleStyle();
            });
        },
        setSimpleStyleForStyleFieldAndLabel: function () {
            var styleId = this.get("styleId"),
                styleLabelField = this.get("styleLabelField"),
                styleField = this.get("styleField");

            this.set("style", function (feature) {
                var styleFieldValue = _.values(_.pick(feature.getProperties(), styleField))[0],
                    label = _.values(_.pick(feature.getProperties(), styleLabelField))[0],
                    stylelistmodel = StyleList.returnModelByValue(styleId, styleFieldValue);

                return stylelistmodel.getCustomLabeledStyle(label);
            });
        },
        setClusterStyleForStyleField: function () {
            var styleId = this.get("styleId"),
                styleField = this.get("styleField");

            this.set("style", function (feature) {
                var size = feature.get("features").length,
                    stylelistmodel;

                if (size > 1) {
                    stylelistmodel = StyleList.returnModelById(styleId + "_cluster");
                }
                if (!stylelistmodel) {
                    var styleFieldValue = _.values(_.pick(feature.get("features")[0].getProperties(), styleField))[0];

                    stylelistmodel = StyleList.returnModelByValue(styleId, styleFieldValue);
                }
                return stylelistmodel.getClusterStyle(feature);
            });
        },
        setSimpleStyle: function () {
            var styleId = this.get("styleId"),
                stylelistmodel = StyleList.returnModelById(styleId);

            this.set("style", stylelistmodel.getSimpleStyle());
        },
        setClusterStyle: function () {
            var styleId = this.get("styleId"),
                stylelistmodel = StyleList.returnModelById(styleId);

            this.set("style", function (feature) {
                return stylelistmodel.getClusterStyle(feature);
            });
        },
        buildGetRequest: function () {
            var newURL;

            if (this.get("url").search(location.host) === -1) {
                newURL = Util.getProxyURL(this.get("url"));
                this.set("url", newURL);
            }

            var data = "REQUEST=GetFeature&SERVICE=WFS&TYPENAME=" + this.get("featureType");

            if (this.get("version") && this.get("version") !== "" && this.get("version") !== "nicht vorhanden") {
                data += "&VERSION=" + this.get("version");
            }
            else {
                data += "&VERSION=1.1.0";
            }
            if (this.get("srsname") && this.get("srsname") !== "" && this.get("srsname") !== "nicht vorhanden") {
                data += "&SRSNAME=" + this.get("srsname");
            }
            else {
                data += "&SRSNAME=" + Config.view.epsg;
            }
            this.set("data", data);
        },
        setProjection: function (proj) {
            this.set("projection", proj);
        },
        // wird in layerinformation benötigt. --> macht vlt. auch für Legende Sinn?!
        setLegendURL: function () {
            if (!_.isUndefined(this.get("styleId"))) {
                var style = StyleList.returnModelById(this.get("styleId"));

                this.set("legendURL", [style.get("imagepath") + style.get("imagename")]);
            }
        }
    });

    return WFSLayer;
});
