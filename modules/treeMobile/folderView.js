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
            "click .folder-item": "changeMenuById"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isVisible": this.render
            });
        },
        render: function () {
            if (this.model.getIsVisible() === true && this.model.getIsSelected() === true) {
                var attr = this.model.toJSON();

                $(this.model.get("targetElement")).append(this.$el.html(this.templateLeaf(attr)));
                this.delegateEvents(this.events);
            }
            else if (this.model.getIsVisible() === true) {
                var attr = this.model.toJSON();

                $(this.model.get("targetElement")).append(this.$el.html(this.template(attr)));
                this.delegateEvents(this.events);
            }
            else {
                this.$el.remove();
            }
        },
        changeMenuById: function () {
            this.model.setIsSelected(true);
            this.model.changeMenuById(this.model.getId());
        }
    });

    return FolderView;
});
