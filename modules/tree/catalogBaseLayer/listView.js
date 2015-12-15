define([
    "backbone",
    "modules/tree/catalogBaseLayer/list",
    "modules/tree/catalogBaseLayer/view"
], function (Backbone, BaseLayerList, BaseLayerView) {

    var listView = Backbone.View.extend({
        collection: BaseLayerList,
        tagName: "ul",
        className: "list-group base-layer-list",
        initialize: function () {
            this.listenTo(this.collection, "add", this.render);
            this.collection.on("add", this.render, this);
            this.collection.on("sync", this.render, this);
            this.setMaxHeight();
            this.render();
        },
        render: function () {
            $(".base-layer-catalog > .content").append(this.$el.html(""));
            this.collection.forEach(this.addBaseLayer, this);
        },
        addBaseLayer: function (baselayer) {
            var nodeView;

            nodeView = new BaseLayerView({model: baselayer});
            this.$el.append(nodeView.render().el);
        },
        setMaxHeight: function () {
            this.$el.css("max-height", $(window).height() / 6);
        }
    });

    return listView;
});
