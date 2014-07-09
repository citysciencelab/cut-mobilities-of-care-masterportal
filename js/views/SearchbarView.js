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
            'keyup input': 'test',
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
        test: function (evt) {
            var value = $(evt.currentTarget).val();
            if (value.length > 2) {
                this.model.setSearchString(value);
                this.searchAddress();
                $('#autocompletePanel').css("display", "block");
            }
            else {
                $('#autocompletePanel').css("display", "none");
            }
        },
        searchAddress: function () {
            var requestURL, coordinate = [], streetNames = [];
            requestURL = this.model.get('findeStraßeURL') + encodeURIComponent(this.model.get('searchString'));
            $.ajax({
                url: requestURL,
                async: false,
                type: 'GET',
                success: function (data, textStatus, jqXHR) {
                    try {
                        var hits = data.getElementsByTagName("wfs:member");
                        $('#autocompleteBody').html('');
                        _.each(hits, function (element, index, list) {
                            if (index < 10) {
                                streetNames.push(data.getElementsByTagName('dog:strassenname')[index].textContent);
                                $('#autocompleteBody').append('<div class="row"><p class="col-md-offset-1">' + streetNames[index] + '</p></div>');
                            }
                        }, this);
                        if (hits.length === 0) {
                            streetNames.push('Kein Ergebnis gefunden.');
                            $('#autocompleteBody').append('<div class="row"><p class="col-md-offset-1">' + streetNames[0] + '</p></div>');
                        }
                        else {
                            coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[0]));
                            coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[1]));
                            EventBus.trigger('setCenter', coordinate);
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            });
            this.model.set('autoCompleteResults', streetNames);
            console.log(this.model.get('autoCompleteResults'));
        }
    });

    return SearchbarView;
});
