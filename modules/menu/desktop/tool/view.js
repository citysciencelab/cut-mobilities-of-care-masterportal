define(function (require) {

    var $ = require("jquery"),
        ItemTemplate = require("text!modules/menu/desktop/tool/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        tagName: "li",
        className: "dropdown",
        template: _.template(ItemTemplate),
        events: {
            "click": "checkItem"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isActive": this.toggleIsActiveClass
            });

            this.listenTo(Radio.channel("Map"), {
                "change": function (mode) {
                    this.toggleSupportedVisibility(mode);
                }
            });

            this.render();
            this.toggleSupportedVisibility(Radio.request("Map", "getMapMode"));
            this.setCssClass();
            this.toggleIsActiveClass();
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isVisibleInMenu") !== false) {
                $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
            }
            return this;
        },

        toggleSupportedVisibility: function (mode) {
            if (mode === "2D") {
                this.$el.show();
            }
            else if (mode === "3D" && this.model.get("supportedIn3d").indexOf(this.model.get("id")) >= 0) {
                this.$el.show();
            }
            else if (mode === "Oblique" && this.model.get("supportedInOblique").indexOf(this.model.get("id")) >= 0) {
                this.$el.show();
            }
            else {
                this.$el.hide();
            }
        },

        /**
         * Abhängig davon ob ein Tool in die Menüleiste oder unter dem Punkt Werkzeuge gezeichnet wird,
         * bekommt die View eine andere CSS-Klasse zugeordent
         * @returns {void}
         */
        setCssClass: function () {
            if (this.model.get("parentId") === "root") {
                this.$el.addClass("menu-style");
                this.$el.find("span").addClass("hidden-sm");
            }
            else {
                this.$el.addClass("submenu-style");
            }
        },

        toggleIsActiveClass: function () {
            if (this.model.get("isActive") === true) {
                this.$el.addClass("active");
            }
            else {
                this.$el.removeClass("active");
            }
        },

        checkItem: function () {
            if (this.model.get("name") === "Legende") {
                this.model.setIsActive(true);
            }
            else {
                this.model.collection.setActiveToolToFalse(this.model);
                this.model.setIsActive(true);
            }
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        }
    });

    return ItemView;
});
