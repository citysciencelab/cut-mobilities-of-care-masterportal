define([
    "backbone",
    "backbone.radio",
    "config",
    "text!modules/menubar/templateMobile.html",
    "text!modules/menubar/templateDesktop.html",
    "modules/menubar/model",
    "eventbus"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        MenubarTemplate = require("text!modules/menubar/templateMobile.html"),
        DesktopMenubarTemplate = require("text!modules/menubar/templateDesktop.html"),
        Menubar = require("modules/menubar/model"),
        EventBus = require("eventbus"),
        MenubarView;

    MenubarView = Backbone.View.extend({
        model: new Menubar(),
        tagName: "nav",
        className: "navbar navbar-default navbar-fixed-top",
        attributes: {role: "navigation"},
        templateMobile: _.template(MenubarTemplate),
        templateDesktop: _.template(DesktopMenubarTemplate),
        events: {
            "click .filterTree": "activateFilterTree",
            "click .filterWfsFeature": "activateWfsFilter",
            "click .legend": "activateLegend",
            "click .routingModul": "activateRoutingModul",
            "click .addWMS": "activateAddWMSModul",
            "click .wfsFeatureFilter": "activateWfsFeatureFilter"
        },

        /**
         *
         */
        initialize: function () {
            this.listenTo(this.model, {
                "change:isMobile": this.render,
                "change:isVisible": this.toggle
            });

            this.listenTo(EventBus, {
                "appendItemToMenubar": this.appendItemToMenubar
            });

            this.loadTrees();
            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.empty();
            if (this.model.getIsMobile() === true) {
                $("body").append(this.$el.append(this.templateMobile(attr)));
            }
            else {
                $("body").append(this.$el.append(this.templateDesktop(attr)));
            }
            Radio.trigger("MenuBar", "switchedMenu");

            if (_.has(Config, "title") === true) {
                require(["modules/title/view"], function (TitleView) {
                    new TitleView();
                });
            }
            if (_.has(Config, "simplemap") === true && Config.simplemap === true) {
                $(".navbar").hide();
            }
        },

        toggle: function () {
            if (this.model.getIsVisible() === true) {
                this.$el.show();
            }
            else {
                this.$el.hide();
            }
        },

        loadTrees: function () {
            if (this.model.getTreeType() !== "light") {
                require(["modules/tree/view"], function (TreeView) {
                    new TreeView();
                    require(["modules/treeMobile/listView"], function (TreeMobileView) {
                        new TreeMobileView();
                    });
                });
            }
            else {
                require(["modules/treeLight/listView"], function (TreeLightView) {
                    new TreeLightView();
                    require(["modules/treeMobile/listView"], function (TreeMobileView) {
                        new TreeMobileView();
                    });
                });
            }
        },

        appendItemToMenubar: function (obj) {
            var html = "<li>";

            html += "<a href='#' class='menuitem " + obj.classname + "'>";
            html += "<span class='" + obj.symbol + "'></span>" + obj.title;
            html += "</a>";
            html += "</li>";
            $(".menubarlgv").append(html);
            $("." + obj.classname).on("click", obj.clickFunction);
        },
        activateFilterTree: function () {
            EventBus.trigger("toggleWin", ["treefilter", "Filtereinstellungen", "glyphicon-filter"]);
        },
        activateWfsFilter: function () {
            EventBus.trigger("toggleFilterWfsWin");
        },
        activateLegend: function () {
            EventBus.trigger("toggleLegendWin");
        },
        activateRoutingModul: function () {
            EventBus.trigger("toggleWin", ["routing", "Routenplaner", "glyphicon-road"]);
        },
        activateAddWMSModul: function () {
            EventBus.trigger("toggleWin", ["addwms", "WMS Hinzufügen", "glyphicon-plus"]);
        },
        activateWfsFeatureFilter: function () {
            EventBus.trigger("toggleWin", ["wfsfeaturefilter", "Filter", "glyphicon-filter"]);
        }
    });

    return MenubarView;

});
