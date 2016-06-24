define([
    "backbone",
    "text!modules/menu/mobile/folder/template.html",
    "text!modules/menu/mobile/folder/templateLeaf.html",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        FolderTemplate = require("text!modules/menu/mobile/folder/template.html"),
        FolderLeafTemplate = require("text!modules/menu/mobile/folder/templateLeaf.html"),
        Radio = require("backbone.radio"),
        FolderView;

    FolderView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(FolderTemplate),
        templateLeaf: _.template(FolderLeafTemplate),
        events: {
            "click .folder-item": "updateList",
            "click .checked-all-item": "toggleIsSelected"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isSelected": this.render
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
        toggleIsSelected: function () {
            this.model.toggleIsSelected();
            Radio.trigger("ModelList", "toggleIsSelectedChildLayers", this.model);
            this.model.setIsExpanded(true);
        }
    });

    return FolderView;
});
