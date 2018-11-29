import Template from "text-loader!./templateMenu.html";

const FolderView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(Radio.channel("Map"), {
            "change": this.toggleDisplayByMapMode
        });
        this.render();
    },
    tagName: "li",
    className: "dropdown dropdown-folder",
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        return this;
    },

    /**
     * @param {string} mode - "3D" | "2D" | "Oblique"
     * @returns {void}
     */
    toggleDisplayByMapMode: function (mode) {
        if (mode === "Oblique" && _.contains(this.model.get("obliqueModeBlacklist"), this.model.get("id"))) {
            this.$el.hide();
        }
        else {
            this.$el.show();
        }
    }
});

export default FolderView;
