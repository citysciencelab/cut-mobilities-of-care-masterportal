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
        initialize: function () {
            this.render();
        },
        render: function () {
            return this.$el.html(this.template());
        }
    });

    return LayerView;
});
