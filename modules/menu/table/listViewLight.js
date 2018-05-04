define(function (require) {

    var TableLayerViewLight = require("modules/menu/table/layer/viewLight"),
        TableLayerView = require("modules/menu/table/layer/view"),
        Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        Menu;

Menu = Backbone.View.extend({
        initialize: function () {
            this.collection = Radio.request("ModelList", "getCollection");
            this.render();
        },
        render: function () {
            $("#" + "tree-table").html("");
            var models = this.collection.where({type: "layer"});

            models = _.sortBy(models, function (model) {
                return model.getSelectionIDX();
            });
            this.addViews(models);
        },
        renderMain: function () {
                _.each(function (model) {
                     this.addTableLayerView(model);
                }, this);
            },
        addTableLayerView: function (model) {
                new TableLayerView({model: model});
        },
        addViews: function (models) {
            _.each(models, function (model) {
                 new TableLayerViewLight({model: model});
            }, this);
        }
    });
    return Menu;
});
