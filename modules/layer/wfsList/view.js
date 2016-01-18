define([
    "backbone",
    "eventbus",
    "text!modules/layer/wfsList/template.html",
    "modules/layer/wfsList/model"
], function (Backbone, EventBus, Template, Model) {

    var WFSListView = Backbone.View.extend({
        model: Model,
        className: "legend-win",
        template: _.template(Template),
        events: {
            "click .glyphicon-remove": "toggle"
        },
        initialize: function () {
            console.log(test);
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
        }
    });

    return WFSListView;
});
