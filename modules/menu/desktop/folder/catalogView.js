define([
    "backbone",
    "text!modules/menu/desktop/folder/template.html",
    "text!modules/menu/desktop/folder/templateLeaf.html",
    "text!modules/menu/desktop/folder/catalogTemplate.html"
], function () {

    var Backbone = require("backbone"),
        Template = require("text!modules/menu/desktop/folder/catalogTemplate.html"),
        FolderView = Backbone.View.extend({
            tagName: "li",
            className: "layer-catalog",
            template: _.template(Template),
            events: {
             "click .header": "toggleCatalogAndBaseLayer"
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

                $("#" + this.model.getParentId()).append(this.$el.html(this.template(attr)));
            },
            toggleCatalogAndBaseLayer: function () {
              this.toggleOverlayer();
              this.toggleBaseLayer();
              this.toggleCatalog();
            },
            toggleBaseLayer: function () {
                $("ul#Baselayer").toggle("slow");
            },
            toggleOverlayer: function () {
                $("ul#Overlayer").toggle("slow");
            },
            toggleCatalog: function () {
                $(".layer-catalog > .header > .glyphicon:not(.glyphicon-adjust)").toggleClass("glyphicon-minus-sign");
                $(".layer-catalog > .header > .glyphicon:not(.glyphicon-adjust)").toggleClass("glyphicon-plus-sign");
            }
        });

    return FolderView;
});
