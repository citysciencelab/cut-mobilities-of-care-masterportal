define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        LayerTemplate = require("text!modules/menu/table/layer/template.html"),
        $ = require("jquery"),
        LayerView;

    LayerView = Backbone.View.extend({
        id: "table-layer",
        className: "table-layer table-nav",
        template: _.template(LayerTemplate),
        events: {
            "click .icon-burgermenu_alt": "burgerMenuIsActive"
        },
        initialize: function () {
            this.render();
        },
        burgerMenuIsActive: function (event) {
            $(event.currentTarget.parentElement).toggleClass("burgerMenuIsActive");
        },
        render: function () {
            return this.$el.html(this.template());
        }
    });

    return LayerView;
});
