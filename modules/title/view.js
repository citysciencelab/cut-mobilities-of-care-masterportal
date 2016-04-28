define([
    "underscore",
    "backbone",
    "text!modules/title/template.html",
    "config",
    "modules/core/util"
], function (_, Backbone, TitleTemplate, Config, Util) {

    var TitleView = Backbone.View.extend({
        className: "visible-lg-block portal-title",
        template: _.template(TitleTemplate),
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(this.template( {
                title: Config.title,
                util: Util,
                logo: Config.logo || "../img/hh-logo.png",
                logoLink: Config.logoLink || "http://geoinfo.hamburg.de",
                logoTooltip: Config.logoTooltip || "Landesbetrieb Geoinformation und Vermessung"
            } ));
            $(".navbar-collapse").append(this.$el);
        }
    });
    return TitleView;
});
