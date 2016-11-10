define([
    "backbone",
    "text!modules/title/template.html",
    "backbone.radio"
], function (Backbone, TitleTemplate, Radio) {

    var TitleView = Backbone.View.extend({
        className: "visible-lg-block portal-title",
        template: _.template(TitleTemplate),
        initialize: function (title) {
            this.setLogo();
            this.render(title);
        },
        render: function (portalTitle) {
            this.$el.html(this.template({
                title: portalTitle,
                logo: Radio.request("Util", "getPath", this.getLogo()),
                logoLink: Radio.request("Parser", "getPortalConfig").LogoLink || "http://geoinfo.hamburg.de",
                logoTooltip: Radio.request("Parser", "getPortalConfig").LogoToolTip || "Landesbetrieb Geoinformation und Vermessung"
            }));
            $(".navbar-collapse").append(this.$el);
        },
        setLogo: function () {
            var logo = Radio.request("Parser", "getPortalConfig").PortalLogo,
                result = "";

            if (logo === "none") {
               result = null;
            }
            else if (_.isUndefined(logo)) {
                result = "../img/hh-logo.png";
            }
            else {
                result = logo;
            }
            this.logo = result;
        },

        getLogo: function () {
            return this.logo;
        }
    });

    return TitleView;
});
