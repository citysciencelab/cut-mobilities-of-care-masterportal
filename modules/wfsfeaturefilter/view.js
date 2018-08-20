define(function (require) {
    var WfsFeatureFilter = require("modules/wfsfeaturefilter/model"),
        $ = require("jquery"),
        wfsFeatureFilterTemplate = require("text!modules/wfsfeaturefilter/template.html"),
        wfsFeatureFilterView;

    wfsFeatureFilterView = Backbone.View.extend({
        events: {
            "click #filterbutton": "getFilterInfos",
            "click .panel-heading": "toggleHeading"
        },
        initialize: function (attr) {
            this.model = new WfsFeatureFilter(attr);
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render
            }, this);
        },
        id: "wfsFilterWin",
        className: "win-body",
        template: _.template(wfsFeatureFilterTemplate),
        toggleHeading: function (evt) {
            var id = this.$(evt.currentTarget)[0].id;

            this.$("." + id + "_wfs_panel").each(function (index, ele) {
                $(ele).toggle();
            });
            if (this.$("#wfsfeaturefilter_resizemarker").hasClass("glyphicon-resize-small")) {
                this.$("#wfsfeaturefilter_resizemarker").removeClass("glyphicon-resize-small");
                this.$("#wfsfeaturefilter_resizemarker").addClass("glyphicon-resize-full");
            }
            else {
                this.$("#wfsfeaturefilter_resizemarker").addClass("glyphicon-resize-small");
                this.$("#wfsfeaturefilter_resizemarker").removeClass("glyphicon-resize-full");
            }
        },
        getFilterInfos: function () {
            var wfsList = this.model.get("wfsList"),
                layerfilters = [],
                filters = [],
                id,
                value;

            _.each(wfsList, function (layer) {
                _.each(layer.filterOptions, function (filter) {
                    id = "#" + layer.id + "_" + filter.fieldName;
                    value = $(id).val();
                    filters.push({
                        id: id,
                        filtertype: filter.filterType,
                        fieldName: filter.fieldName,
                        fieldValue: value
                    });
                });
                layerfilters.push({
                    layerId: layer.id,
                    filter: filters
                });
            });
            if (layerfilters.length > 0) {
                this.filterLayers(layerfilters);
            }
        },
        filterLayers: function (layerfilters) {
            _.each(layerfilters, function (layerfilter) {
                // Prüfe, ob alle Filter des Layers auf * stehen, damit evtl. der defaultStyle geladen werden kann
                var showall = true,
                    layers = this.model.get("wfsList"),
                    wfslayer = _.find(layers, function (layer) {
                        return layer.id === layerfilter.layerId;
                    }),
                    layer = wfslayer.layer,
                    features = layer.getSource().getFeatures();

                _.each(layerfilter.filter, function (filter) {
                    if (filter.fieldValue !== "*") {
                        showall = false;
                    }
                });

                if (showall === true) {
                    if (layer.defaultStyle) {
                        layer.setStyle(layer.defaultStyle);
                        delete layer.defaultStyle;
                        layer.getSource().getFeatures().forEach(function (feature) {
                            if (feature.defaultStyle) {
                                feature.setStyle(feature.defaultStyle);
                                delete feature.defaultStyle;
                            }
                        });
                    }
                }
                else { // Falls Layer gestyled wurde, speichere den Style und schalte unsichtbar
                    if (layer.getStyle()) {
                        layer.defaultStyle = layer.getStyle();
                        layer.setStyle(null);
                    }

                    features.forEach(function (feature) {
                        var featuredarstellen = true,
                            featureattribute,
                            attributname, attributvalue, featurevalue0, featurevalue;

                        // Prüfung, ob Feature dargestellt werden soll
                        _.each(layerfilter.filter, function (elementfilter) {
                            attributname = elementfilter.fieldName;
                            attributvalue = elementfilter.fieldValue;
                            if (attributvalue !== "*") {
                                featureattribute = _.pick(feature.getProperties(), attributname);
                                if (featureattribute && !_.isNull(featureattribute)) {
                                    featurevalue0 = _.values(featureattribute)[0];
                                    if (featurevalue0) {
                                        featurevalue = featurevalue0.trim();
                                        if (featurevalue !== attributvalue) {
                                            featuredarstellen = false;
                                        }
                                    }
                                }
                            }
                        });
                        if (featuredarstellen === true) {
                            if (feature.defaultStyle) {
                                feature.setStyle(feature.defaultStyle);
                                delete feature.defaultStyle;
                            }
                            else if (layers[0].styleField) {
                                feature.setStyle(layer.defaultStyle(feature));
                            }
                            else {
                                feature.setStyle(layer.defaultStyle(feature));
                            }
                        }
                        else if (featuredarstellen === false) {
                            feature.setStyle(null);
                        }
                    });
                }
            }, this);
            this.model.set("layerfilters", layerfilters);
        },
        render: function () {
            var attr,
                layerfilters = this.model.get("layerfilters");

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.model.getLayers();
                attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.setMaxHeight();
                this.delegateEvents();
                if (layerfilters) {
                    _.each(layerfilters, function (layerfilter) {
                        _.each(layerfilter.filter, function (filter) {
                            $(filter.id).val(filter.fieldValue);
                        });
                    });
                }
            }
            else if (this.model.get("isCurrentWin") === false) {
                if (layerfilters) {
                    _.each(layerfilters, function (layerfilter) {
                        _.each(layerfilter.filter, function (filter) {
                            filter.fieldValue = "*";
                        });
                    });
                    this.filterLayers(layerfilters);
                }
            }
            return this;
        },
        setMaxHeight: function () {
            var maxHeight = $(window).height() - 160;

            this.$el.css("max-height", maxHeight);
        }
    });

    return wfsFeatureFilterView;
});
