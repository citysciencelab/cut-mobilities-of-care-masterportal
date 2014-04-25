define([
    'underscore',
    'backbone',
    'config'
], function (_, Backbone, Config) {

    var Menubar = Backbone.Model.extend({
        initialize: function () {
            _.each(Config.menu, this.setAttributes, this);
        },
        setAttributes: function (value, key) {
            this.set(key, value);
        }
    });

    return new Menubar();
});