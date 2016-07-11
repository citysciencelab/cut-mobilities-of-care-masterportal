define([
    "backbone.radio",
    "modules/menu/desktop/listViewMain",
    "modules/menu/desktop/layer/viewLight"
    ], function () {
        var listView = require("modules/menu/desktop/listViewMain"),
            DesktopLayerViewLight = require("modules/menu/desktop/layer/viewLight"),
            Radio = require("backbone.radio"),
            Menu;

        Menu = listView.extend({
            initialize: function () {
                this.collection = Radio.request("ModelList", "getCollection");
                this.listenTo(this.collection,
                {
                    "updateLightTree": function () {
                        this.render();
                    }
                });
                this.renderMain();
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
                     this.subviews.push(new DesktopLayerViewLight({model: model}));
                }, this);
            }
        });
        return Menu;
    }
);
