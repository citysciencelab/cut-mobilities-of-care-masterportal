/*global define*/
define([
    'underscore',
    'backbone',
    'config'
], function (_, Backbone, Config) {

    var Tools = Backbone.Model.extend({
        initialize: function () {
            _.each(Config.tools, this.setAttributes, this);
        },
        setAttributes: function (value, key) {
            this.set(key, value);
        }
    });

    return Tools;
});