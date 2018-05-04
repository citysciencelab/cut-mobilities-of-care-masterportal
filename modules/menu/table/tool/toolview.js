define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        ToolTemplate = require("text!modules/menu/table/tool/tooltemplate.html"),
        $ = require("jquery"),
        ToolView;

    ToolView = Backbone.View.extend({
        id: "table-tool",
        className: "table-tool",
        template: _.template(ToolTemplate),
        events: {
            "click": "checkItem"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#table-tools-menu").append(this.$el.html(this.template(attr)));
        },
        checkItem: function () {
            if (this.model.getName() === "legend") {
                Radio.trigger("Legend", "toggleLegendWin");
            }
            else {
                this.model.setIsActive(true);
            }
        }
    });

    return ToolView;
});
