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
            element,
            template,
            tableTemplate;

        template = this.modifyTemplate("<div class='total-view-button' id='start-totalview'><span class='glyphicon glyphicon-fast-backward' title='Zurück zur Startansicht'></span></div>", false);
        tableTemplate = this.modifyTemplate("<div class='total-view-menuelement' id='start-totalview'><span class='glyphicon icon-home'></span></br>Hauptansicht</div>", true);
        this.template = _.template(template);
        this.tableTemplate = _.template(tableTemplate);

        if (style === "DEFAULT") {
            element = Radio.request("ControlsView", "addRowTR", "totalview");
            this.setElement(element[0]);
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
     * @param {Boolean} isMobile if true changes the glyphicon in Table Mode
     * @return {String} template with possile modified glyphicon
     */
    modifyTemplate: function (tpl, isMobile) {
        var result,
            config = Radio.request("Parser", "getItemByAttributes", {id: "totalview"});

        if (config.attr === true) {
            result = tpl;
        }
        else if (isMobile) {
            result = tpl.replace(/icon-home/g, config.attr.tableGlyphicon);
        }
        else {
            result = tpl.replace(/glyphicon-fast-backward/g, config.attr.glyphicon);
        }
        return result;
    }
});

export default TotalViewMapView;
