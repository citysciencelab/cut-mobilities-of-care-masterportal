define(function (require) {
    var Template = require("text!modules/layerinformation/template.html"),
        $ = require("jquery"),
        LayerInformationView;

    require("jqueryui/widgets/draggable");
    require("bootstrap/tab");

    LayerInformationView = Backbone.View.extend({
        id: "layerinformation-desktop",
        className: "layerinformation",
        template: _.template(Template),
        events: {
            "click .glyphicon-remove": "hide"
        },

        initialize: function () {
            this.listenTo(this.model, {
                // model.fetch() feuert das Event sync, sobald der Request erfoglreich war
                "sync": this.render,
                "removeView": this.remove
            });
        },

        render: function () {
            var attr = this.model.toJSON();

            $("#map").append(this.$el.html(this.template(attr)));
            this.$el.draggable({
                containment: "#map",
                handle: ".header"
            });
            this.$el.show();
            return this;
        },

        hide: function () {
            Radio.trigger("Layer", "setLayerInfoChecked", false);
            this.$el.hide();
            this.model.setIsVisible(false);
        }
    });

    return LayerInformationView;
});
