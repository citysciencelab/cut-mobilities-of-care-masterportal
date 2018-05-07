define(function (require) {

    var TableLayerViewLight = require("modules/menu/table/layer/viewLight"),
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
        addViews: function (models) {
            _.each(models, function (model) {
                 new TableLayerViewLight({model: model});
            }, this);
        }
    });
    return Menu;
});
