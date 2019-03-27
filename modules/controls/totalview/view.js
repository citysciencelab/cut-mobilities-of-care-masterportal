const TotalViewMapView = Backbone.View.extend(/**@lends TotalViewMapView.prototype */{
    events: {
        "click div#start-totalview": "setTotalView"
    },
    /**
     * @class TotalViewMapView
     * @extends Backbone.View
     * @memberof Controls.TotalView
     * @constructs
     * @fires Util#RadioRequestUtilGetUiStyle
     * @fires Controls#RadioRequestControlsViewAddRowTr
     * @fires MapView#RadioTriggerMapViewResetView
     * @listens Menu#RadioTriggerMenuLoaderReady
     */
    initialize: function () {
        var style = Radio.request("Util", "getUiStyle"),
            el;

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
    template: _.template("<div class='total-view-button' id='start-totalview'><span class='glyphicon glyphicon-fast-backward' title='Zurück zur Startansicht'></span></div>"),
    tabletemplate: _.template("<div class='total-view-menuelement' id='start-totalview'><span class='glyphicon icon-home'></span></br>Hauptansicht</div>"),
    id: "totalview",

    /**
     * Render-Function
     * @returns {TotalViewMapView}
     */
    render: function () {
        this.$el.html(this.template());

        return this;
    },
    /**
     * Renders the table template
     * @returns {void}
     */
    renderToToolbar: function () {
        this.$el.prepend(this.tabletemplate());
    },

    /**
     * Resets the mapView
     * @fires MapView#RadioTriggerMapViewResetView
     */
    setTotalView: function () {
        Radio.trigger("MapView", "resetView");
    }

});

export default TotalViewMapView;
