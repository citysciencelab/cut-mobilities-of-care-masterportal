define([
    "backbone",
    "modules/layerinformation/model",
    "text!modules/layerinformation/templateMobile.html"
], function (Backbone, Layerinformation, LayerInformationMobileTemplate) {

    var LayerInformationView = Backbone.View.extend({
        model: new Layerinformation(),
        className: "modal fade layerinformation-mobile-win",
        template: _.template(LayerInformationMobileTemplate),
        events: {
            "click .layerinformation-win-header > .glyphicon-remove": "hide"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "sync": this.render
            });
            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.$el.modal({
                show: true
            });
        },

        hide: function () {
            this.$el.modal("hide");
        }
    });

    return LayerInformationView;
});
