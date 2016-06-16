define([
    "backbone",
    "text!modules/menu/desktop/folder/thementemplate.html",
    "text!modules/menu/desktop/folder/templateLeaf.html",
    "text!modules/menu/desktop/folder/catalogTemplate.html"
], function () {

    var Backbone = require("backbone"),
        FolderTemplate = require("text!modules/menu/desktop/folder/thementemplate.html"),
        FolderView;

    FolderView = Backbone.View.extend({
        tagName: "li",
        className: "themen-folder",
        id: "",
        template: _.template(FolderTemplate),
        events: {
            "click": "toggleIsExpanded",
            "click .selectall": "toggleIsSelected"
        },
        initialize: function () {
            // Verhindert, dass sich der Themenbaum wg Bootstrap schließt
            this.$el.on({
                click: function (e) {
                   e.stopPropagation();
                }
            });
            this.render();
        },
        render: function () {
            this.$el.html("");

            if (this.model.getIsVisibleInTree()) {
                // due Ordner auf unterster ebene bekommen eine SelectAllLayer Checkbox
                if (this.model.getIsLeafFolder()) {
                    if (this.model.getIsSelected()) {
                        this.model.setSelectAllGlyphicon("glyphicon-check");
                    }
                    else {
                        this.model.setSelectAllGlyphicon("glyphicon-unchecked");
                    }
                }
                if (this.model.getIsExpanded()) {
                    this.model.setGlyphicon("glyphicon-minus-sign");
                }
                else {
                    this.model.setGlyphicon("glyphicon-plus-sign");
                }

                this.$el.attr("id", this.model.getId());

                var selector = "";

                if (this.model.getParentId() === "Baselayer") {
                    selector = "#Baselayer";
                }
                else {
                   selector = "#Overlayer";
                }
                var attr = this.model.toJSON();

                if (this.model.getLevel() > 0) {
                    $("#" + this.model.getParentId()).after(this.$el.html(this.template(attr)));
                }
                else {
                    $(selector).prepend(this.$el.html(this.template(attr)));
                }
                $(this.$el).css("padding-left", (this.model.getLevel()+1) * 15 + "px");
            }

        },
        updateList: function () {
            if (this.model.getIsLeafFolder() === true) {
                this.model.setIsExpanded(true);
            }
            this.model.updateList(this.model.getId());
        },
        toggleIsExpanded: function () {
            this.model.toggleIsExpanded();
        },
        toggleIsSelected: function () {
            this.model.toggleIsSelected();
        }
    });

    return FolderView;
});
