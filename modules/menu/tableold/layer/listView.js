define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        ListTemplate = require("text!modules/menu/table/layer/templates/template.html"),
        SingleLayerView = require("modules/menu/table/layer/singleLayerView"),
        $ = require("jquery"),
        LayerView;

    LayerView = Backbone.View.extend({
        id: "table-layer-list",
        className: "table-layer-list table-nav",
        template: _.template(ListTemplate),
        events: {
            "click .icon-burgermenu_alt": "burgerMenuIsActive"
        },
        initialize: function () {
            this.collection = Radio.request("ModelList", "getCollection");

        },
        burgerMenuIsActive: function (event) {
            $(event.currentTarget.parentElement).toggleClass("burgerMenuIsActive");
        },
        render: function () {
            this.$el.html(this.template());
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
