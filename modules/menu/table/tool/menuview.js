define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        ToolTemplate = require("text!modules/menu/table/tool/menutemplate.html"),
        $ = require("jquery"),
        ToolsMenuView;

    ToolsMenuView = Backbone.View.extend({
        id: "table-tools",
        className: "table-nav table-tools",
        template: _.template(ToolTemplate),
        events: {
            "click": "toggleToolMenu"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            return this.$el.html(this.template());
        },
        toggleToolMenu: function () {
            $("div.table-tools-menu").toggle();
            if ($("div.table-tools").hasClass("table-tools-active")) {
                $("div.table-tools").removeClass("table-tools-active");
            }
            else {
                $("div.table-tools").addClass("table-tools-active");
            }

        }
    });

    return ToolsMenuView;
});
