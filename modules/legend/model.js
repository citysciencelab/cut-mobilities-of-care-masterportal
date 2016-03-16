define([
    "backbone",
    "modules/layer/wfsStyle/list",
    "eventbus",
    "bootstrap/modal"
], function (Backbone, StyleList, EventBus) {

    var Legend = Backbone.Model.extend({

        defaults: {
            getLegendURLParams: "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=",
            legendParams: [],
            wmsLayerList: []
        },

        initialize: function () {
            this.listenTo(EventBus, {
                "layerlist:sendVisiblelayerList": this.setLayerList
            });

            this.listenTo(this, {
                "change:wmsLayerList": this.setLegendParamsFromWMS,
                "change:wfsLayerList": this.setLegendParamsFromWFS,
                "change:groupLayerList": this.setLegendParamsFromGROUP
            });

            EventBus.trigger("layerlist:getVisiblelayerList");
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
                var image = [],
                    name = [],
                    styleList;

                styleList = StyleList.returnAllModelsById(layer.get("styleId"));
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
            }, this);
        },

        // HVV-Quatsch funktioniert noch nicht richtig
        setLegendParamsFromGROUP: function () {
            _.each(this.get("groupLayerList"), function (layer) {
                _.each(layer.get("backbonelayers"), function (element) {
                    var legendURL = [];
                    // GetLegendGraphic wenn keine URL hinterlegt ist
                    if (element.get("legendURL") === "" || element.get("legendURL") === undefined) {
                        var layerNames = element.get("layers").split(",");

                        if (layerNames.length === 1) {
                            legendURL.push(element.get("url") + this.get("getLegendURLParams") + element.get("layers"));
                        }
                        else if (layerNames.length > 1) {
                            _.each(layerNames, function (layerName) {
                                legendURL.push(element.get("url") + this.get("getLegendURLParams") + layerName);
                            }, this);
                        }
                    }
                    // Wenn eine URL hinterlegt ist
                    else {
                        legendURL = element.get("legendURL");
                    }

                    this.push("tempArray", {
                        layername: element.get("name"),
                        img: legendURL,
                        typ: "WMS"
                    });
                }, this);
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
