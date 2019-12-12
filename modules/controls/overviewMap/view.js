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
     * @listens Map#RadioTriggerMapChange
     */
    initialize: function (el, id, config) {
        const style = Radio.request("Util", "getUiStyle");

        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                this.toggleSupportedVisibility(mode);
            }
        });

        this.model = new OverviewMapModel(Object.assign(config, {id: id}));
        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;
                if (changed.showOverviewControlText || changed.hideOverviewControlText || changed.showOverviewTableText || changed.hideOverviewTableText) {
                    this.render(style, el);
                }
            }
        });

        if (style === "DEFAULT") {
            this.render(style, el);
        }
        else if (style === "TABLE") {
            this.render(style, el);

            // important: call once on init after render
            this.$el.attr("class", "");
            this.$el.attr("id", "overviewmapForTable");
            $("#table-tools-menu").append(this.$el);
        }

        if (this.model.get("isInitOpen") === true) {
            this.model.showControl();
        }
        this.toggleSupportedVisibility(Radio.request("Map", "getMapMode"));
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
            this.$el.html(this.tabletemplate(attr));
        }
        else {
            // mapControl and isOpen have to be set correctly for control (not table) to have the right status for changing languages
            this.model.set({
                mapControl: undefined,
                isOpen: false
            });
            this.setElement(control);
            this.$el.html(this.controlTemplate(attr));
        }

        return this;
    },

    /**
     * Toggles the title of the DOM element
     * @returns {Void}  -
     */
    toggle: function () {
        const isOpen = this.model.get("isOpen");

        this.toggleControl(isOpen);

        if (isOpen) {
            if (this.$(".overviewmap-button > .glyphicon-globe")) {
                this.$(".overviewmap-button > .glyphicon-globe").attr("title", i18next.t("common:modules.controls.overviewMap.showOverviewControl"));
            }
            if (document.getElementById("mini-map_title")) {
                document.getElementById("mini-map_title").innerText = i18next.t("common:modules.controls.overviewMap.showOverviewTable");
            }
        }
        else {
            if (this.$(".overviewmap-button > .glyphicon-globe")) {
                this.$(".overviewmap-button > .glyphicon-globe").attr("title", i18next.t("common:modules.controls.overviewMap.hideOverviewControl"));
            }
            if (document.getElementById("mini-map_title")) {
                document.getElementById("mini-map_title").innerText = i18next.t("common:modules.controls.overviewMap.hideOverviewTable");
            }
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
    },

    /**
     * Toggles the visibility of the mini map and the control to start/stop the map
     * depending on the map-state (3d, 2d or oblique).
     * @param {String} mode Flag of the view mode
     * @returns {void}
     */
    toggleSupportedVisibility: function (mode) {
        const showIn3D = this.model.get("supportedIn3d");

        if ((mode === "3D" || mode === "Oblique") && !showIn3D) {
            if (this.model.get("isOpen")) {
                this.toggle();
            }
            // overviewmap-button on desktop and mini-map in table mode
            this.$(".overviewmap-button").hide();
            $("#mini-map").hide();
        }
        else {
            // overviewmap-button on desktop and mini-map in table mode
            this.$(".overviewmap-button").show();
            $("#mini-map").show();
        }
    }
});

export default OverviewMapView;
