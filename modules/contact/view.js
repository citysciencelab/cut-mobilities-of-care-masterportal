define([
    "backbone",
    "eventbus",
    "config",
    "modules/contact/model",
    "text!modules/contact/template.html"
], function (Backbone, EventBus, Config, Model, Template) {
    "use strict";
    var formularView = Backbone.View.extend({
        className: "win-body",
        model: Model,
        template: _.template(Template),
        initialize: function () {
            // EventBus.trigger("appendItemToMenubar", {
            //     title: "Kontakt",
            //     symbol: "glyphicon glyphicon-envelope hidden-sm",
            //     classname: "contact",
            //     clickFunction: function () {
            //         EventBus.trigger("toggleWin", ["contact", "Kontakt", "glyphicon glyphicon-envelope"]);
            //     }
            // });
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this);
            this.model.on("invalid", this.showValidity, this);
        },
        events: {
            "focusout #contactName": "focusout",
            "focusout #contactEmail": "focusout",
            "focusout #contactTel": "focusout",
            "focusout #contactText": "focusout",
            "click .contactButton": "send"
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {

                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.setMaxHeight();
                this.delegateEvents();
            }
        },
        setMaxHeight: function () {
            var height = $(window).height() - 130;

            $(".win-body").css("max-height", height);
            $(".win-body").css("max-width", 400);
        },
        focusout: function (evt) {
            switch (evt.target.id) {
                case "contactEmail": {
                    this.model.set("userEmail", evt.target.value);
                    break;
                }
                case "contactName": {
                    this.model.set("userName", evt.target.value);
                    break;
                }
                case "contactTel": {
                    this.model.set("userTel", evt.target.value);
                    break;
                }
                case "contactText": {
                    this.model.set("text", evt.target.value);
                    break;
                }
            }
            this.model.isValid();
        },
        send: function () {
            this.model.send();
        },
        showValidity: function () {
            if (_.isObject(this.model.validationError)) {
                var errors = this.model.validationError;

                this.toggleUserNameValid(errors.userName);
                this.toggleUserEmailValid(errors.userEmail);
                this.toggleUserTelValid(errors.userTel);
                this.toggleTextValid(errors.text);
                this.toggleSendButton(false);
            }
            else if (this.model.validationError === true) {
                this.toggleUserNameValid(true);
                this.toggleUserEmailValid(true);
                this.toggleUserTelValid(true);
                this.toggleTextValid(true);
                this.toggleSendButton(true);
            }
        },
        toggleSendButton: function (val) {
            if (val === true) {
                $(".contactButton").removeClass("disabled");
            }
            else {
                $(".contactButton").addClass("disabled");
            }
        },
        toggleUserNameValid: function (val) {
            if (val === true) {
                $("#contactNameDiv").addClass("has-success");
                $("#contactNameDiv").removeClass("has-error");
                $("#contactNameFeedback").removeClass("contactHide");
                $("#contactNameLabel").addClass("contactHide");
            }
            else {
                $("#contactNameDiv").removeClass("has-success");
                $("#contactNameDiv").addClass("has-error");
                $("#contactNameFeedback").addClass("contactHide");
                $("#contactNameLabel").removeClass("contactHide");
            }
        },
        toggleUserEmailValid: function (val) {
            if (val === true) {
                $("#contactEmailDiv").addClass("has-success");
                $("#contactEmailDiv").removeClass("has-error");
                $("#contactEmailFeedback").removeClass("contactHide");
                $("#contactEmailLabel").addClass("contactHide");
            }
            else {
                $("#contactEmailDiv").removeClass("has-success");
                $("#contactEmailDiv").addClass("has-error");
                $("#contactEmailFeedback").addClass("contactHide");
                $("#contactEmailLabel").removeClass("contactHide");
            }
        },
        toggleUserTelValid: function (val) {
            if (val === true) {
                $("#contactTelDiv").addClass("has-success");
                $("#contactTelDiv").removeClass("has-error");
                $("#contactTelFeedback").removeClass("contactHide");
                $("#contactTelLabel").addClass("contactHide");
            }
            else {
                $("#contactTelDiv").removeClass("has-success");
                $("#contactTelDiv").addClass("has-error");
                $("#contactTelFeedback").addClass("contactHide");
                $("#contactTelLabel").removeClass("contactHide");
            }
        },
        toggleTextValid: function (val) {
            if (val === true) {
                $("#textDiv").addClass("has-success");
                $("#textDiv").removeClass("has-error");
                $("#contactTextFeedback").removeClass("contactHide");
            }
            else {
                $("#textDiv").removeClass("has-success");
                $("#textDiv").addClass("has-error");
                $("#contactTextFeedback").addClass("contactHide");
            }
        }
    });

    return formularView;
});
