define([
    'jquery',
    'underscore',
    'backbone',
    'collections/TreeList',
    'views/TreeNodeView',
    'eventbus',
    'bootstrap'
    ], function ($, _, Backbone, TreeList, TreeNodeView, EventBus) {

        var TreeListView = Backbone.View.extend({
            collection: TreeList,
            el: '#tree',
            initialize: function () {
                EventBus.on("currentResolution", this.render, this);
                this.collection.on("add", this.render, this);
                this.render();
            },
            render: function () {
                this.$el.html('');
                this.collection.forEach(this.addTreeNode, this);
                // this.$el.parent().addClass("open");
            },
            addTreeNode: function (node) {
                if (node.get("layerList").length > 0) {
                    var treeNodeView = new TreeNodeView({model: node});
                    $('#tree').append(treeNodeView.render().el);
                }
            }
        });

        return TreeListView;
    });
