define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus'
], function (_, Backbone, ol, EventBus) {

    var Searchbar = Backbone.Model.extend({
        defaults: {
            searchString: '',
            findeStraßeURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0&StoredQuery_ID=findeStrasse&strassenname=',
        },
        setSearchString: function (value) {
            this.set('searchString', value);
        }
    });

    return new Searchbar();
});