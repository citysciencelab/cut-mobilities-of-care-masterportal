define([
    "backbone",
    "text!modules/menu/desktop/folder/thementemplate.html",
    "text!modules/menu/desktop/folder/templateLeaf.html",
    "text!modules/menu/desktop/folder/catalogTemplate.html"
], function () {

    var Backbone = require("backbone"),
        FolderTemplate = require("text!modules/menu/desktop/folder/thementemplate.html"),
        CatalogTemplate = require("text!modules/menu/desktop/folder/catalogTemplate.html"),
        FolderLeafTemplate = require("text!modules/menu/desktop/folder/templateLeaf.html"),
        FolderView;

    FolderView = Backbone.View.extend({
        tagName: "li",
        className: "",
        id: "",
        template: _.template(FolderTemplate),
        catalogTemplate: _.template(CatalogTemplate),
        templateLeaf: _.template(FolderLeafTemplate),
        events: {
             "click .layer-catalog .control-label, .layer-catalog > .header > .glyphicon ": "toggleCatalogAndBaseLayer"
        },
        initialize: function () {
            this.render();
            // Verhindert, dass sich der Themenbaum wg Bootstrap schließt
            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.attr("id", this.model.getId());
            if (this.model.getParentId() === "themen") {
                $("#" + this.model.getParentId()).append(this.$el.html(this.catalogTemplate(attr)));
            }
            else {
                var selector = "";

                if (this.model.getParentId() === "Baselayer") {
                    selector = "#Baselayer";
                }
                else {
                   selector = "#Overlayer";
                }

                if (this.model.getLevel() > 0) {
                    $("#" + this.model.getParentId()).after(this.$el.html(this.template(attr)));
                }
                else {
                    $(selector).after(this.$el.html(this.template(attr)));
                }
                $(this.$el).css("padding-left", this.model.getLevel() * 10 + "px");
                console.log(this.model.getLevel());
            }
        },
        updateList: function () {
            if (this.model.getIsLeafFolder() === true) {
                this.model.setIsExpanded(true);
            }
            this.model.updateList(this.model.getId());
        },
        toggleIsChecked: function () {
            this.model.toggleIsChecked();
        },
        toggleCatalogAndBaseLayer: function () {
              this.toggleOverlayer();
              this.toggleBaseLayer();
        },
        toggleBaseLayer: function () {
            $("#Baselayer").toggle("slow");
        },
        toggleOverlayer: function () {
            $("#Overlayer").toggle("slow");
        }
    });

    return FolderView;
});
