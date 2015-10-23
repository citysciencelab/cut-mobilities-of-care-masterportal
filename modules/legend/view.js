define([
    "backbone",
    "text!modules/legend/template.html",
    "modules/legend/model",
    "eventbus"
], function (Backbone, LegendTemplate, Legend, EventBus) {

    var LegendView = Backbone.View.extend({
        model: Legend,
        className: "legend-win",
        template: _.template(LegendTemplate),
        initialize: function () {
//             $( window ).resize(function() {
//   console.log(44);
// });
            EventBus.trigger("layerlist:getVisiblelayerList");

            this.listenTo(this.model, {
                "change:legendParams": this.render
            });
        },
        render: function () {
            var attr = this.model.toJSON();
// console.log($(document));
// console.log($(document).innerHeight());
// console.log($(document).outerHeight());
            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
        }
    });

    return LegendView;
});
