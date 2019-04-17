const TotalViewMapView = Backbone.View.extend(/** @lends TotalViewMapView.prototype */{
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
            el,
            tpl,
            tabletpl;

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
                /**
                * initializes the settings for table style
                * @returns {void}
                */
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

    /**
     * Render-Function
     * @returns {TotalViewMapView} TotalViewMapView
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
        this.$el.prepend(this.tableTemplate());
    },

    /**
     * Resets the mapView
     * @fires MapView#RadioTriggerMapViewResetView
     * @returns {void}
     */
    setTotalView: function () {
        Radio.trigger("MapView", "resetView");
    },
    /**
     * Changes the glyphicon for the Button if a modification exists
     * @param {String} tpl initial template
     * @return {String} template with possile modified glyphicon
     */
    modifyTemplate: function (tpl) {
        var result,
            button,
            config = Radio.request("Parser", "getItemByAttributes", {id: "totalview"});

        button = _.isUndefined(config) === false ? config.attr.glyphicon : config;

        if (!button) {
            result = tpl;
        }
        else {
            result = tpl.replace(/glyphicon-fast-backward/g, button);
        }
        return result;
    },
    /**
     * Changes the glyphicon for the Button in Table Mode if a modification exists
     * @param {String} tpl initial template
     * @return {String} template with possile modified glyphicon
     */
    modifyTableTemplate: function (tpl) {
        var result,
            button,
            config = Radio.request("Parser", "getItemByAttributes", {id: "totalview"});

        button = _.isUndefined(config) === false ? config.attr.tableGlyphicon : config;

        if (!button) {
            result = tpl;
        }
        else {
            result = tpl.replace(/icon-home/g, button);
        }
        return result;
    }

});

export default TotalViewMapView;
