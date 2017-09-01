define(function (require) {

var SnippetModel = require("modules/snippets/model"),
    CheckboxSnippet;

CheckboxSnippet = SnippetModel.extend({
    defaults: {
        isChecked: false
    },
    initialize: function () {
        this.superInitialize();
         _.each(this.get("values"), function (value) {
            this.get("valuesCollection").add(value);
        }, this);
        this.listenTo(this.get("valuesCollection"), {
            "change:isChecked": function () {
                this.trigger("valuesChanged");
            }
        });
    },
    // setter for isChecked
    setIsChecked: function (value) {
        this.set("isChecked", value);
    }
 });
 return CheckboxSnippet;
});
