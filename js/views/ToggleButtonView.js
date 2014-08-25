define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {

    var ToggleButtonView = Backbone.View.extend({
        id: 'toggleButton',
        template: '<span class="glyphicon glyphicon-bookmark"></span>',
        events: {
            'click': 'toggleNavigation'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            $('#toggleRow').append(this.$el.html(this.template));
        },
        toggleNavigation: function () {
            $('#navbarRow').slideToggle('slow');
        }
    });

    return ToggleButtonView;
});
