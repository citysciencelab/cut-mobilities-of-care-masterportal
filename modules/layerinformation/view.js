define([
    "backbone",
    "text!modules/layerinformation/template.html"
], function (Backbone, LayerInformationTemplate) {

    var LayerInformationView = Backbone.View.extend({
        className: "layerinformation-win",
        template: _.template(LayerInformationTemplate),
        events: {
            "click .layerinformation-win-header > .glyphicon-remove": "removeView"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change": function () {
                    console.log(42);
                }
            })
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("body").append(this.$el.html(this.template(attr)));
            this.$el.draggable({
                containment: "#map",
                handle: ".layerinformation-win-header"
            });
        },

        removeView: function () {
            this.model.set("remove", true);
            this.remove();
        }
    });

    return LayerInformationView;
});
