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
     * @param {String} toolTip="Landesbetrieb Geoinformation und Vermessung" Tooltip for hover over logo.
     */
    initialize: function () {
        const portalTitle = Radio.request("Parser", "getPortalConfig").portalTitle,
            /**
             * legacyTitle
             * @deprecated in 3.0.0
             */
            legacyTitle = Radio.request("Parser", "getPortalConfig").PortalTitle,
            /**
             * portalLogo
             * @deprecated in 3.0.0
             */
            portalLogo = Radio.request("Parser", "getPortalConfig").PortalLogo,
            /**
             * logoLink
             * @deprecated in 3.0.0
             */
            logoLink = Radio.request("Parser", "getPortalConfig").LogoLink,
            /**
             * logoToolTip
             * @deprecated in 3.0.0
             */
            logoToolTip = Radio.request("Parser", "getPortalConfig").LogoToolTip;

        /**
         * legacyTitle
         * @deprecated in 3.0.0
         */
        if (legacyTitle !== undefined) {
            this.setTitle(legacyTitle);
        }
        /**
         * portalLogo
         * @deprecated in 3.0.0
         */
        if (portalLogo !== undefined) {
            this.setLogo(portalLogo);
            console.warn("Attribute 'PortalLogo' is deprecated. Please use Object 'portalTitle' and the attribute 'title' instead.");
        }
        /**
         * logoLink
         * @deprecated in 3.0.0
         */
        if (logoLink !== undefined) {
            this.setLink(logoLink);
            console.warn("Attribute 'LogoLink' is deprecated. Please use Object 'portalTitle' and the attribute 'link' instead.");
        }
        /**
         * LogoToolTip
         * @deprecated in 3.0.0
         */
        if (logoToolTip !== undefined) {
            this.setToolTip(logoToolTip);
            console.warn("Attribute 'LogoToolTip' is deprecated. Please use Object 'portalTitle' and the attribute 'toolTip' instead.");
        }

        if (portalTitle) {
            if (portalTitle.title || portalTitle.title.trim() === "") {
                this.setTitle(portalTitle.title.trim());
            }
            if (portalTitle.logo && portalTitle.logo.trim() !== "") {
                this.setLogo(portalTitle.logo.trim());
                // link and tooltip are only useful if logo is available
                if (portalTitle.link && portalTitle.link.trim() !== "") {
                    this.setLink(portalTitle.link);
                }
                else {
                    this.setLink("");
                }
                /**
                 * tooltip
                 * @deprecated in 3.0.0
                 */
                if (portalTitle.tooltip !== undefined) {
                    console.warn("Attribute 'tooltip' is deprecated. Please use 'toolTip' instead.");
                    this.setToolTip(portalTitle.tooltip);
                }
                if (portalTitle.toolTip) {
                    this.setToolTip(portalTitle.toolTip);
                }
            }
            else {
                this.setLink("");
                this.setToolTip("");
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
