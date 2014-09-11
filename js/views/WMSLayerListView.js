define([
    'jquery',
    'underscore',
    'backbone',
    'collections/WMSLayerList',
    'views/WMSLayerView',
    'eventbus',
    'bootstrap'
], function ($, _, Backbone, WMSLayerList, WMSLayerView) {

    var WMSLayerListView = Backbone.View.extend({
        collection: WMSLayerList,
        el: '#tree',
        initialize: function () {
            this.listenTo(this.collection, 'change:isChecked', this.render);
            this.listenTo(this.collection, 'change:isExpanded', this.render);
            this.render();
        },
        render: function () {
            this.$el.html('');
            this.collection.forEach(this.addTreeNode, this);
        },
        addTreeNode: function (node) {
            var wmsLayerView = new WMSLayerView({model: node});
            $('#tree').append(wmsLayerView.render().el);
        }
    });

    return WMSLayerListView;
});
