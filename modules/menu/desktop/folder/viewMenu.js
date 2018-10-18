import Template from "text-loader!./templateMenu.html";

const FolderView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },
    tagName: "li",
    className: "dropdown dropdown-folder",
    template: _.template(Template),
    // events: {
    //     "click .folder-item": ""
    // },

    render: function () {
        var attr = this.model.toJSON();

        $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        return this;
    }
    // toggleIsChecked: function () {
    //     this.model.toggleIsChecked();
    // }
});

export default FolderView;
