define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/wfsFeatureFilter.html',
    'models/wfsFeatureFilter',
    'eventbus'
], function ($, _, Backbone, wfsFeatureFilterTemplate, wfsFeatureFilter, EventBus) {

var wfsFeatureFilterView = Backbone.View.extend({
        model: wfsFeatureFilter,
        id: 'wfsFilterWin',
        className: 'panel panel-master',
        template: _.template(wfsFeatureFilterTemplate),
        initialize: function () {
            this.render();
            EventBus.on('toggleFilterWfsWin', this.toggleFilterWfsWin, this);
        },
        events: {
            'click .glyphicon-chevron-up, .glyphicon-chevron-down': 'toggleContent',
            'click .close': 'toggleFilterWfsWin',
            'click #filterbutton': 'getFilterInfos'
        },
        getFilterInfos: function () {
            var wfsList = this.model.get('wfsList');
            var layerfilters = new Array();
            var filters = new Array();
            _.each(wfsList, function (layer, index, list) {
                _.each(layer.filterOptions, function (filter, index, list) {
                    var id = '#' + layer.layerId + '_' + filter.fieldName;
                    var value = $(id).val();
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
            _.each(layerfilters, function(layerfilter, index, list) {
                // Prüfe, ob alle Filter des Layers auf * stehen, damit evtl. der defaultStyle geladen werden kann
                var showall = true;
                _.each(layerfilter.filter, function (filter, index, list) {
                    if (filter.fieldValue != '*') {
                        showall = false;
                    }
                });

                that.model.get('map').getLayers().forEach(function (layer) {
                    if (layer.getProperties().typ == 'WFS')
                    {
                        var layerid = layer.id;

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
                            }
                            else {

                                // Falls Layer gestyled wurde, speichere den Style und schalte unsichtbar
                                if (layer.getStyle()) {
                                    layer.defaultStyle = layer.getStyle();
                                    layer.setStyle(null);
                                }

                                var features = layer.getSource().getFeatures();
                                features.forEach(function(feature) {
                                    var featuredarstellen = true;
                                    // Prüfung, ob Feature dargestellt werden soll
                                    _.each(layerfilter.filter, function (elementfilter, index, list) {
                                        var attributname = elementfilter.fieldName;
                                        var attributvalue = elementfilter.fieldValue;
                                        if (attributvalue != '*') {
                                            var featureattribute = _.pick(feature.getProperties(), attributname);
                                            if (featureattribute && !_.isNull(featureattribute)) {
                                                var featurevalue0 = _.values(featureattribute)[0];
                                                if (featurevalue0) {
                                                    var featurevalue = featurevalue0.trim();
                                                    if (featurevalue != attributvalue) {
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
                                        else {
                                            feature.setStyle(layer.defaultStyle);
                                        }
                                    }
                                    else if (featuredarstellen === false){
                                        /*
                                            Bug in OL 3.0.0 #2725.
                                            feature.setStyle(null);
                                            Resolved vermutlich mit 3.1.0
                                        */
                                        if (feature.getStyle() && feature.getStyle()[0].image_.getSrc() != '../../img/blank.png') {
                                            feature.defaultStyle = feature.getStyle();
                                        }
                                        if (feature.defaultStyle) {
                                            if (feature.getStyle()) {
                                                //var newStyle = feature.getStyle();
                                                var imagestyle = new ol.style.Icon({
                                                    src: '../../img/blank.png',
                                                    width: 10,
                                                    height: 10,
                                                    scale: 1
                                                });
                                                var style = [
                                                    new ol.style.Style({
                                                        image: imagestyle,
                                                        zIndex: 'Infinity'
                                                    })
                                                ];
                                                feature.setStyle(style);
                                            }
                                        }
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
            var attr = this.model.toJSON();
             $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        refreshHtml: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        toggleContent: function () {
            $('#wfsFilterWin > .panel-body').toggle('slow');
            $('#wfsFilterWin > .panel-heading > .toggleChevron').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
        },
        toggleFilterWfsWin: function () {
            if ($('#wfsFilterWin').is(":visible")){
                var layerfilters = this.model.get('layerfilters');
                if (layerfilters) {
                    _.each(layerfilters, function(layerfilter, index, list) {
                        _.each(layerfilter.filter, function (filter, index, list) {
                            filter.fieldValue = '*';
                        });
                    });
                    this.filterLayers(layerfilters);
                }
                $('#wfsFilterWin').hide();
            }
            else {
                this.model.prep();
                this.refreshHtml();
                $('#wfsFilterWin').toggle();
            }
        }
    });

    return wfsFeatureFilterView;
});
