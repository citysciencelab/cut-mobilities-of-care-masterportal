define([
    "backbone",
    "config",
    "text!modules/footer/template.html",
    "modules/footer/model"
], function (Backbone, Config, Template, Footermodel) {

    var view = Backbone.View.extend({
        template: _.template(Template),
        model: Footermodel,
        className: "footer",
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $(".ol-viewport").append(this.$el.html(this.template(attr)));
        }
    });

    return view;
});
