import FreezeToolTemplate from "text-loader!../../menu/table/tool/tooltemplate.html";

const FreezeToolViewMenu = Backbone.View.extend({
    events: {
        "click .freeze-view-start": "toggleFreezeWindow"
    },
    initialize: function () {
        this.listenTo(Radio.channel("MenuLoader"), {
            "ready": function () {
                this.renderToToolbar();
            }
        });
        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                if (changed.freezeText || changed.unfreezeText || changed.name || changed.glyphicon) {
                    this.renderToToolbar();
                }
            }
        });
        // Hier unschön gehackt, da in gebauter Version der MenuLoader schon fertig ist und sein ready lange gesendet hat
        // bis hier der Listener enabled wird. Muss noch mal generell überarbeitet werden ToDo! Christa Becker 05.06.2018
        this.renderToToolbar();
    },
    collection: {},
    id: "freeze-view-menu",
    className: "table-tool",
    template: _.template(FreezeToolTemplate),
    renderToToolbar: function () {
        const attr = this.model.toJSON();

        $(this.$el).html(this.template(attr));
        $(this.$el).children().last().addClass("freeze-view-start");
        $("#table-tools-menu").append(this.$el);
    },
    toggleFreezeWindow: function () {
        this.model.startFreezeWin();
    }
});

export default FreezeToolViewMenu;
