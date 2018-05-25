define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        MenuTemplate = require("text!modules/menu/table/tool/menutemplate.html"),
        $ = require("jquery"),
        ToolsView = require("modules/menu/table/tool/toolview"),
        ToolView;

    ToolView = Backbone.View.extend({
        id: "table-tools",
        className: "table-nav table-tools",
        template: _.template(MenuTemplate),
        events: {
            "click": "toggleToolMenu"
        },
        initialize: function () {
            this.render();
            this.listenTo(Radio.channel("TableMenu"), {
                "Tool": this.closeToolMenu
            });
        },
        render: function () {
            var collection = Radio.request("ModelList", "getCollection"),
                models = _.filter(collection.models, function (model) {
                    return model.getType() === "tool" || model.getType() === "folder";
                });

            _.each(models, function (model) {
                switch (model.getType()) {
                    case "tool": {
                        this.addToolView(model);
                        break;
                    }
                    case "folder": {
                        if (model.getId() === "tools") {
                            this.addToolsMenuView ();
                        }
                    }
                }
            }, this);
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
                Radio.trigger("TableMenu", "elementIsActive", "Tool");
            }
        },
        closeToolMenu: function () {
            $("div.table-tools").removeClass("table-tools-active");
            $("div.table-tools-menu").hide();
        }
    });

    return ToolView;
});
