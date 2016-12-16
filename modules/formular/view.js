define([
    "backbone",
    "backbone.radio",
    "eventbus",
    "config",
    "modules/formular/grenznachweis",
    "text!modules/formular/grenznachweis.html",
    "text!modules/formular/grenznachweis.css"
], function (Backbone, Radio, EventBus, Config, Grenznachweismodel, Grenznachweistemplate, Grenznachweiscss) {
    "use strict";
    var formularView = Backbone.View.extend({
        id: "formularWin",
        initialize: function (modelname) {
            if (modelname === "grenznachweis") {
                this.model = new Grenznachweismodel();
                this.template = _.template(Grenznachweistemplate);
                $("head").prepend("<style>" + Grenznachweiscss + "</style>");
                var clickFunction = function () {
                    EventBus.trigger("toggleWin", ["grenznachweis", "Bestellung Grenznachweis", "glyphicon glyphicon-shopping-cart"]);
                };
            }
            this.listenTo(this.model, {
                "change:isCollapsed render invalid change:isCurrentWin": this.render
            });
            Radio.trigger("Autostart", "initializedTool", "formular");
        },
        events: {
            // anonymisierte Events
            "keyup input[type=text]": "keyup",
            "keyup textarea": "keyup",
            "click input[type=radio]": "click",
            "click input[type=checkbox]": "click",
            "click button": "click",
            "click a": "click",
            "focusout": "focusout"
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.model.prepWindow();
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else if (this.model.get("isCurrentWin") === false) {
                this.model.resetWindow();
            }
        },
        // anonymisierte Events
        keyup: function (evt) {
            if (evt.target.id) {
                this.model.keyup(evt);
            }
        },
        click: function (evt) {
            if (evt.target.id) {
                this.model.click(evt);
            }
        },
        focusout: function (evt) {
            if (evt.target.id) {
                this.model.focusout(evt);
            }
        }
    });

    return formularView;
});
