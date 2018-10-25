import listView from "./listViewMain";
import DesktopLayerViewLight from "./layer/viewLight";


const LightMenu = listView.extend({
    initialize: function () {
        this.collection = Radio.request("ModelList", "getCollection");
        Radio.on("Autostart", "startModul", this.startModul, this);
        this.listenTo(this.collection, {
            "updateLightTree": function () {
                this.render();
            }
        });
        this.renderMain();
        this.render();
        Radio.trigger("Autostart", "initializedModul", "tree");
    },
    render: function () {
        var models = this.collection.where({type: "layer"});

        $("#tree").html("");
        models = _.sortBy(models, function (model) {
            return model.get("selectionIDX");
        });

        this.addViews(models);
        $("ul#tree.light").css("max-height", $("#map").height() - 160);
    },
    addViews: function (models) {
        _.each(models, function (model) {
            new DesktopLayerViewLight({model: model});
        }, this);
    },
    startModul: function (modulId) {
        var modul = this.collection.find(function (model) {
            return model.get("id").toLowerCase() === modulId;
        });

        if (modul.get("type") === "tool") {
            modul.setIsActive(true);
        }
        else {
            $("#" + modulId).parent().addClass("open");
        }
    }
});

export default LightMenu;
