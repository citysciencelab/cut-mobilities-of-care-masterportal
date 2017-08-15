define(function (require) {

var Snipped;

Snipped = Backbone.Model.extend({
    defaults: {
        id: 0,
        name: "",
        attr: {}
    },
    initialize: function () {},

    // getter for id
    getid: function {
        return id;
    },

    // setter for id
    setId: function(value) {
        this.id = value;
    },

    // getter for name
    getName: function () {
        return this.name;
    },

    // setter for name
    setName: function (value) {
        this.name = value;
    },

    // getter for attr
    getAttr: function () {
        return this.attr;
    },
    // setter for attr
    setAttr: function (value) {
        this.attr = value;
    }
 }
 return Snipped;
});
