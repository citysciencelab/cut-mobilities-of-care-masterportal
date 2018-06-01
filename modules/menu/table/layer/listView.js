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
            this.listenTo(Radio.channel("TableMenu"), {
                "Layer": function () {
                    this.$el.find("#table-nav-layers-panel").removeClass("in");
                    this.$el.removeClass("burgerMenuIsActive");
                    this.$el.find(".icon-burgermenu_alt").addClass("collapsed");
                }
            });
            //Aktiviert ausgewälter Layer; Layermenu ist aktiv
            this.listenTo(this.collection, {
                "updateSelection": function () {
                    this.render();
                    $("#table-nav-layers-panel").collapse("show");
                    this.$el.addClass("burgerMenuIsActive");
                }
            });
        },
        burgerMenuIsActive: function (event) {
            $(event.currentTarget.parentElement).toggleClass("burgerMenuIsActive");
            Radio.trigger("TableMenu", "elementIsActive", "Layer");
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
