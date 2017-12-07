define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Config = require("config"),
        proj4 = require("proj4"),
        SensorThingsLayer;

    SensorThingsLayer = Layer.extend({

        initialize: function () {
            this.superInitialize();
            console.log(this);
        },

        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
        },

        createClusterLayerSource: function () {
        },

        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: (this.has("clusterDistance") === true) ? this.getClusterLayerSource() : this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
                id: this.getId()
            }));

            this.updateData();
        },

        createLegendURL: function () {
        },

        setAttributes: function () {
        },

        updateData: function () {
            Radio.trigger("Util", "showLoader");
                console.log(this.get("url")),
            $.ajax({
                url: this.get("url"),
                // data: params,
                contentType: "application/json; charset=utf-8",
                async: true,
                type: "GET",
                context: this,

                // Behandlung des Response
                success: function (response) {
                    var points = [];

                    for (var i = 0; i < response.value.length; i++) {
                        var xy = (response.value[i].location.coordinates),
                            xyTransfrom = ol.proj.transform(xy, "EPSG:4326", Config.view.epsg),
                            xyTransfrom1 = proj4(proj4("EPSG:4326"), proj4(Config.view.epsg), xy);

                            console.log(xyTransfrom);
                            console.log(xyTransfrom1);
                            console.log(Config.view.epsg);

                            point = new ol.Feature({
                                geometry: new ol.geom.Point(xyTransfrom)
                            });
                        points.push(point);
                    }

                    // Features zum Vektorlayer hinzufuegen
                    this.getLayerSource().addFeatures(points);


                    Radio.trigger("Util", "hideLoader");
                    try {
                        // this.set("loadend", "ready");
                        Radio.trigger("SensorThingsLayer", "featuresLoaded", this.getId(), points);
                        // für WFS-T wichtig --> benutzt den ol-default Style
                        if (_.isUndefined(this.get("editable")) === true || this.get("editable") === false) {
                            this.styling();
                        }
                        this.getLayer().setStyle(this.get("style"));
                    }
                    catch (err) {
                        console.log(err.message);
                    }
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Util", "hideLoader");
                }
            });
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
            var styleId = this.getStyleId(),
                styleLabelField = this.get("styleLabelField");

            this.set("style", function (feature) {
                var stylelistmodel = Radio.request("StyleList", "returnModelById", styleId),
                    label = _.values(_.pick(feature.getProperties(), styleLabelField))[0].toString();

                return stylelistmodel.getCustomLabeledStyle(label);
            });
        },
        setSimpleStyleForStyleField: function () {
            var styleId = this.getStyleId(),
                styleField = this.get("styleField");

            this.set("style", function (feature) {
                var styleFieldValue = _.values(_.pick(feature.getProperties(), styleField))[0],
                    stylelistmodel = Radio.request("StyleList", "returnModelByValue", styleId, styleFieldValue);

                return stylelistmodel.getSimpleStyle();
            });
        },
        setSimpleStyleForStyleFieldAndLabel: function () {
            var styleId = this.getStyleId(),
                styleLabelField = this.get("styleLabelField"),
                styleField = this.get("styleField");

            this.set("style", function (feature) {
                var styleFieldValue = _.values(_.pick(feature.getProperties(), styleField))[0],
                    label = _.values(_.pick(feature.getProperties(), styleLabelField))[0],
                    stylelistmodel = Radio.request("StyleList", "returnModelByValue", styleId, styleFieldValue);

                return stylelistmodel.getCustomLabeledStyle(label);
            });
        },
        setClusterStyleForStyleField: function () {
            var styleId = this.getStyleId(),
                styleField = this.get("styleField");

            this.set("style", function (feature) {
                var size = feature.get("features").length,
                    stylelistmodel;

                if (size > 1) {
                    stylelistmodel = Radio.request("StyleList", "returnModelById", styleId + "_cluster");
                }
                if (!stylelistmodel) {
                    var styleFieldValue = _.values(_.pick(feature.get("features")[0].getProperties(), styleField))[0];

                    stylelistmodel = Radio.request("StyleList", "returnModelByValue", styleId, styleFieldValue);
                }
                return stylelistmodel.getClusterStyle(feature);
            });
        },
        setSimpleStyle: function () {
            var styleId = this.getStyleId(),
                stylelistmodel = Radio.request("StyleList", "returnModelById", styleId);

            this.set("style", stylelistmodel.getSimpleStyle());
        },
        setClusterStyle: function () {
            var styleId = this.getStyleId(),
                stylelistmodel = Radio.request("StyleList", "returnModelById", styleId);

            this.set("style", function (feature) {
                return stylelistmodel.getClusterStyle(feature);
            });
        },
        getStyleId: function () {
            return this.get("styleId");
        },
    });

    return SensorThingsLayer;
});
