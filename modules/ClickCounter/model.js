define([
    'backbone',
    'config',
], function (Backbone, Config) {

    var ClickCounter = Backbone.Model.extend({
        defaults: {
            countframeid: _.uniqueId('countframe'),
    		srcUrl: ''
        },
    	initialize: function () {
            var srcurl = '';
            _.each(Config.clickCounter, function (value, key) {
                if (Config.clickCounter.version.toUpperCase() === key.toUpperCase()) {
                    srcurl = value;
                }
            });
            if (srcurl != '') {
                this.set('srcUrl', srcurl);
            }
        },
        refreshIframe: function () {
            $('#' + this.get('countframeid')).attr( 'src', function ( i, val ) { return val; });
        }
    });
    return new ClickCounter();
});
