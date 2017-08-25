define(function (require) {

var Snippet;

Snippet = Backbone.Model.extend({
    defaults: {
        name: "",
        attr: {},
        valuesCollection: {}
    },
    superInitialize: function () {
        this.set("valuesCollection", new Backbone.Collection());
    },
    // getter for id
    getId: function () {
        return this.get("id");
    },
    // setter for id
    setId: function (value) {
        this.set("id", value);
    },
    // getter for name
    getName: function () {
        return this.get("name");
    },
    // setter for name
    setName: function (value) {
        this.set("name", value);
    },
    // getter for attr
    getAttr: function () {
        return this.get("attr");
    },
    // setter for attr
    setAttr: function (value) {
        this.set("attr", value);
    }
 });

return Snippet;
});
