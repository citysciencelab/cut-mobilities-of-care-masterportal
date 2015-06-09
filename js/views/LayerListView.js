define([
    "backbone",
    "modules/layer/list",
    "modules/layer/view",
    "eventbus"
], function (Backbone, LayerList, LayerView, EventBus) {

    var LayerListView = Backbone.View.extend({
        collection: LayerList,
        el: "#tree",
        initialize: function () {
            this.listenTo(this.collection, "change:isChecked", this.render);
            this.listenTo(this.collection, "change:isExpanded", this.render);
            this.render();
        },
        render: function () {
            this.collection.forEach(this.addTreeNode, this);
            EventBus.trigger("registerLayerTreeInClickCounter", this.$el);
        },
        addTreeNode: function (node) {
            var layerView = new LayerView({model: node});

            $("#tree").prepend(layerView.render().el);
        }
    });

    return LayerListView;
});
