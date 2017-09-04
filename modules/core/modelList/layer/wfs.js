define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        WFSLayer;

    WFSLayer = Layer.extend({

        initialize: function () {
            this.superInitialize();
            var channel = Radio.channel("WFSLayer");
        },

        /**
         * [createLayerSource description]
         * @return {[type]} [description]
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
        },

        /**
         * [createClusterLayerSource description]
         * @return {[type]} [description]
         */
        createClusterLayerSource: function () {
            this.setClusterLayerSource(new ol.source.Cluster({
                source: this.getLayerSource(),
                distance: this.get("clusterDistance")
            }));
        },

        /**
         * [createLayer description]
         * @return {[type]} [description]
         */
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

        /**
         * [setClusterLayerSource description]
         * @param {[type]} value [description]
         */
        setClusterLayerSource: function (value) {
            this.set("clusterLayerSource", value);
        },

        /**
         * [getClusterLayerSource description]
         * @return {[type]}       [description]
         */
        getClusterLayerSource: function () {
            return this.get("clusterLayerSource");
        },

        getWfsFormat: function () {
            return new ol.format.WFS({
                featureNS: this.get("featureNS"),
                featureType: this.get("featureType")
            });
        },

        updateData: function () {
            var params = {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
                SRSNAME: Radio.request("MapView", "getProjection").getCode(),
                TYPENAME: this.get("featureType"),
                VERSION: this.getVersion()
            };

            Radio.trigger("Util", "showLoader");

            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("url")),
                data: params,
                async: true,
                type: "GET",
                context: this,
                success: function (data) {
                    Radio.trigger("Util", "hideLoader");
                    try {
                        var wfsReader = new ol.format.WFS({
                                featureNS: this.get("featureNS")
                            }),
                            features = wfsReader.readFeatures(data);

                        this.getLayerSource().addFeatures(features);
                        this.set("loadend", "ready");
                        Radio.trigger("WFSLayer", "featuresLoaded", this.getId(), features);
                        // für WFS-T wichtig --> benutzt den ol-default Style
                        if (_.isUndefined(this.get("editable")) === true || this.get("editable") === false) {
                            this.styling();
                        }
                        this.getLayer().setStyle(this.get("style"));
                    }
                    catch (e) {
                    }
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Util", "hideLoader");
                }
            });
        },

        /*
        * Wenn MapView Option verändert werden: bei neuem Maßstab
        */
        optionsChanged: function () {
            var isResolutionInRange = this.isResolutionInRange(),
                visibility = this.get("visibility");

            if (visibility === true && isResolutionInRange === true) {
                this.get("layer").setVisible(true);
            }
            else {
                this.get("layer").setVisible(false);
            }
            this.set("isResolutionInRange", isResolutionInRange);
        },
        /*
        * Prüft, ob dieser Layer aktuell im sichtbaren Maßstabsbereich liegt und gibt true/false zurück
        */
        isResolutionInRange: function () {
            var layerMaxScale = parseFloat(this.get("maxScale")),
                layerMinScale = parseFloat(this.get("minScale")),
                mapOptions = Radio.request("MapView", "getOptions"),
                mapScale = parseFloat(mapOptions.scale);

            if (layerMaxScale && mapScale) {
                if (mapScale > layerMaxScale) {
                    return false;
                }
            }
            if (layerMinScale && mapScale) {
                if (mapScale < layerMinScale) {
                    return false;
                }
            }
            return true;
        },
        setVisibility: function () {
            var visibility = this.get("visibility"),
                isResolutionInRange = this.isResolutionInRange();

            this.set("isResolutionInRange", isResolutionInRange);
            if (visibility === true && isResolutionInRange === true) {
                if (this.get("layer").getSource().getFeatures().length === 0) {
                    this.updateData();
                    this.set("visibility", false, {silent: true});
                }
                else {
                    this.get("layer").setVisible(true);
                }
                this.toggleEventAttribution(true);
            }
            else {
                this.get("layer").setVisible(false);
                this.set("visibility", false, {silent: true});
                this.toggleEventAttribution(false);
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
        // buildGetRequest: function () {
        //     var newURL;
        //
        //     if (this.get("url").search(location.host) === -1) {
        //         newURL = Util.getProxyURL(this.get("url"));
        //         this.set("url", newURL);
        //     }
        //
        //     var data = "REQUEST=GetFeature&SERVICE=WFS&TYPENAME=" + this.get("featureType");
        //
        //     if (this.get("version") && this.get("version") !== "" && this.get("version") !== "nicht vorhanden") {
        //         data += "&VERSION=" + this.get("version");
        //     }
        //     else {
        //         data += "&VERSION=1.1.0";
        //     }
        //     if (this.get("srsname") && this.get("srsname") !== "" && this.get("srsname") !== "nicht vorhanden") {
        //         data += "&SRSNAME=" + this.get("srsname");
        //     }
        //     else {
        //         data += "&SRSNAME=" + Config.view.epsg;
        //     }
        //     this.set("data", data);
        // },
        setProjection: function (proj) {
            this.set("projection", proj);
        },

        getStyleId: function () {
            return this.get("styleId");
        },

        // wird in layerinformation benötigt. --> macht vlt. auch für Legende Sinn?!
        createLegendURL: function () {
            if (!this.get("legendURL").length) {
                var style = Radio.request("StyleList", "returnModelById", this.getStyleId());

                this.set("legendURL", [style.get("imagepath") + style.get("imagename")]);
            }
        },
        /**
         * Versteckt alle Features mit dem Hidden-Style
         */
        hideAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures();

            collection.forEach(function (feature) {
                feature.setStyle(this.getHiddenStyle());
            }, this);
        },
        showAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures();

            collection.forEach(function (feature) {
                feature.setStyle(this.get("style")(feature)[0]);
            }, this);
        },
        /**
         * Zeigt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList
         */
        showFeaturesByIds: function (featureIdList) {
            this.hideAllFeatures();
            _.each(featureIdList, function (id) {
                var feature = this.getLayerSource().getFeatureById(id);

                feature.setStyle(this.get("style")(feature)[0]);
            }, this);
        },
        getHiddenStyle: function () {
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    fill: new ol.style.Fill({
                        color: "rgba(0, 0, 0, 0)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(0, 0, 0, 0)"
                    })
                })
            });
        }
    });

    return WFSLayer;
});
