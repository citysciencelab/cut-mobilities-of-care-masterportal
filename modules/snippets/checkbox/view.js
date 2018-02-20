define(function (require) {
    require("bootstrap-toggle");
    var Model = require("modules/snippets/checkbox/model"),
        Template = require("text!modules/snippets/checkbox/template.html"),
        CheckboxSnippetView;

    CheckboxSnippetView = Backbone.View.extend({
        model: new Model(),
        className: "checkbox-container",
        template: _.template(Template),
        events: {
            "change input": "setIsSelected"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "renderView": this.render,
                "removeView": this.remove
            }, this);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.initCheckbox();
            return this.$el;
        },

        /**
         * inits the Checkbox
         */
        initCheckbox: function () {
            this.$el.find("input").bootstrapToggle({
                on: this.model.get("textOn"),
                off: this.model.get("textOff"),
                size: this.model.get("size")
            });
        },

        /**
         * calls the function setIsSelected in the model
         * @param {ChangeEvent} evt
         */
        setIsSelected: function (evt) {
            this.model.setIsSelected($(evt.target).prop("checked"));
        }
    });
    return CheckboxSnippetView;
});
