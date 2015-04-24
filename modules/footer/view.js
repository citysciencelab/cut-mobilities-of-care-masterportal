define([
    "underscore",
    "backbone",
    "text!modules/footer/template.html"
], function (_, Backbone, Template) {

    var view = Backbone.View.extend({
        template: _.template(Template),
        className: "footer",
        initialize: function () {
            this.render();
        },
        render: function () {
            $("body").append(this.$el.html(this.template()));
        }
    });

    return view;
});
