import OverviewMapModel from "./model";
import controlTemplate from "text-loader!./controlTemplate.html";
import tableTemplate from "text-loader!./tableTemplate.html";
/**
 * @member OverviewMapTemplate
 * @description Template used for the OverviewMap
 * @memberof Controls.Overviewmap
 */

/**
 * @member OverviewMapTemplate
 * @description tableTemplate used for the OverviewMap in Table View Tools
 * @memberof Controls.Overviewmap
 */
const OverviewMapView = Backbone.View.extend(/** @lends OverviewMapView.prototype */{
    events: {
        /**
         * used in menu
         */
        "click div#mini-map": "toggle",
        /**
         * used in control
         */
        "click div.overviewmap-button": "toggle"
    },

    /**
     * @class OverviewMapView
     * @memberof Controls.Overviewmap
     * @description View to represent Overviewmap
     * @extends Backbone.View
     * @param {Object} el Jquery element to be rendered into.
     * @param {String} id Id of control.
     * @param {Object} config Attributes of overviewmap.
     * @param {String} config.baseLayer Id of baseLayer
     * @param {String} config.resolution Resolution of baseLayer.
     * @param {Boolean} [config.isInitOpen=true] Flag to open map initially or not
     * @constructs
     */
    initialize: function (el, id, config) {
        const style = Radio.request("Util", "getUiStyle");

        this.model = new OverviewMapModel(Object.assign(config, {id: id}));
        this.render(style, el);
        if (this.model.get("isInitOpen") === true) {
            this.model.showControl();
        }
    },

    id: "overviewmap",
    controlTemplate: _.template(controlTemplate),
    tabletemplate: _.template(tableTemplate),

    /**
     * Render function renders and sets or the control button or the menu item
     * @param {string} style uiStyle to define the UI
     * @param {HTMLElement} control the control UI
     * @returns {OverviewMapView} - Returns itself.
     */
    render: function (style, control) {
        const attr = this.model.toJSON();

        if (style === "TABLE") {
            this.setElement("#table-tools-menu");
            this.$el.append(this.tabletemplate(attr));
        }
        else {
            this.setElement(control);
            this.$el.html(this.controlTemplate(attr));
        }

        return this;
    },

    /**
     * Toggles the title of the DOM element
     * @returns {void}
     */
    toggle: function () {
        this.toggleControl(this.model.get("isOpen"));

        if (this.$(".overviewmap-button > .glyphicon-globe").attr("title") === "Übersichtskarte ausblenden") {
            this.$(".overviewmap-button > .glyphicon-globe").attr("title", "Übersichtskarte einblenden");
        }
        else if (this.$(".overviewmap-button > .glyphicon-globe").attr("title") === "Übersichtskarte einblenden") {
            this.$(".overviewmap-button > .glyphicon-globe").attr("title", "Übersichtskarte ausblenden");
        }
        else if (document.getElementById("mini-map_title").innerText === "Mini-Map ausschalten") {
            document.getElementById("mini-map_title").innerText = "Mini-Map einschalten";
        }
        else if (document.getElementById("mini-map_title").innerText === "Mini-Map einschalten") {
            document.getElementById("mini-map_title").innerText = "Mini-Map ausschalten";
        }
    },

    /**
     * Toggles the mapControl on or off
     * @param   {Boolean} state old state
     * @returns {void}
     */
    toggleControl: function (state) {
        if (state === true) {
            this.model.removeControl();
        }
        else {
            this.model.showControl();
        }
    }
});

export default OverviewMapView;
