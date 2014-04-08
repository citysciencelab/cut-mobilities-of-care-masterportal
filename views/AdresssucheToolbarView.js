/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/AdresssucheToolbar.html',
    'bootstrap'
], function ($, _, Backbone, adresssucheTemplate) {

    var AdresssucheToolbarView = Backbone.View.extend({
        tagName: 'form',
        className: 'navbar-form navbar-right',
        attributes: {"role": "search"},
        template: _.template(adresssucheTemplate),
        initialize: function () {
            this.render();
        },
        render: function () {
            $('.nav').after(this.$el.append(this.template()));
        }
    });

    return AdresssucheToolbarView;
});