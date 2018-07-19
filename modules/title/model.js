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

        // getter for title
        getTitle: function () {
            return this.get("title");
        },
        // setter for title
        setTitle: function (value) {
            this.set("title", value);
        },

        // getter for logo
        getLogo: function () {
            return this.get("logo");
        },
        // setter for logo
        setLogo: function (value) {
            this.set("logo", value);
        },

        // getter for link
        getLink: function () {
            return this.get("link");
        },
        // setter for link
        setLink: function (value) {
            this.set("link", value);
        },

        // getter for tooltip
        getTooltip: function () {
            return this.get("tooltip");
        },
        // setter for tooltip
        setTooltip: function (value) {
            this.set("tooltip", value);
        }
    });

    return TitleModel;
});
