define([
    "backbone",
    "text!modules/layerinformation/template.html"
], function (Backbone, LayerInformationTemplate) {

        var view = Backbone.View.extend({
            template: _.template(LayerInformationTemplate),
            className: "alert alert-danger alert-dismissible layerinformation",
            events: {
                "click .glyphicon": "remove"
            },
            initialize: function () {
                this.$el.on({
                    click: function (e) {
                        e.stopPropagation();
                    }
                });
                this.listenTo(this.model, {
                    "remove": function () {
                        this.remove();
                    }
                });
            },
            render: function () {
                var attr = this.model.toJSON();

                this.$el.html(this.template(attr));
                return this;
            }
        });

        return view;
});
