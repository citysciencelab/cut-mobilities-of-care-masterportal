define([
    "backbone",
    "text!modules/treeMobile/templateFolder.html",
    "text!modules/treeMobile/templateFolderLeaf.html"
], function () {

    var Backbone = require("backbone"),
        FolderTemplate = require("text!modules/treeMobile/templateFolder.html"),
        FolderLeafTemplate = require("text!modules/treeMobile/templateFolderLeaf.html"),
        FolderView;

    FolderView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(FolderTemplate),
        templateLeaf: _.template(FolderLeafTemplate),
        events: {
            "click .folder-item": "updateList",
            "click .checked-all-item": "toggleIsChecked"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isChecked": this.render
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.getIsExpanded() === true) {
                this.$el.html(this.templateLeaf(attr));
            }
            else {
                this.$el.html(this.template(attr));
            }
            return this;
        },
        updateList: function () {
            if (this.model.getIsLeafFolder() === true) {
                this.model.setIsExpanded(true);
            }
            this.model.updateList(this.model.getId());
        },
        toggleIsChecked: function () {
            this.model.toggleIsChecked();
        }
    });

    return FolderView;
});
