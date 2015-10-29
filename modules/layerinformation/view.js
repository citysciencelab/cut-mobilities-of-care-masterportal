define([
    "backbone",
    "modules/layerinformation/model",
    "text!modules/layerinformation/template.html"
], function (Backbone, Layerinformation, LayerInformationTemplate) {

    var LayerInformationView = Backbone.View.extend({
        model: new Layerinformation(),
        className: "layerinformation-win",
        template: _.template(LayerInformationTemplate),
        events: {
            "click .layerinformation-win-header > .glyphicon-remove": "hide"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "sync": this.render
            });
        },

        render: function () {
            var attr = this.model.toJSON();

            $("body").append(this.$el.html(this.template(attr)));
            this.$el.draggable({
                containment: "#map",
                handle: ".layerinformation-win-header"
            });
            this.$el.show();
        },

        hide: function () {
            this.$el.hide();
        }
    });

    return LayerInformationView;
});
