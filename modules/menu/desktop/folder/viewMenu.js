define([
    "backbone",
    "text!modules/menu/desktop/folder/templateMenu.html"
], function () {

    var Backbone = require("backbone"),
        Template = require("text!modules/menu/desktop/folder/templateMenu.html"),
        FolderView;

    FolderView = Backbone.View.extend({
        tagName: "li",
        className: "dropdown dropdown-folder",
        template: _.template(Template),
        // events: {
        //     "click .folder-item": ""
        // },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));

        }
        // toggleIsChecked: function () {
        //     this.model.toggleIsChecked();
        // }
    });

    return FolderView;
});
