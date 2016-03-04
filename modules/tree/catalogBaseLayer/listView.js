define([
    "backbone",
    "backbone.radio",
    "modules/tree/catalogBaseLayer/list",
    "modules/tree/catalogBaseLayer/view"
], function (Backbone, Radio, BaseLayerList, BaseLayerView) {

    var listView = Backbone.View.extend({
        collection: BaseLayerList,
        tagName: "ul",
        className: "list-group base-layer-list",
        initialize: function () {
            this.listenTo(Radio.channel("MenuBar"), {
                "switchedMenu": this.render
            });

            this.collection.on("reset", this.render, this);
            this.render();
        },
        render: function () {
            var isMobile = Radio.request("MenuBar", "isMobile");

            if (isMobile === false) {
                $(".base-layer-catalog > .content").append(this.$el.html(""));
                this.collection.forEach(this.addBaseLayer, this);
            }
        },
        addBaseLayer: function (baselayer) {
            var nodeView;

            nodeView = new BaseLayerView({model: baselayer});
            this.$el.append(nodeView.render().el);
        }
    });

    return listView;
});
