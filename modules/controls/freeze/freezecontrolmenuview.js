define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        _ = require("underscore"),
        FreezeControlTemplate = require("text!modules/menu/table/tool/tooltemplate.html"),
        FreezeControlViewMenu;

    FreezeControlViewMenu = Backbone.View.extend({
        collection: {},
        id: "freeze-view-control",
        className: "freeze-view-start",
        template: _.template("<div class='freeze-view-start' title='Ansicht sperren'><span class='glyphicon icon-lock lock-control'></span></div>"),
        tabletemplate: _.template(FreezeControlTemplate),
        events: {
            "click .freeze-view-start": "toggleFreezeWindow"
        },
        initialize: function () {
            var style = Radio.request("Util", "getUiStyle"),
                el;
            if (style === "DEFAULT") {
                el = Radio.request("ControlsView", "addRowTR", "freeze-view-control");
                this.setElement(el[0]);
                this.renderAsControl();
            }
            else if (style === "TABLE") {
                this.listenTo(Radio.channel("MenuLoader"), {
                    "ready": function () {
                        this.setElement("#table-tools-menu");
                        this.renderToToolbar();
                    }
                });
                // Hier unschön gehackt, da in gebauter Version der MenuLoader schon fertig ist und sein ready lange gesendet hat
                // bis hier der Listener enabled wird. Muss noch mal generell überarbeitet werden ToDo! Christa Becker 05.06.2018
                this.setElement("#table-tools-menu");
                this.renderToToolbar();
            }

            this.renderAsControl();
        },
        renderAsControl: function () {
            this.$el.html(this.template);
        },
        renderToToolbar: function () {
            //this.$el.prepend(this.tabletemplate());
            this.$el.append(this.tabletemplate({id: "freeze-view", name: "Ansicht sperren", glyphicon: "icon-lock"}));
            $(this.$el).children().last().addClass("freeze-view-start");
            $("#table-tools-menu").append(this.$el);

        },
        toggleFreezeWindow: function () {
            this.model.startFreezeWin();
        }
    });
    return FreezeControlViewMenu;
});
