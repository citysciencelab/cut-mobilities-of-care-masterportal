define(function (require) {

var SnippetModel = require("modules/snippets/model"),
    ValueModel = require("modules/snippets/value/model"),
    CheckboxSnippet;

    CheckboxSnippet = SnippetModel.extend({
        defaults: {
            // text of the on toggle
            textOn: "An",
            // text of the off toggle
            textOff: "Aus",
            // size of the toggle. possible values: large, normal, small, mini
            size: "small"
        },

        initialize: function () {
            this.superInitialize();
            this.addValueModel(this.get("isSelected"));
            this.listenTo(this.get("valuesCollection"), {
                "change:isSelected": function () {
                    this.trigger("valuesChanged");
                }
            });
        },
        addValueModel: function (value) {
            this.get("valuesCollection").add(
                new ValueModel({
                    attr: this.get("name"),
                    isSelected: value,
                    type: this.get("type")
                })
            );
        },
        renderView: function () {
            this.trigger("renderView");
        },
        setIsSelected: function (value) {
            this.get("valuesCollection").models[0].set("isSelected", value);
        },
        getIsSelected: function () {
            return this.get("valuesCollection").models[0].get("isSelected");
        }
    });
    return CheckboxSnippet;
});
