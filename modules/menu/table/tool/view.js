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
            models = collection.models.filter(function (model) {
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
            if ($("#table-nav").attr("class") === "table-nav-0deg" || $("#table-nav").attr("class") === "table-nav-180deg") {
                this.$("#table-tools-menu").css({
                    "left": ""
                });
                this.$("#funnel").css({
                    "left": ""
                });
            }
            else if ($("#table-nav").attr("class") === "table-nav-270deg" || $("#table-nav").attr("class") === "table-nav-90deg") {
                this.$("#table-tools-menu").css({
                    "left": "-150px"
                });
                this.$("#funnel").css({
                    "left": "125px"
                });
            }
            $("div.table-tools-menu").show();
            Radio.request("TableMenu", "setActiveElement", "Tool");
        }
    },
    closeToolMenu: function () {
        $("div.table-tools").removeClass("table-tools-active");
        $("div.table-tools-menu").hide();
        Radio.trigger("TableMenu", "deactivateCloseClickFrame");
    }
});

export default ToolView;
