define([
    'underscore',
    'backbone',
    'openlayers'
], function (_, Backbone, ol) {

    var MeasureModel = Backbone.Model.extend({
        setType: function (value) {
            this.set('type', value);
        }
    });

    return new MeasureModel();
});
