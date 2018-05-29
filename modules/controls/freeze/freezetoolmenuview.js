define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        FreezeToolTemplate = require("text!modules/menu/table/tool/tooltemplate.html"),
        $ = require("jquery"),
        Radio = require("backbone.radio"),
        FreezeToolViewMenu;

    FreezeToolViewMenu = Backbone.View.extend({
        collection: {},
        id: "freeze-view-menu",
        className: "table-tool",
        template: _.template(FreezeToolTemplate),
        events: {
            "click .freeze-view-start": "toggleFreezeWindow"
        },
        initialize: function (model) {
            this.listenTo(Radio.channel("MenuLoader"), {
                "ready": function () {
                    this.renderToToolbar();
                }
            });
        },
        renderToToolbar: function () {
            $(this.$el).html(this.template({name: "Ansicht sperren", glyphicon: "icon-close"}));
            $(this.$el).children().last().addClass("freeze-view-start");
            $("#table-tools-menu").append(this.$el);
        },
        toggleFreezeWindow: function () {
            this.model.startFreezeWin();
        }
    });
        return FreezeToolViewMenu;
});
