const TitleModel = Backbone.Model.extend({
    defaults: {
        // Abwärtskompatibilität muss beachtet werden
        title: "Master",
        logo: "",
        link: "http://geoinfo.hamburg.de",
        tooltip: "Landesbetrieb Geoinformation und Vermessung"
    },
    initialize: function () {
        var portalTitle = Radio.request("Parser", "getPortalConfig").portalTitle,
            legacyTitle = Radio.request("Parser", "getPortalConfig").PortalTitle;

        if (legacyTitle) {
            this.setTitle(legacyTitle);
            if (legacyTitle.PortalLogo) {
                this.setLogo(legacyTitle.PortalLogo);
            }
            if (legacyTitle.LogoLink) {
                this.setLink(legacyTitle.LogoLink);
            }
            if (legacyTitle.LogoToolTip) {
                this.setTooltip(legacyTitle.LogoToolTip);
            }
        }

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

export default TitleModel;
