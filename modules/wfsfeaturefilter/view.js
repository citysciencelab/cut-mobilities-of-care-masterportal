define([
    'jquery',
    'underscore',
    'backbone',
    'text!modules/wfsfeaturefilter/template.html',
    'modules/wfsfeaturefilter/model'
], function ($, _, Backbone, wfsFeatureFilterTemplate, wfsFeatureFilter) {
    "use strict";
    var wfsFeatureFilterView = Backbone.View.extend({
        model: wfsFeatureFilter,
        id: 'wfsFilterWin',
        className: 'win-body',
        template: _.template(wfsFeatureFilterTemplate),
        initialize: function () {
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement
        },
        events: {
            'click #filterbutton': 'getFilterInfos'
        },
        getFilterInfos: function () {
            var wfsList = this.model.get('wfsList'), layerfilters, filters, id, value;
            layerfilters = [];
            filters = [];
            _.each(wfsList, function (layer) {
                _.each(layer.filterOptions, function (filter) {
                    id = '#' + layer.layerId + '_' + filter.fieldName;
                    value = $(id).val();
                    filters.push(
                        {
                            id: id,
                            filtertype: filter.filterType,
                            fieldName: filter.fieldName,
                            fieldValue: value
                        }
                    );
                });
                layerfilters.push(
                    {
                        layerId: layer.layerId,
                        filter: filters
                    }
                );
            });
            if (layerfilters.length > 0) {
                this.filterLayers(layerfilters);
            }
        },
        filterLayers: function (layerfilters) {
            var that = this;
            _.each(layerfilters, function (layerfilter) {
                // Prüfe, ob alle Filter des Layers auf * stehen, damit evtl. der defaultStyle geladen werden kann
                var showall = true;
                _.each(layerfilter.filter, function (filter) {
                    if (filter.fieldValue !== '*') {
                        showall = false;
                    }
                });
                that.model.get('map').getLayers().forEach(function (layer) {
                    if (layer.getProperties().typ === 'WFS') {
                        var layerid = layer.id, features;
                        // Hier wird der zum Filter zugehörige Layer gefunden
                        if (layerid === layerfilter.layerId) {
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
                            } else {
                                // Falls Layer gestyled wurde, speichere den Style und schalte unsichtbar
                                if (layer.getStyle()) {
                                    layer.defaultStyle = layer.getStyle();
                                    layer.setStyle(null);
                                }
                                features = layer.getSource().getFeatures();
                                features.forEach(function (feature) {
                                    var featuredarstellen = true, attributname, attributvalue, featurevalue0, featurevalue;
                                    // Prüfung, ob Feature dargestellt werden soll
                                    _.each(layerfilter.filter, function (elementfilter) {
                                        attributname = elementfilter.fieldName;
                                        attributvalue = elementfilter.fieldValue;
                                        if (attributvalue !== '*') {
                                            var featureattribute = _.pick(feature.getProperties(), attributname);
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
                                        } else {
                                            feature.setStyle(layer.defaultStyle);
                                        }
                                    } else if (featuredarstellen === false) {
                                        feature.setStyle(null);
                                    }
                                });
                            }
                        }
                    }
                }, this);
            });
            this.model.set('layerfilters', layerfilters);
        },
        render: function () {
            var attr, layerfilters;
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.model.prep();
                attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            } else if (this.model.get("isCurrentWin") === false) {
                layerfilters = this.model.get('layerfilters');
                if (layerfilters) {
                    _.each(layerfilters, function (layerfilter) {
                        _.each(layerfilter.filter, function (filter) {
                            filter.fieldValue = '*';
                        });
                    });
                    this.filterLayers(layerfilters);
                }
            }
        }
    });
    return wfsFeatureFilterView;
});
