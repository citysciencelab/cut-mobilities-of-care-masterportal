define(function (require) {

    var $ = require("jquery"),
        ItemTemplate = require("text!modules/menu/mobile/tool/template.html"),
        ItemView;

    ItemView = Backbone.View.extend({
        events: {
            "click": "checkItem"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isVisibleInTree": this.removeIfNotVisible
            });
            this.listenTo(Radio.channel("Map"), {
                "change": function (mode) {
                    this.toggleSupportedVisibility(mode);
                }
            });
            this.toggleSupportedVisibility(Radio.request("Map", "getMapMode"));
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

        toggleSupportedVisibility: function(mode) {
            if(mode === '2D'){
                this.$el.show();
            } else if(this.model.get("supportedIn3d").indexOf(this.model.getId()) >= 0){
                this.$el.show();
            } else {
                this.$el.hide();
            }
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
        }
    });

    return ItemView;
});
