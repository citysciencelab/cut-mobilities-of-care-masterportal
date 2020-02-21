const TotalViewMapView = Backbone.View.extend(/** @lends TotalViewMapView.prototype */{
    events: {
        "click div#start-totalview": "setTotalView"
    },
    /**
     * @class TotalViewMapView
     * @extends Backbone.View
     * @memberof Controls.TotalView
     * @constructs
     * @param {String} id Id of control.
     * @fires Util#RadioRequestUtilGetUiStyle
     * @fires Controls#RadioRequestControlsViewAddRowTr
     * @fires MapView#RadioTriggerMapViewResetView
     * @listens Menu#RadioTriggerMenuLoaderReady
     */
    initialize: function (id) {
        const style = Radio.request("Util", "getUiStyle");
        let element = null;

        this.id = id;
        if (style === "DEFAULT") {
            // element = Radio.request("ControlsView", "addRowTR", "totalview");
            element = Radio.request("ControlsView", "addRowTR", id);
            this.setElement(element[0]);
            this.listenTo(Radio.channel("i18next"), {
                "languageChanged": this.render
            });
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
            this.listenTo(Radio.channel("i18next"), {
                "languageChanged": this.renderToToolbar
            });
            // Hier unschön gehackt, da in gebauter Version der MenuLoader schon fertig ist und sein ready lange gesendet hat
            // bis hier der Listener enabled wird. Muss noch mal generell überarbeitet werden ToDo! Christa Becker 05.06.2018
            this.setElement("#table-tools-menu");
            this.renderToToolbar();
        }
    },

    /**
     * Render-Function
     * @returns {TotalViewMapView} TotalViewMapView
     */
    render: function () {
        const title = i18next.t("common:modules.controls.totalView.titleButton"),
            template = this.modifyTemplate("<div class='total-view-button' id='start-totalview'><span class='glyphicon glyphicon-fast-backward' title='" + title + "'></span></div>", false);

        this.$el.html(_.template(template));

        return this;
    },
    /**
     * Renders the table template
     * @returns {void}
     */
    renderToToolbar: function () {
        const title = i18next.t("common:modules.controls.totalView.titleMenu"),
            tableTemplate = this.modifyTemplate("<div class='total-view-menuelement' id='start-totalview'><span class='glyphicon icon-home'></span></br>" + title + "</div>", true);

        $("#start-totalview").remove();
        this.$el.prepend(_.template(tableTemplate));
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
        const config = Radio.request("Parser", "getItemByAttributes", {id: this.id});
        let result = null;

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
