const TitleModel = Backbone.Model.extend(/** @lends TitleModel.prototype */ {
    defaults: {
        title: "Master",
        logo: "",
        link: "https://geoinfo.hamburg.de",
        toolTip: "Landesbetrieb Geoinformation und Vermessung"
    },
    /**
     * @class TitleModel
     * @extends Backbone.Model
     * @memberof Title
     * @constructs
     * @param {String} title="Master" Title of portal.
     * @param {String} logo="" Logo of portal.
     * @param {String} link="https://geoinfo.hamburg.de" Link for click on logo.
     * @param {String} toolTip="Landesbetrieb Geoinformation und Vermessung" Tooltipfor hover over logo.
     */
    initialize: function () {
        var portalTitle = Radio.request("Parser", "getPortalConfig").portalTitle;

        if (portalTitle) {
            if (portalTitle.title) {
                this.setTitle(portalTitle.title);
            }
            if (portalTitle.logo) {
                this.setLogo(portalTitle.logo);
            }
            if (portalTitle.link) {
                this.setLink(portalTitle.link);
            }
            /**
             * tooltip
             * @deprecated in 3.0.0
             */
            if (portalTitle.tooltip) {
                this.setToolTip(portalTitle.tooltip);
            }
            if (portalTitle.toolTip) {
                this.setToolTip(portalTitle.toolTip);
            }
        }
    },

    /**
     * Setter for attribute "title".
     * @param {String} value Title of portal.
     * @returns {void}
     */
    setTitle: function (value) {
        this.set("title", value);
    },

    /**
     * Setter for attribute "logo".
     * @param {String} value Path to logo.
     * @returns {void}
     */
    setLogo: function (value) {
        this.set("logo", value);
    },

    /**
     * Setter for attribute "link".
     * @param {String} value Link on click on portal logo.
     * @returns {void}
     */
    setLink: function (value) {
        this.set("link", value);
    },

    /**
     * Setter for attribute "toolTip".
     * @param {String} value Tooltip on hover over portal logo.
     * @returns {void}
     */
    setToolTip: function (value) {
        this.set("toolTip", value);
    }
});

export default TitleModel;
