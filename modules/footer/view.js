define(function (require) {
    var Template = require("text!modules/footer/template.html"),
        Footermodel = require("modules/footer/model"),
        $ = require("jquery"),
        FooterView;

    FooterView = Backbone.View.extend({
        template: _.template(Template),
        model: new Footermodel(),
        className: "footer",
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $(".ol-viewport").append(this.$el.html(this.template(attr)));
            return this;
        }
    });

    return FooterView;
});
