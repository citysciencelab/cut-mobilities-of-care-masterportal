const exampleAddon = Backbone.Model.extend({
    defaults: {},

    initialize: function () {
        console.warn("Hello. I am an addon.");
    }
});

export default exampleAddon;
