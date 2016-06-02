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
             "click .layer-catalog .control-label, .layer-catalog > .header > .glyphicon ": "toggleCatalogAndBaseLayer"
            },
            initialize: function () {
                this.render();
                 this.$el.on({
                click: function (e) {
                   e.stopPropagation();
                }
            });
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
                $("#Overlayer").toggle("slow");
            }
        });

    return FolderView;
});
