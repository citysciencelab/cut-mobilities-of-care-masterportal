define([
    "backbone",
    "eventbus",
    "config",
    "modules/formular/grenznachweis",
    "text!modules/formular/grenznachweis.html",
    "text!modules/formular/grenznachweis.css"
], function (Backbone, EventBus, Config, grenznachweismodel, grenznachweistemplate, grenznachweiscss) {
    "use strict";
    var formularView = Backbone.View.extend({
        id: "formularWin",
        className: "win-body",
        initialize: function (modelname, title, symbol) {
            this.$el.css({
                "max-height": window.innerHeight - 100 - 30 // 100 aus win-max und 30 wegen padding
            });

            $(window).resize($.proxy(function () {
                this.$el.css({
                    "max-height": window.innerHeight - 100 - 30 // 100 aus win-max und 30 wegen padding
                });
            }, this));
            if (modelname === "grenznachweis") {
                this.model = grenznachweismodel;
                this.template = _.template(grenznachweistemplate);
                $("head").prepend("<style>" + grenznachweiscss + "</style>");
            }
            EventBus.trigger("appendItemToMenubar", {
                title: title,
                symbol: symbol,
                classname: modelname
            });
            this.model.on("change:isCollapsed render invalid change:isCurrentWin", this.render, this);
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
