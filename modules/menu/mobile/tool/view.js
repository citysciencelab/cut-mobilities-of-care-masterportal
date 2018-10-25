import ItemTemplate from "text-loader!./template.html";

const ItemView = Backbone.View.extend({
    events: {
        "click": "checkItem"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isVisibleInTree": this.removeIfNotVisible
        });
    },
    tagName: "li",
    className: "list-group-item",
    template: _.template(ItemTemplate),
    render: function () {
        var attr = this.model.toJSON();

        if (this.model.get("isVisibleInMenu") !== false) {
            this.$el.html(this.template(attr));
        }
        return this;
    },
    checkItem: function () {
        this.model.setIsActive(true);
        // Navigation wird geschlossen
        $("div.collapse.navbar-collapse").removeClass("in");
    },
    removeIfNotVisible: function () {
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
    },
    toggleSupportedVisibility: function (mode) {
        if (mode === "2D") {
            this.$el.show();
        }
        else if (mode === "3D" && this.model.get("supportedIn3d").indexOf(this.model.getId()) >= 0) {
            this.$el.show();
        }
        else if (mode === "Oblique" && this.model.get("supportedInOblique").indexOf(this.model.getId()) >= 0) {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
    }
});

export default ItemView;
