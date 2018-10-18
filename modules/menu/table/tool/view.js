import MenuTemplate from "text-loader!./menutemplate.html";
import ToolsView from "./toolview";

const ToolView = Backbone.View.extend({
    events: {
        "click": "toggleToolMenu"
    },
    initialize: function () {
        this.render();
        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementTool": this.closeToolMenu
        });
    },
    id: "table-tools",
    className: "table-nav table-tools",
    template: _.template(MenuTemplate),
    render: function () {
        var collection = Radio.request("ModelList", "getCollection"),
            models = _.filter(collection.models, function (model) {
                return model.get("type") === "tool" || model.get("type") === "folder";
            });

        _.each(models, function (model) {
            switch (model.get("type")) {
                case "tool": {
                    this.addToolView(model);
                    break;
                }
                case "folder": {
                    if (model.get("id") === "tools") {
                        this.addToolsMenuView();
                    }
                    break;
                }
                default:
            }
        }, this);
        return this;
    },
    addToolsMenuView: function () {
        $("#table-nav").append(this.$el.html(this.template()));
    },
    addToolView: function (model) {
        if (model.get("isVisibleInMenu")) {
            new ToolsView({model: model});
        }
    },
    toggleToolMenu: function () {
        if ($("div.table-tools").hasClass("table-tools-active")) {
            this.closeToolMenu();
        }
        else {
            $("div.table-tools").addClass("table-tools-active");
            $("div.table-tools-menu").show();
            Radio.request("TableMenu", "setActiveElement", "Tool");
        }
    },
    closeToolMenu: function () {
        $("div.table-tools").removeClass("table-tools-active");
        $("div.table-tools-menu").hide();
    }
});

export default ToolView;
