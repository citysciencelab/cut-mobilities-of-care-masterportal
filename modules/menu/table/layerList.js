define(function (require) {

    var TableLayerViewLight = require("modules/menu/table/layer/viewLayerItem"),
        Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        Menu;

        Menu = Backbone.View.extend({
            collection: {},
                el: "nav#main-nav",
                attributes: {
                role: "navigation"
            },

            initialize: function () {
            this.collection = Radio.request("ModelList", "getCollection");
            this.renderMain();
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
            },

            renderMain: function () {
                this.parseViews();
            },

            parseViews: function (models) {
                _.each(models, function (model) {
                    this.addDesktopFolderView(model);
                }, this);
            }
        });

    return Menu;
});
