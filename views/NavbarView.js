/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Navbar.html',
    'config',
    'views/AdresssucheToolbarView',
    'bootstrap'
], function ($, _, Backbone, navbarTemplate, Config, AdresssucheToolbarView) {

    var NavbarView = Backbone.View.extend({
        tagName: 'nav',
        className: 'navbar navbar-default navbar-fixed-top',
        attributes: {"role": "navigation"},
        template: _.template(navbarTemplate),
        initialize: function () {
            this.render();
        },
        render: function () {
            $('body').append(this.$el.append(this.template()));
            if (Config.navbar === true) {
                new AdresssucheToolbarView();
            }
        }
    });

    return NavbarView;
});