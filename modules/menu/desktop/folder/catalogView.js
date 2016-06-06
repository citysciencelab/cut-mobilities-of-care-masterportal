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
             "click .control-label, .glyphicon ": "toggleCatalogAndBaseLayer"
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
            },
            toggleBaseLayer: function () {
                $("ul#Baselayer").toggle("slow");
            },
            toggleOverlayer: function () {
                $("ul#Overlayer").toggle("slow");
            }
        });

    return FolderView;
});
