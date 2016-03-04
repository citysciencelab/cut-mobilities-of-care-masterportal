define([
    "backbone",
    "config",
    "backbone.radio",
    "bootstrap/dropdown",
    "bootstrap/collapse"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        Menubar;

    Menubar = Backbone.Model.extend({
        defaults: {
            // true wenn Fensterbreite < 768px
            isMobile: false,
            // true wenn nur ein Tool konfiguriert ist
            onlyOneTool: false,
            // Baumtyp - default/custom/light
            treeType: "",
            // true wenn die Menubar sichtbar ist
            isVisible: true
        },
        initialize: function () {
            var channel = Radio.channel("MenuBar");

            channel.reply({
                "isMobile": this.getIsMobile
            }, this);

            channel.on({
                "setVisible": this.setIsVisible
            }, this),

            $(window).on("resize", _.bind(this.setIsMobile, this));

            _.each(Config.menu, this.setAttributes, this);
            // Wenn nur ein Tool aktiviert ist, wird der Menüeintrag Werkzeuge nicht erzeugt. --> Abfrage im template
            if (_.toArray(Config.tools).length === 1) {
                this.set("oneTool", true);
            }
            else {
                this.set("oneTool", false);
            }

            this.setIsMobile();
            this.setTreeType(Config.tree.type);
        },
        setAttributes: function (value, key) {
            this.set(key, value);
        },
        setIsMobile: function () {
            if ($(window).width() >= 768) {
                this.set("isMobile", false);
            }
            else {
                this.set("isMobile", true);
            }
        },
        getIsMobile: function () {
            return this.get("isMobile");
        },
        setTreeType: function (value) {
            this.set("treeType", value);
        },
        getTreeType: function () {
            return this.get("treeType");
        },
        setIsVisible: function (value) {
            this.set("isVisible", value);
        },
        getIsVisible: function () {
            return this.get("isVisible");
        }
    });

    return Menubar;
});
