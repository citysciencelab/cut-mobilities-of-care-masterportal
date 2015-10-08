define([
    "backbone",
    "modules/catalogExtern/list",
    "modules/catalogExtern/viewNode",
    "eventbus"
], function (Backbone, CatalogList, NodeView, EventBus) {

    var listView = Backbone.View.extend({
        collection: CatalogList,
        tagName: "ul",
        className: "layer-extern-list",
        initialize: function () {
            this.listenTo(this.collection, {
                "reset": this.render
            });
            // this.render();
        },
        render: function () {
            $(".layer-catalog-extern").after(this.$el.html(""));
            this.collection.forEach(this.addTreeNode, this);
            $(".nav li:first-child").addClass("open");
            $(".layer-catalog-extern").slideDown("600");

        },
        addTreeNode: function (node) {
            var nodeView = new NodeView({model: node});

            this.$el.append(nodeView.render().el);
        }
    });

    return listView;
});
