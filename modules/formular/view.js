define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'modules/formular/grenznachweis',
    'text!modules/formular/grenznachweis.html',
    'text!modules/formular/grenznachweis.css',
], function ($, _, Backbone, EventBus, Config, grenznachweismodel, grenznachweistemplate, grenznachweiscss) {

    var formularView = Backbone.View.extend({
        id: 'formularWin',
        className: 'win-body',
        initialize: function (modelname) {
            if (modelname === 'grenznachweis') {
                this.model = grenznachweismodel;
                this.template = _.template(grenznachweistemplate);
                $("head").prepend("<style>" + grenznachweiscss + "</style>");
            }
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement
        },
        events: {
            //anonymisierte Events
            'keyup input[type=text]': 'keyup',
            'keyup textarea': 'keyup',
            'click input[type=radio]': 'click',
            'click input[type=checkbox]': 'click',
            'click button': 'click'
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.model.prepWindow();
                var attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            } else if (this.model.get("isCurrentWin") === false) {
                this.model.resetWindow();
            }
        },
        //anonymisierte Events
        keyup: function (evt) {
            if (evt.target.id) {
                this.model.keyup(evt);
            }
        },
        click: function (evt) {
            if (evt.target.id) {
                this.model.click(evt);
            }
        }
    });

    return formularView;
});
