define(function (require) {
    require("bootstrap-toggle");
    var Model = require("modules/snippets/checkbox/model"),
        Template = require("text!modules/snippets/checkbox/template.html"),
        CheckboxSnippetView;

    CheckboxSnippetView = Backbone.View.extend({
        model: new Model(),
        template: _.template(Template),
        events: {
            "change .checkbox-toggle": "setSelectedValues"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "renderView": this.render
            }, this);
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
    return CheckboxSnippetView;
});
