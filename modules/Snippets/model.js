define(function () {

var Snippet = Backbone.Model.extend({
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
    },
    removeView: function () {
        this.trigger("removeView");
    },
    /**
     * resetCollection
     * @return {[type]} [description]
     */
    resetValues: function () {
        var collection = this.get("valuesCollection").models,
            modelsToRemove = [];

         _.each(collection.models, function (model) {
            model.set("isSelectable", true);
         }, this);
    },
    /**
     * returns true if any of the value models is selected
     * @return {boolean}
     */
    hasSelectedValues: function () {
        return this.get("valuesCollection").some(function (model) {
            return model.get("isSelected") === true;
        });
    }

 });

return Snippet;
});
