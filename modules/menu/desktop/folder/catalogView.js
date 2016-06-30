define([
    "backbone",
    "backbone.radio",
    "text!modules/menu/desktop/folder/catalogTemplate.html"
], function () {

    var Backbone = require("backbone"),
        Template = require("text!modules/menu/desktop/folder/catalogTemplate.html"),
        Radio = require("backbone.radio"),
        FolderView = Backbone.View.extend({
            tagName: "li",
            className: "layer-catalog",
            template: _.template(Template),
            events: {
                "click .header > .glyphicon, .header > .control-label": "toggleCatalogs",
                "click .Baselayer .catalog_buttons .glyphicon-question-sign": function () {
                    Radio.trigger("Quickhelp", "showWindowHelp", "tree");
                },
                "click .rotate-adjust": "greyBackground",
                "click .rotate-adjust-back": "whiteBackground",
                "click .rotate-pin": "unfixTree",
                "click .rotate-pin-back": "fixTree",
                "click .layer-selection-save": function () {
                    Radio.trigger("Window", "toggleWin", ["saveSelection", "Auswahl speichern", "glyphicon-share"]);
                    // Schließt den Baum
                    $(".nav li:first-child").removeClass("open");
                    // Schließt die Mobile Navigation
                    $(".navbar-collapse").removeClass("in");
                    // Selektiert die URL
                    $(".input-save-url").select();
                }
            },
            initialize: function () {
                this.$el.on({
                click: function (e) {
                   e.stopPropagation();
                }});
                this.render();
            },
            render: function () {
                var attr = this.model.toJSON();

                $(".header").toggleClass("closed");
                $("#" + this.model.getParentId()).append(this.$el.html(this.template(attr)));
                if (!this.model.getIsExpanded()) {
                    $("#" + this.model.getId()).css("display", "none");
                }
            },
            toggleCatalogs: function () {
                if (this.model.getIsExpanded()) {
                    this.hideCatalog(this.model);
                    this.toggleGlyphicon(this.model);
                }
                else {
                    var catalogs = Radio.request("ModelList", "getModelsByAttributes", {parentId: "Themen"});

                    this.showCatalog(this.model);
                    _.each(catalogs, function (model) {
                        if (model.getId() !== this.model.getId()) {
                            this.hideCatalog(model);
                        }
                        this.toggleGlyphicon(model);
                    }, this);
                }
            },
            showCatalog: function (model) {
                model.setIsExpanded(true, {silent: true});
                this.$el.find("#" + model.getId()).show(500);
            },
            hideCatalog: function (model) {
                $("ul#" + model.getId()).hide(500);
                model.setIsExpanded(false, {silent: true});
            },
            toggleGlyphicon: function (model) {
                var elem = $("ul#" + model.getId()).prev().find(".glyphicon:first");

                if (!model.getIsExpanded()) {
                   elem.removeClass("glyphicon-minus-sign");
                   elem.addClass("glyphicon-plus-sign");
                }
                else {
                    elem.removeClass("glyphicon-plus-sign");
                   elem.addClass("glyphicon-minus-sign");
                }
            },
            whiteBackground: function () {
                this.model.set("defaultBackground", $("#map").css("background"));
                $("#map").css("background", "white");
                $(".glyphicon-adjust").addClass("rotate-adjust");
                $(".glyphicon-adjust").removeClass("rotate-adjust-back");
            },
            greyBackground: function () {
                $("#map").css("background", this.model.get("defaultBackground"));
                $(".glyphicon-adjust").removeClass("rotate-adjust");
                $(".glyphicon-adjust").addClass("rotate-adjust-back");
            },
            fixTree: function () {
                $("body").on("click", "#map", this.helpForFixing);
                $("body").on("click", "#searchbar", this.helpForFixing);
                $(".glyphicon-pushpin").addClass("rotate-pin");
                $(".glyphicon-pushpin").removeClass("rotate-pin-back");
            },
            unfixTree: function () {
                $("body").off("click", "#map", this.helpForFixing);
                $("body").off("click", "#searchbar", this.helpForFixing);
                $(".glyphicon-pushpin").removeClass("rotate-pin");
                $(".glyphicon-pushpin").addClass("rotate-pin-back");
            },
            helpForFixing: function (evt) {
                evt.stopPropagation();
            }
        });

    return FolderView;
});
