define(function (require) {
    var Template = require("text!modules/footer/template.html"),
        Footermodel = require("modules/footer/model"),
        $ = require("jquery"),
        FooterView;

    FooterView = Backbone.View.extend({
        initialize: function (attr) {
            this.model = new Footermodel(attr);
            this.render();
        },
        template: _.template(Template),
        className: "footer",
        render: function () {
            var attr = this.model.toJSON();

            $(".ol-viewport").append(this.$el.html(this.template(attr)));
            return this;
        }
    });

    return FooterView;
});
