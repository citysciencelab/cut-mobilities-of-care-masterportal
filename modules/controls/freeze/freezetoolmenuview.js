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
        initialize: function () {
            this.listenTo(Radio.channel("MenuLoader"), {
                "ready": function () {
                    this.renderToToolbar();
                }
            });
            // Hier unschön gehackt, da in gebauter Version der MenuLoader schon fertig ist und sein ready lange gesendet hat
            // bis hier der Listener enabled wird. Muss noch mal generell überarbeitet werden ToDo! Christa Becker 05.06.2018
            this.renderToToolbar();
        },
        renderToToolbar: function () {
            $(this.$el).html(this.template({name: "Ansicht sperren", glyphicon: "icon-lock"}));
            $(this.$el).children().last().addClass("freeze-view-start");
            $("#table-tools-menu").append(this.$el);
        },
        toggleFreezeWindow: function () {
            this.model.startFreezeWin();
        }
    });
    return FreezeToolViewMenu;
});
