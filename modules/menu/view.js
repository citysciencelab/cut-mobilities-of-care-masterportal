define([
    "backbone",
    "backbone.radio",
    "text!modules/menu/template.html",
    "text!modules/menu/desktop/template.html",
    "text!modules/menu/desktop/templateLight.html",
    "text!modules/menu/mobile/template.html"
], function () {
    var Backbone = require("backbone"),
    Radio = require("backbone.radio"),
    MenuTemplate = require("text!modules/menu/template.html"),
    DesktopComplexTemplate = require("text!modules/menu/desktop/template.html"),
    DesktopLightTemplate = require("text!modules/menu/desktop/templateLight.html"),
    MobileTemplate = require("text!modules/menu/mobile/template.html"),
    Menu = Backbone.View.extend({
        tagName: "nav",
        className: "navbar navbar-default navbar-fixed-top",
        attributes: {role: "navigation"},
        template: _.template(MenuTemplate),
        desktopComplexTemplate: _.template(DesktopComplexTemplate),
        desktopLightTemplate: _.template(DesktopLightTemplate),
        mobileTemplate: _.template(MobileTemplate),
        initialize: function () {
            var channel = Radio.channel("Menu");

            this.render();
        },
        render: function () {
            $("body").append(this.$el.append(this.template));

            var isMobile = Radio.request("Util", "isViewMobile");

            if (isMobile) {
                //Mobile
                $("body").append(this.$el.append(this.mobileTemplate()));
            }
            else {
                var treeType = Radio.request("Parser", "getPortalConfig").Baumtyp;

                if (treeType === "light") {
                    //Use light Template
                    $("body").append(this.$el.append(this.desktopLightTemplate()));
                }
                else {
                    //Use complex Template
                    $("body").append(this.$el.append(this.desktopComplexTemplate()));
                }
            }
            Radio.trigger("MenuBar", "switchedMenu");
        }
    });

    return Menu;
});
