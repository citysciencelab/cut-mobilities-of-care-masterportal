define([
    "backbone",
    "backbone.radio",
    "text!modules/menu/desktop/folder/template.html",
    "text!modules/menu/desktop/folder/templateLeaf.html",
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
             "click .header": "toggleCatalogs"
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
                var elem =  $("ul#" + model.getId()).prev().find(".glyphicon:first");

                if (!model.getIsExpanded()) {
                   elem.removeClass("glyphicon-minus-sign");
                   elem.addClass("glyphicon-plus-sign");
                }
                else {
                    elem.removeClass("glyphicon-plus-sign");
                   elem.addClass("glyphicon-minus-sign");
                }
            }
        });

    return FolderView;
});
