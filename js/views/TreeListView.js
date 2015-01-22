define([
    'jquery',
    'underscore',
    'backbone',
    'collections/TreeList',
    'views/TreeNodeView',
    'eventbus',
    'bootstrap'
    ], function ($, _, Backbone, TreeList, TreeNodeView) {

        var TreeListView = Backbone.View.extend({
            collection: TreeList,
            el: '#tree',
            initialize: function () {
                this.collection.on("add", this.render, this);
                this.render();
            },
            render: function () {console.log("render liste");
                this.$el.html('');
                this.collection.forEach(this.addTreeNode, this);
            },
            addTreeNode: function (node) {
                var treeNodeView = new TreeNodeView({model: node});
                $('#tree').append(treeNodeView.render().el);
            }
        });

        return TreeListView;
    });
