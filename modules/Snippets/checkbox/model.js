define(function (require) {

var SnippetModel = require("modules/snippets/model"),
    CheckboxSnippet;

CheckboxSnippet = SnippetModel.extend({
    defaults: {
        isChecked: false
    },
    initialize: function () {
        this.superInitialize();
        this.addValueModel(this.get("isChecked"));
        this.listenTo(this.get("valuesCollection"), {
            "change:isChecked": function () {
                this.trigger("valuesChanged");
            }
        });
    },
    // setter for isChecked
    setIsChecked: function (value) {
        this.set("isChecked", value);
    },
    addValueModel: function (value) {
        this.get("valuesCollection").add(
            new SnippetModel({
                attr: this.get("name"),
                isChecked: value,
                type: this.get("type")
            })
        );
    },
    renderView: function () {
        this.trigger("renderView");
    }
 });
 return CheckboxSnippet;
});
