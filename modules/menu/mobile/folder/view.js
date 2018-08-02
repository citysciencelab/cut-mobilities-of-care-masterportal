define(function (require) {

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
            "click .folder-item": "expand",
            "click .checked-all-item": "toggleIsSelected"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSelected": this.render,
                "change:isVisibleInTree": this.removeIfNotVisible
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isExpanded") === true && this.model.get("parentId") !== "tree") {
                this.$el.html(this.templateLeaf(attr));
            }
            else {
                this.$el.html(this.template(attr));
            }
            return this;
        },
        expand: function () {
            this.model.setIsExpanded(true);
        },
        toggleIsSelected: function () {
            this.model.toggleIsSelected();
            Radio.trigger("ModelList", "setIsSelectedOnChildLayers", this.model);
            this.model.setIsExpanded(true);
        },
        removeIfNotVisible: function () {
            if (!this.model.get("isVisibleInTree")) {
                this.remove();
            }
        }
    });

    return FolderView;
});
