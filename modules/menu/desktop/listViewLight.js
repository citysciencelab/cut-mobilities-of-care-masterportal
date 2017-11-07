define(function (require) {

    var listView = require("modules/menu/desktop/listViewMain"),
        DesktopLayerViewLight = require("modules/menu/desktop/layer/viewLight"),
        Radio = require("backbone.radio"),
        Menu;

    Menu = listView.extend({
        initialize: function () {
            this.collection = Radio.request("ModelList", "getCollection");
            Radio.on("Autostart", "startModul", this.startModul, this);
            this.listenTo(this.collection, {
                "updateLightTree": function () {
                    console.log(123);
                    this.render();
                }
            });
            this.renderMain();
            this.render();
            Radio.trigger("Autostart", "initializedModul", "tree");
        },
        render: function () {
            $("#" + "tree").html("");
            var models = this.collection.where({type: "layer"});

            models = _.sortBy(models, function (model) {
                return model.getSelectionIDX();
            });

            this.addViews(models);
            Radio.trigger("Title", "setSize");
            $("ul#tree.light").css("max-height", $("#map").height() - 160);
        },
        addViews: function (models) {
            _.each(models, function (model) {
                 new DesktopLayerViewLight({model: model});
            }, this);
        },
        startModul: function (modulId) {
            var modul = _.findWhere(this.collection.models, {id: modulId});

            if (modul.attributes.type === "tool") {
                modul.setIsActive(true);
            }
            else {
                $("#" + modulId).parent().addClass("open");
            }
        }
    });
    return Menu;
});
