define(function (require) {

var SnippetModel = require("modules/snippets/model"),
    CheckboxSnippet;

CheckboxSnippet = SnippetModel.extend({
    initialize: function () {
        this.superInitialize();
        this.addValueModel(this.get("isChecked"));
        this.listenTo(this.get("valuesCollection"), {
            "change:isChecked": function () {
                this.trigger("valuesChanged");
            }
        });
    },
    addValueModel: function (value) {
        this.get("valuesCollection").add(
            new SnippetModel({
                attr: this.get("name"),
                isChecked: value,
                type: this.get("type"),
                labelChecked: "An",
                labelUnchecked: "Aus",
                size: "small"
            })
        );
    },
    renderView: function () {
        this.trigger("renderView");
    },
    setIsChecked: function (value) {
        this.get("valuesCollection").models[0].set("isChecked", value);
    },
    getIsChecked: function () {
        return this.get("valuesCollection").models[0].get("isChecked");
    }
 });
 return CheckboxSnippet;
});
