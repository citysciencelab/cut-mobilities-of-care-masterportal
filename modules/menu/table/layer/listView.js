define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        TableNavView = require("modules/menu/table/layer/singleLayerView"),
        ListTemplate = require("text!modules/menu/table/layer/templates/template.html"),
        SingleLayerView = require("modules/menu/table/layer/singleLayerView"),
        $ = require("jquery"),
        LayerView;

    LayerView = Backbone.View.extend({
        id: "table-layer-list",
        className: "table-layer-list table-nav",
        template: _.template(ListTemplate),
        initialize: function () {
            this.collection = Radio.request("ModelList", "getCollection");
            this.listenTo(Radio.channel("TableMenu"), {
                "hideMenuElementLayer": this.hideMenu
            });
            this.listenTo(this.collection, {
                "updateLightTree": function () {
                    this.render();
                }
            });
            // bootstrap collapse event
            this.$el.on("show.bs.collapse", function () {
                Radio.request("TableMenu", "setActiveElement", "Layer");
            });
        },
        hideMenu: function () {
            $("#table-nav-layers-panel").collapse("hide");
        },
        render: function () {
            this.$el.html(this.template());
            if (Radio.request("TableMenu", "getActiveElement") === "Layer") {
                $("#table-nav-layers-panel").collapse("show");
            }
            this.renderList();
            return this.$el;
        },
        renderList: function () {
            var models = this.collection.where({type: "layer"});

            models = _.sortBy(models, function (model) {
                return model.getSelectionIDX();
            });
            this.addViews(models);
        },

        addViews: function (models) {
            var childElement = {};

            _.each(models, function (model) {
                childElement = new SingleLayerView({model: model}).render();
                this.$el.find("ul.layers").prepend(childElement);

            }, this);
        }
    });

    return LayerView;
});
