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
            $('body').append(this.$el.html(this.template));
        },
        toggleNavigation: function () {
            if($('#toggleButton').css('top') === "50px") {
                $('.navbar').slideToggle('slow');
                $('#toggleButton').animate({ top: '0px'}, 'slow');
            }
            else {
                $('.navbar').slideToggle('slow');
                $('#toggleButton').animate({ top: '50px'}, 'slow');
            }
        }
    });

    return ToggleButtonView;
});
