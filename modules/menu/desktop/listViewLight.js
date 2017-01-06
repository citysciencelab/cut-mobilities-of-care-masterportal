define(function (require) {

    var listView = require("modules/menu/desktop/listViewMain"),
        DesktopLayerViewLight = require("modules/menu/desktop/layer/viewLight"),
        Radio = require("backbone.radio"),
        Menu;

    Menu = listView.extend({
        initialize: function () {
            this.collection = Radio.request("ModelList", "getCollection");
            Radio.on("Autostart", "startTool", this.startTool, this);
            this.listenTo(this.collection, {
                "updateLightTree": function () {
                    this.render();
                }
            });
            this.renderMain();
            this.render();

            // Themenbaum wird initial aufgeklappt wenn in der config.json im tree-Objekt konfiguriert
            if (this.collection.findWhere({id: "Themen"}).attributes.isInitOpen === true) {
                $("#" + "Themen").parent().addClass("open");
            }
        },
        render: function () {
            $("#" + "Themen").html("");
            var models = this.collection.where({type: "layer"});

            models = _.sortBy(models, function (model) {
                return model.getSelectionIDX();
            });

            this.addViews(models);
            Radio.trigger("Title", "setSize");
        },
        addViews: function (models) {
            _.each(models, function (model) {
                 new DesktopLayerViewLight({model: model});
            }, this);
        },
        startTool: function (toolId) {
            var tools = this.collection.where({type: "tool"}),
                tool = _.findWhere(tools, {id: toolId});

            if (tool) {
                tool.setIsActive(true);
            }
        }
    });
    return Menu;
});
