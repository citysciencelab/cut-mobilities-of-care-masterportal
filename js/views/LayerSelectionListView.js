define([
    "underscore",
    "backbone",
    "collections/LayerSelectionList",
    "views/LayerSelectedView"
    ], function (_, Backbone, LayerSelectionList, LayerSelectedView) {

        var TreeListView = Backbone.View.extend({
            collection: new LayerSelectionList(),
            tagName: "ul",
            className: "list-group",
            id: "tree2",
            initialize: function () {
                this.render();
                this.listenTo(this.collection, "add", this.render);
            },
            render: function () {
                $("#LayerSelection").after(this.$el.html(""));
                this.collection.forEach(this.renderModelView, this);
            },
            renderModelView: function (model) {
                var layerView = new LayerSelectedView({model: model});
                this.$el.prepend(layerView.render().el);
            }
        });

        return TreeListView;
    });
