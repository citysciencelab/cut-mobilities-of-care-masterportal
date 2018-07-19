define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        TitleModel;

    TitleModel = Backbone.Model.extend({
        defaults: {
            // Abwärtskompatibilität muss beachtet werden
            title: Radio.request("Parser", "getPortalConfig").PortalTitle || "Master",
            logo: Radio.request("Parser", "getPortalConfig").PortalLogo || "",
            link: Radio.request("Parser", "getPortalConfig").LogoLink || "http://geoinfo.hamburg.de",
            tooltip: Radio.request("Parser", "getPortalConfig").LogoToolTip || "Landesbetrieb Geoinformation und Vermessung"
        },
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
                if (portalTitle.tooltip) {
                    this.setTooltip(portalTitle.tooltip);
                }
            }
        },

        // setter for title
        setTitle: function (value) {
            this.set("title", value);
        },

        // setter for logo
        setLogo: function (value) {
            this.set("logo", value);
        },

        // setter for link
        setLink: function (value) {
            this.set("link", value);
        },

        // setter for tooltip
        setTooltip: function (value) {
            this.set("tooltip", value);
        }
    });

    return new TitleModel();
});
