define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Searchbar.html',
    'text!templates/AutoCompleteSearch.html',
    'models/Searchbar',
    'eventbus'
], function ($, _, Backbone, SearchbarTemplate, AutoCompleteSearchTemplate, Searchbar, EventBus) {

    var SearchbarView = Backbone.View.extend({
        model: Searchbar,
        el: '#searchbar',
        template: _.template(SearchbarTemplate),
        events: {
            'change input': 'setSearchString',
            'keyup input': 'autoComplete',
            'click button': 'zoomTo',
            'click .list-group-item': 'zoomToStreet'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        setSearchString: function (evt) {
            var value = $(evt.currentTarget).val();
            this.model.setSearchString(value);
        },
        autoComplete: function (evt) {
            var value = $(evt.currentTarget).val();
            if (value.length > 2) {
                this.model.setSearchString(value);
                this.searchAddress();
                var attr = this.model.toJSON();
                $('#autoCompleteBody').html(_.template(AutoCompleteSearchTemplate, attr));
                $('#autoCompleteBody').css("display", "block");
            }
            else {
                $('#autoCompleteBody').css("display", "none");
            }
        },
        zoomTo: function (evt) {
            this.searchAddress();
            EventBus.trigger('setCenter', this.model.get('coordinate'));
            $('#searchInput').val(value);
            $('#autoCompleteBody').css("display", "none");
        },
        zoomToStreet: function (evt) {
            var value = evt.target.textContent;
            this.model.setSearchString(value);
            this.searchAddress();
            EventBus.trigger('setCenter', this.model.get('coordinate'));
            $('#searchInput').val(value);
            $('#autoCompleteBody').css("display", "none");
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
                        $('#autoCompleteBody').html('');
                        _.each(hits, function (element, index, list) {
                            if (index < 10) {
                                streetNames.push(data.getElementsByTagName('dog:strassenname')[index].textContent);
                                //$('#autoCompleteBody').append('<a href="#" class="list-group-item">' + streetNames[index] + '</a>');
                            }
                        }, this);
                        if (hits.length === 0) {
                            streetNames.push('Kein Ergebnis gefunden.');
                            //$('#autoCompleteBody').append('<a href="#" class="list-group-item results">' + streetNames[0] + '</a>');
                        }
                        else {
                            coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[0]));
                            coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[1]));
                            //EventBus.trigger('setCenter', coordinate);
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            });
            this.model.set('coordinate', coordinate);
            this.model.set('autoCompleteResults', streetNames);
        }
    });

    return SearchbarView;
});
