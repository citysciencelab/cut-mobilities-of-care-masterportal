define([
    "underscore",
    "backbone",
    "text!modules/title/template.html",
    "config"
], function (_, Backbone, TitleTemplate, Config) {

    var TitleView = Backbone.View.extend({
        className: "visible-lg-block portal-title",
        template: _.template(TitleTemplate),
        initialize: function () {
            this.render();
        },
        render: function () {
            // var attr = this.model.toJSON();
            this.$el.html(this.template({title: Config.title}));
            console.log(this.$el);
            $(".nav").append(this.$el);
        }
    });
    return TitleView;
});
