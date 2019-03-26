import Model from "./model";

const TotalViewMapView = Backbone.View.extend({
    events: {
        "click div#start-totalview": "setTotalView"
    },
    initialize: function () {
        var style = Radio.request("Util", "getUiStyle"),
            el,
            tpl,
            tabletpl;

        this.model = new Model();

        tpl = this.modifyTemplate("<div class='total-view-button' id='start-totalview'><span class='glyphicon glyphicon-fast-backward' title='Zurück zur Startansicht'></span></div>");
        tabletpl = this.modifyTableTemplate("<div class='total-view-menuelement' id='start-totalview'><span class='glyphicon icon-home'></span></br>Hauptansicht</div>");
        this.template = _.template(tpl);
        this.tableTemplate = _.template(tabletpl);

        if (style === "DEFAULT") {
            el = Radio.request("ControlsView", "addRowTR", "totalview");
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
    },
    id: "totalview",
    render: function () {
        this.$el.html(this.template());

        return this;
    },
    renderToToolbar: function () {
        this.$el.prepend(this.tableTemplate());
    },
    setTotalView: function () {
        Radio.trigger("MapView", "resetView");
    },
    modifyTemplate: function (tpl) {
        var result,
            button = this.model.getButton();

        if (!button) {
            result = tpl;
        }
        else {
            result = tpl.replace(/glyphicon-fast-backward/g, button);
        }
        return result;
    },
    modifyTableTemplate: function (tpl) {
        var result,
            button = this.model.getTableButton();

        if (!button) {
            result = tpl;
        }
        else {
            result = tpl.replace(/icon-home/g, button);
        }
        return result;
    },

});

export default TotalViewMapView;
