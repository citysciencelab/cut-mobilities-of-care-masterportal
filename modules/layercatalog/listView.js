define([
    "backbone",
    "modules/layercatalog/list",
    "modules/layercatalog/viewNode"
], function (Backbone, CatalogList, NodeView) {

    var listView = Backbone.View.extend({
        collection: CatalogList,
        tagName: "ul",
        className: "list-group layer-catalog-list",
        initialize: function () {
            this.listenTo(this.collection, "add", this.render);
            this.collection.on("add", this.render, this);
            this.collection.on("sync", this.render, this);
            this.render();
        },
        render: function () {
            $(".layer-catalog").after(this.$el.html(""));
            this.collection.forEach(this.addTreeNode, this);
        },
        addTreeNode: function (node) {
            if (node.get("layerList").length > 0) {
                var nodeView = new NodeView({model: node});
                this.$el.append(nodeView.render().el);
            }
        }
    });
    return listView;
});
