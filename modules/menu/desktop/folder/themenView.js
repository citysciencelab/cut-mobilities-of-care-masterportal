define([
    "backbone",
    "text!modules/menu/desktop/folder/thementemplate.html",
    "text!modules/menu/desktop/folder/templateLeaf.html",
    "text!modules/menu/desktop/folder/catalogTemplate.html"
], function () {

    var Backbone = require("backbone"),
        FolderTemplate = require("text!modules/menu/desktop/folder/thementemplate.html"),
        FolderLeafTemplate = require("text!modules/menu/desktop/folder/templateLeaf.html"),
        FolderView;

    FolderView = Backbone.View.extend({
        tagName: "li",
        className: "",
        id: "",
        template: _.template(FolderTemplate),
        templateLeaf: _.template(FolderLeafTemplate),
        events: {
            "click": "toggleIsExpanded"
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

            var attr = this.model.toJSON();

            if (this.model.isVisibleInTree || this.model.getLevel() === 0) {

                this.$el.attr("id", this.model.getId());

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
                    $(selector).prepend(this.$el.html(this.template(attr)));
                }
                $(this.$el).css("padding-left", this.model.getLevel() * 10 + "px");
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
        }
    });

    return FolderView;
});
