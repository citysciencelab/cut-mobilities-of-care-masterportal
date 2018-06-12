define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        _ = require("underscore"),
        FreezeControlViewMenu;

    FreezeControlViewMenu = Backbone.View.extend({
        collection: {},
        id: "freeze-view-control",
        className: "freeze-view-start",
        template: _.template("<div class='freeze-view-start' title='Ansicht sperren'><span class='glyphicon icon-lock lock-control'></span></div>"),
        events: {
            "click .freeze-view-start": "toggleFreezeWindow"
        },
        initialize: function () {
            var style = Radio.request("Util", "getUiStyle"),
                el;
            if (style === "DEFAULT") {
                el = Radio.request("ControlsView", "addRowTR", "freeze-view-control");
                this.setElement(el[0]);
                this.render();
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
        toggleFreezeWindow: function () {
            this.model.startFreezeWin();
        }
    });
    return FreezeControlViewMenu;
});
