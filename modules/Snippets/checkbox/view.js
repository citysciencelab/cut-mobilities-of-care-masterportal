define(function (require) {
    require("bootstrap-toggle");
    var Model = require("modules/snippets/checkbox/model"),
        Template = require("text!modules/snippets/checkbox/template.html"),
        CheckbosSnippetView;

    CheckbosSnippetView = Backbone.View.extend({
        model: {},
        template: _.template(Template),
        events: {
            "change .checkbox-toggle" : "setSelectedValues"
        },
        initialize: function (attr) {
            this.model = new Model(attr);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.$el.find("input").bootstrapToggle();

            return this.$el;
        },
        setSelectedValues: function (evt) {
            var model = this.model.get("valuesCollection").models[0];

            model.set("isChecked", $(evt.target).prop("checked"));
        }
    });
    return CheckbosSnippetView;
});
