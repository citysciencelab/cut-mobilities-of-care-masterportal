define([
    "underscore",
    "backbone",
    "openlayers",
    "eventbus",
    "config",
    "modules/layer/Layer",
    "collections/stylelist"

], function (_, Backbone, ol, EventBus, Config, Layer, StyleList) {

    /**
     *
     */
    var WFSLayer = Layer.extend({
        /**
         *
         */
        updateData: function () {
            $("#loader").show();
            this.buildGetRequest();
            $.ajax({
                url: this.get("url"),
                data: this.get("data"),
                async: true,
                type: "GET",
                context: this,
                success: function (data) {
                    $("#loader").hide();
                    try {
                        var wfsReader = new ol.format.WFS({
                            featureNS: this.get("featureNS"),
                            featureType: this.get("featureType")
                        });

                        if (this.get("clusterDistance") <= 0 || !this.get("clusterDistance")) {
                            var src = new ol.source.Vector({
                                projection: this.get("projection"),
                                attributions: this.get("olAttribution")
                            });

                            src.addFeatures(wfsReader.readFeatures(data));
                            this.set("source", src);
                            this.styling();
                            this.set("layer", new ol.layer.Vector({
                                source: this.get("source"),
                                name: this.get("name"),
                                typ: this.get("typ"),
                                style: this.get("style"),
                                gfiAttributes: this.get("gfiAttributes"),
                                routable: this.get("routable")
                            }));
                            this.reload();
                        }
                        else {
                            var src = new ol.source.Vector({
                                projection: this.get("projection"),
                                attributions: this.get("olAttribution")
                            });

                            src.addFeatures(wfsReader.readFeatures(data));
                            var cluster = new ol.source.Cluster({
                                source: src,
                                distance: this.get("clusterDistance")
                            });

                            this.set("source", cluster);
                            this.styling();
                            this.set("layer", new ol.layer.Vector({
                                source: this.get("source"),
                                name: this.get("name"),
                                typ: this.get("typ"),
                                style: this.get("style"),
                                gfiAttributes: this.get("gfiAttributes"),
                                routable: this.get("routable")
                            }));
                            this.reload();
                        }
                        this.get("layer").id = this.get("id");
                    }
                    catch (e) {
                        alert("Fehlermeldung beim Laden von Daten: \n" + e.message);
                    }
                },
                error: function (data) {
                    $("#loader").hide();
                    alert("Fehler beim Laden von Daten: \n" + data.responseText);
                }
            });
        },
        setAttributionLayerSource: function () {
            // Nur einmalig und nicht beim reload.
            if (this.get("layer") === undefined) {
                var id = this.get("id"),
                    layerIDs = _.find(Config.layerIDs, function (num) {
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
                    this.updateData();
                }
                this.get("layer").setVisible(true);
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
                        // TODO
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
                // Umwandeln der diensteAPI-URLs in lokale URL gemäß httpd.conf
                if (this.get("url").indexOf("http://WSCA0620.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://WSCA0620.fhhnet.stadt.hamburg.de", "/wsca0620");
                }
                else if (this.get("url").indexOf("http://bsu-ims.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://bsu-ims.fhhnet.stadt.hamburg.de", "/bsu-ims");
                }
                else if (this.get("url").indexOf("http://bsu-ims") !== -1) {
                    newURL = this.get("url").replace("http://bsu-ims", "/bsu-ims");
                }
                else if (this.get("url").indexOf("http://bsu-uio.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://bsu-uio.fhhnet.stadt.hamburg.de", "/bsu-uio");
                }
                else if (this.get("url").indexOf("http://geofos.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://geofos.fhhnet.stadt.hamburg.de", "/geofos");
                }
                else if (this.get("url").indexOf("http://geofos") !== -1) {
                    newURL = this.get("url").replace("http://geofos", "/geofos");
                }
                else if (this.get("url").indexOf("http://wscd0095") !== -1) {
                    newURL = this.get("url").replace("http://wscd0095", "/geofos");
                }
                else if (this.get("url").indexOf("http://hmbtg.geronimus.info") !== -1) {
                    newURL = this.get("url").replace("http://hmbtg.geronimus.info", "/hmbtg");
                }
                else if (this.get("url").indexOf("http://lgvfds01.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://lgvfds01.fhhnet.stadt.hamburg.de", "/lgvfds01");
                }
                else if (this.get("url").indexOf("http://lgvfds02.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://lgvfds02.fhhnet.stadt.hamburg.de", "/lgvfds02");
                }
                else if (this.get("url").indexOf("http://wsca0620.fhhnet.stadt.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://wsca0620.fhhnet.stadt.hamburg.de", "/wsca0620");
                }
                else if (this.get("url").indexOf("http://wscd0096") !== -1) {
                    newURL = this.get("url").replace("http://wscd0096", "/wscd0096");
                }
                // ab hier Internet
                else if (this.get("url").indexOf("http://extmap.hbt.de") !== -1) {
                    newURL = this.get("url").replace("http://extmap.hbt.de", "/extmap");
                }
                else if (this.get("url").indexOf("http://gateway.hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://gateway.hamburg.de", "/gateway-hamburg");
                }
                else if (this.get("url").indexOf("http://geodienste-hamburg.de") !== -1) {
                    newURL = this.get("url").replace("http://geodienste-hamburg.de", "/geodienste-hamburg");
                }
                else {
                    newURL = this.get("url");
                }

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
                data += "&SRSNAME=" + this.get("projection").getCode();
            }
            this.set("data", data);
        }
    });

    return WFSLayer;
});
