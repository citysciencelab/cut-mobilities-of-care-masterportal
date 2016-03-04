define([
    "text!modules/menubar/template.html",
    "text!modules/menubar/templateDesktop.html",
    "modules/menubar/model",
    "modules/tree/view",
    "modules/treeLight/listView",
    "eventbus"
], function (MenubarTemplate, DesktopMenubarTemplate, Menubar, EventBus) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        MenubarView;

    MenubarView = Backbone.View.extend({
        model: new Menubar(),
        tagName: "nav",
        className: "navbar navbar-default navbar-fixed-top",
        attributes: {role: "navigation"},
        template: _.template(MenubarTemplate),
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
                "change:isMobile": this.renderDesktopMenu
            });

            this.listenTo(EventBus, {
                "appendItemToMenubar": this.appendItemToMenubar
            });

            this.loadTrees();
            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            $("body").append(this.$el.append(this.template(attr)));

            this.renderDesktopMenu();
            // this.loadTrees();
            // Radio.trigger("MenuBar", "switchedMenu");

            if (Config.isMenubarVisible === false) {
                $("#navbarRow").toggle();
            }
            if (_.has(Config, "title") === true) {
                require(["modules/title/view"], function (TitleView) {
                    new TitleView();
                });
            }
        },
        renderDesktopMenu: function () {
            $(".navbar-collapse").empty();

            if (this.model.getIsMobile() === false) {
                var attr = this.model.toJSON();

                $(".navbar-collapse").append(this.templateDesktop(attr));
                Radio.trigger("MenuBar", "switchedMenu");
            }
            else {
                this.renderTreeMobile();
            }
        },
        loadTrees: function () {
            if (this.model.getTreeType() !== "light") {
                var TreeView = require("modules/tree/view");

                new TreeView();
            }
            else {
                var TreeLightView = require("modules/treeLight/listView");

                new TreeLightView();
            }
        },
        renderTreeMobile: function () {
            console.log(54);
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
