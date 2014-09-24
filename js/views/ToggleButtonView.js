define([
    'jquery',
    'underscore',
    'backbone',
    'config'
], function ($, _, Backbone, Config) {

    var ToggleButtonView = Backbone.View.extend({
        id: 'toggleButton',
        events: {
            'click': 'toggleNavigation'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            if(Config.isMenubarVisible === true) {
                this.template = '<span class="glyphicon glyphicon-chevron-up"></span>';
            }
            else {
                this.template = '<span class="glyphicon glyphicon-chevron-down"></span>';
            }
            $('#toggleRow').append(this.$el.html(this.template));
        },
        toggleNavigation: function () {
            $('#navbarRow').slideToggle('slow');
            $('#toggleButton > span').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
        }
    });

    return ToggleButtonView;
});
