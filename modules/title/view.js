define([
    "backbone",
    "text!modules/title/template.html",
    "config",
    "modules/core/util",
    "backbone.radio"
], function (Backbone, TitleTemplate, Config, Util, Radio) {

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
                logo: this.getLogo(),
                logoLink: Config.logoLink || "http://geoinfo.hamburg.de",
                logoTooltip: Config.logoTooltip || "Landesbetrieb Geoinformation und Vermessung"
            } ));
            $(".navbar-collapse").append(this.$el);
        },
        
        getLogo: function(){
            if(Config.logo === "none"){
               return null;
            }
            else if (_.isUndefined(Config.logo)){
                return "../img/hh-logo.png";
            }
            else{
               return Config.logo;
            }
        }
    });
    return TitleView;
});
