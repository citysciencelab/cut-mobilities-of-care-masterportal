define([
    'underscore',
    'backbone',
    'config',
], function (_, Backbone, Config) {

    var ClickCounter = Backbone.Model.extend({
        defaults: {
            countframeid: _.uniqueId('countframe'),
    		srcUrl: ''
        },
    	initialize: function () {
    	   this.set('srcUrl', Config.clickCounter.url);
        },
        refreshIframe: function () {
            $('#' + this.get('countframeid')).attr( 'src', function ( i, val ) { return val; });
        }
    });
    return new ClickCounter();
});
