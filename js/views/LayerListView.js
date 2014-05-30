define([
    'jquery',
    'underscore',
    'backbone',
    'views/WMSLayerView',
    'text!templates/LayerList.html',
    'collections/LayerList',
    'bootstrap'
], function ($, _, Backbone, WMSLayerView, LayerListTemplate, LayerList) {

    var WMSLayerListView = Backbone.View.extend({
        collection: LayerList,
        el: '#tree',
        events: {
            //'click span.glyphicon-chevron-right': 'toggle',
            'click span.glyphicon-unchecked': 'toggleVisibility',
            //'click strong': 'toggle',
            'click .panel-heading': 'toggle'
        },
        template: _.template(LayerListTemplate),
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.append(this.template());
            this.collection.forEach(this.addOne, this);
        },
        addOne: function (wmslayer) {
            var wmsLayerView = new WMSLayerView({model: wmslayer});
            if (wmsLayerView.model.get('treeFolder') === 'geobasisdaten') {
                $('.geobasisdaten').append(wmsLayerView.render().el);
            }
            else if (wmsLayerView.model.get('treeFolder') === 'verkehrsdaten') {
                $('.verkehrsdaten').append(wmsLayerView.render().el);
            }
        },
        toggle: function (evt) {
            //console.log(evt);
            //console.log(evt.target.id);
            //console.log(this.collection);
            $('.' + evt.currentTarget.id).collapse('toggle');
            $('#' + evt.currentTarget.id + ' > span').toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
        },
        toggleVisibility: function () {
            console.log(55);
        }
    });

    return WMSLayerListView;
});