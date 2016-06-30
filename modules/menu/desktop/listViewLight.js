define([
    "modules/menu/desktop/listViewMain",
    "modules/menu/desktop/layer/viewLight"
    ], function () {
        var listView = require("modules/menu/desktop/listViewMain"),
            DesktopLayerViewLight = require("modules/menu/desktop/layer/viewLight"),
            Menu;

        Menu = listView.extend({
            initialize: function () {
                listView.prototype.initialize.apply(this, arguments);

                this.listenTo(this.collection,
                {
                    "updateLightTree": function () {
                        this.render();
                    }
                });
                this.render();
            },
            render: function () {
                $("#" + "Themen").html("");
                var models = this.collection.where({type: "layer"});

                models = _.sortBy(models, function (model) {
                    return model.getSelectionIDX();
                });

                this.addViews(models);
            },
            addViews: function (models) {
                _.each(models, function (model) {
                    new DesktopLayerViewLight({model: model});
                });
            }
        });
        return Menu;
    }
);
