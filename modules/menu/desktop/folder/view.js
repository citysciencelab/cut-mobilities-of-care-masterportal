define([
    "backbone",
    "text!modules/menu/desktop/folder/template.html",
    "text!modules/menu/desktop/folder/templateLeaf.html"
], function () {

    var Backbone = require("backbone"),
        FolderTemplate = require("text!modules/menu/desktop/folder/template.html"),
        FolderLeafTemplate = require("text!modules/menu/desktop/folder/templateLeaf.html"),
        FolderView;

    FolderView = Backbone.View.extend({
        tagName: "li",
        className: "dropdown dropdown-folder",
        template: _.template(FolderTemplate),
        templateLeaf: _.template(FolderLeafTemplate),
        events: {
            "click .folder-item": ""
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#" + this.model.getParentId()).append(this.$el.html(this.template(attr)));

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
