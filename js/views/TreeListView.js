define([
    "jquery",
    "underscore",
    "backbone",
    "collections/TreeList",
    "views/TreeNodeView",
    "eventbus",
    "bootstrap"
    ], function ($, _, Backbone, TreeList, TreeNodeView) {

        var TreeListView = Backbone.View.extend({
            collection: TreeList,
            tagName: "ul",
            className: "list-group",
            id: "tree",
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
                    var treeNodeView = new TreeNodeView({model: node});
                    this.$el.append(treeNodeView.render().el);
                }
            }
        });

        return TreeListView;
    });
