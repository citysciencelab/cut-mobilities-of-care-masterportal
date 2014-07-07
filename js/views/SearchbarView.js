define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Searchbar.html',
    'models/Searchbar',
    'eventbus'
], function ($, _, Backbone, SearchbarTemplate, Searchbar, EventBus) {

    var SearchbarView = Backbone.View.extend({
        model: Searchbar,
        el: '#searchbar',
        template: _.template(SearchbarTemplate),
        events: {
            'change input': 'setSearchString',
            'click button': 'searchAddress'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(this.template());
        },
        setSearchString: function (evt) {
            var value = $(evt.currentTarget).val();
            this.model.setSearchString(value);
        },
        searchAddress: function () {
            var requestURL, coordinate = [];
            requestURL = this.model.get('findeStraßeURL') + this.model.get('searchString');
            $.ajax({
                url: requestURL,
                async: false,
                type: 'GET',
                success: function (data, textStatus, jqXHR) {
                    try {
                        coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[0]));
                        coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[1]));
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            });
            EventBus.trigger('setCenter', coordinate);
        }
    });

    return SearchbarView;
});
