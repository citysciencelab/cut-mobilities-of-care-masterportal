define([
    "backbone",
    "backbone.radio",
    "modules/tree/catalogLayer/list",
    "modules/tree/catalogLayer/viewNode"
], function (Backbone, Radio, CatalogList, NodeView) {

    var listView = Backbone.View.extend({
        collection: CatalogList,
        tagName: "ul",
        className: "list-group layer-catalog-list",
        initialize: function () {
            this.listenTo(Radio.channel("MenuBar"), {
                "switchedMenu": this.render
            });

            this.listenTo(this.collection, {
                "reset": this.render
            });
            this.render();
        },
        render: function () {
            var isMobile = Radio.request("MenuBar", "isMobile");

            if (isMobile === false) {
                $(".layer-catalog > .content").append(this.$el.html(""));
                this.collection.forEach(this.addTreeNode, this);
            }
        },
        addTreeNode: function (node) {
            var nodeView = new NodeView({model: node});

            this.$el.append(nodeView.render().el);
        }
    });

    return listView;
});
