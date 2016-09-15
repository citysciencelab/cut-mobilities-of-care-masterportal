define([
    "backbone",
    "modules/layer/wfsStyle/list",
    "backbone.radio",
    "bootstrap/modal"
], function (Backbone, StyleList, Radio) {

    var Legend = Backbone.Model.extend({

        defaults: {
            getLegendURLParams: "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=",
            legendParams: [],
            wmsLayerList: []
        },

        initialize: function () {

            this.listenTo(Radio.channel("ModelList"), {
                "updatedSelectedLayerList": this.setLayerList
            });

            this.listenTo(this, {
                "change:wmsLayerList": this.setLegendParamsFromWMS,
                "change:wfsLayerList": this.setLegendParamsFromWFS,
                "change:groupLayerList": this.setLegendParamsFromGROUP
            });
        },

        createLegend: function () {
            this.set("legendParams", []);
            this.set("legendParams", _.sortBy(this.get("tempArray"), function (obj) {
                return obj.layername;
            }));
        },

        setLayerList: function (layerlist) {
            var filteredLayerList,
                groupedLayers;

            this.unsetLegendParams();
            // Die Layer die nicht in der Legende dargestellt werden sollen
            filteredLayerList = _.filter(layerlist, function (layer) {
                return layer.get("legendURL") !== "ignore";
            });

            // Liste wird nach Typen(WMS, WFS,...) gruppiert
            groupedLayers = _.groupBy(filteredLayerList, function (layer) {
                return layer.get("typ");
            });
            // this.set("tempArray", []);
            if (_.has(groupedLayers, "WMS")) {
                this.set("wmsLayerList", groupedLayers.WMS);
            }
            if (_.has(groupedLayers, "WFS")) {
                this.set("wfsLayerList", groupedLayers.WFS);
            }
            if (_.has(groupedLayers, "GROUP")) {
                this.set("groupLayerList", groupedLayers.GROUP);
            }
            this.createLegend();
        },

        unsetLegendParams: function () {
            this.set("wfsLayerList", "");
            this.set("wmsLayerList", "");
            this.set("groupLayerList", "");
            this.set("tempArray", []);
        },

        setLegendParamsFromWMS: function () {
            _.each(this.get("wmsLayerList"), function (layer) {
                var legendURL = layer.get("legendURL");

                this.push("tempArray", {
                    layername: layer.get("name"),
                    img: legendURL,
                    typ: "WMS"
                });
            }, this);
        },

        setLegendParamsFromWFS: function () {
            _.each(this.get("wfsLayerList"), function (layer) {
                if (typeof layer.get("legendURL") === "string") {
                    this.push("tempArray", {
                        layername: layer.get("name"),
                        img: layer.get("legendURL"),
                        typ: "WFS"
                    });
                }
                else {
                    var image = [],
                        name = [],
                        styleList;

                    styleList = StyleList.returnAllModelsById(layer.getStyleId());
                    if (styleList.length > 1) {
                        _.each(styleList, function (style) {
                            image.push(style.getSimpleStyle()[0].getImage().getSrc());
                                if (style.has("legendValue")) {
                                    name.push(style.get("legendValue"));
                                }
                                else {
                                    name.push(style.get("styleFieldValue"));
                                }
                            });
                        }
                        else {
                            if (styleList[0].getSimpleStyle()[0].getImage() != null) {
                                image.push(styleList[0].getSimpleStyle()[0].getImage().getSrc());
                            }
                            name.push(layer.get("name"));
                        }
                        this.push("tempArray", {
                            layername: layer.get("name"),
                            legendname: name,
                            img: image,
                            typ: "WFS"
                        });
                }
            }, this);
        },

        // HVV-Quatsch funktioniert noch nicht richtig
        setLegendParamsFromGROUP: function () {
            _.each(this.get("groupLayerList"), function (layer) {
                this.push("tempArray", {
                    layername: layer.get("name"),
                    img: layer.get("legendURL"),
                    typ: "WMS"
                });
            }, this);
        },

        /**
         * @desc Hilfsmethode um ein Attribut vom Typ Array zu setzen.
         * @param {String} attribute - Das Attribut das gesetzt werden soll.
         * @param {whatever} value - Der Wert des Attributs.
         */
        push: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        }
    });

    return new Legend();
});
