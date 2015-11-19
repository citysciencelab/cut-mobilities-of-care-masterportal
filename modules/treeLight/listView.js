define([
    "backbone",
    "modules/layer/list",
    "modules/treeLight/view",
    "eventbus"
], function (Backbone, LayerList, LayerView, EventBus) {

    var LayerListView = Backbone.View.extend({
        collection: LayerList,
        tagName: "ul",
        className: "list-group",
        initialize: function () {
            this.listenTo(this.collection, {
                "add": this.render
            });

            this.setMaxHeight();
            this.render();
        },
        render: function () {
            $(".dropdown-tree").append(this.$el.html(""));
            this.collection.forEach(this.addTreeNode, this);
            EventBus.trigger("registerLayerTreeInClickCounter", this.$el);
        },
        addTreeNode: function (node) {
            // hier nur von displayintree nicht auf false
            var layerView = new LayerView({model: node});

            this.$el.prepend(layerView.render().el);
        },
        setMaxHeight: function () {
            this.$el.css("max-height", $(window).height() - 100);
            this.$el.css("overflow-y", "auto");
        }
    });

    return LayerListView;
});
