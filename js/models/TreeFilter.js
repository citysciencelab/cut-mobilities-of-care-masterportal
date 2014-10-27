define([
    'underscore',
    'backbone'
], function (_, Backbone) {

    var TreeFilter = Backbone.Model.extend({
        initialize: function () {
            this.set('showContent', true);
        }
    });

    return new TreeFilter();
});
