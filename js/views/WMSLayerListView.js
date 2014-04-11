/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/WMSLayerView',
    'bootstrap'
], function ($, _, Backbone, WMSLayerView) {

    var WMSLayerListView = Backbone.View.extend({
        el: '#tree',
        initialize: function () {
            this.render();
        },
        render: function () {
            this.collection.forEach(this.addOne, this);
        },
        addOne: function (wmslayer) {
            var wmsLayerView = new WMSLayerView({model: wmslayer});
            this.$el.append(wmsLayerView.render().el);
        }
    });

    return WMSLayerListView;
});