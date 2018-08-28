define(function (require) {
    var ContactModel = require("modules/contact/model"),
        Template = require("text!modules/contact/template.html"),
        $ = require("jquery"),
        formularView;

    formularView = Backbone.View.extend({
        events: {
            "keyup #contactName": "setUserAttributes",
            "keyup #contactEmail": "setUserAttributes",
            "keyup #contactTel": "setUserAttributes",
            "keyup #contactText": "setUserAttributes",
            "click .contactButton": "send"
        },
        initialize: function (attr) {
            this.model = new ContactModel(attr);
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "invalid": this.showValidity
            });
        },
        className: "win-body",
        template: _.template(Template),
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.setMaxHeight();
                this.delegateEvents();
            }
            return this;
        },
        setMaxHeight: function () {
            var height = window.offsetHeight - 130;

            this.$el.css("max-height", height);
            this.$el.css("max-width", 400);
        },
        setUserAttributes: function (evt) {
            this.model.setUserAttributes(evt);
        },
        send: function () {
            this.model.send();
        },
        showValidity: function () {
            var errors = this.model.validationError;

            if (_.isObject(this.model.validationError)) {

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
                this.$(".contactButton").removeClass("disabled");
            }
            else {
                this.$(".contactButton").addClass("disabled");
            }
        },
        toggleUserNameValid: function (val) {
            if (val === true) {
                this.$("#contactNameDiv").addClass("has-success");
                this.$("#contactNameDiv").removeClass("has-error");
                this.$("#contactNameFeedback").removeClass("contactHide");
                this.$("#contactNameLabel").addClass("contactHide");
            }
            else {
                this.$("#contactNameDiv").removeClass("has-success");
                this.$("#contactNameDiv").addClass("has-error");
                this.$("#contactNameFeedback").addClass("contactHide");
                this.$("#contactNameLabel").removeClass("contactHide");
            }
        },
        toggleUserEmailValid: function (val) {
            if (val === true) {
                this.$("#contactEmailDiv").addClass("has-success");
                this.$("#contactEmailDiv").removeClass("has-error");
                this.$("#contactEmailFeedback").removeClass("contactHide");
                this.$("#contactEmailLabel").addClass("contactHide");
            }
            else {
                this.$("#contactEmailDiv").removeClass("has-success");
                this.$("#contactEmailDiv").addClass("has-error");
                this.$("#contactEmailFeedback").addClass("contactHide");
                this.$("#contactEmailLabel").removeClass("contactHide");
            }
        },
        toggleUserTelValid: function (val) {
            if (val === true) {
                this.$("#contactTelDiv").addClass("has-success");
                this.$("#contactTelDiv").removeClass("has-error");
                this.$("#contactTelFeedback").removeClass("contactHide");
                this.$("#contactTelLabel").addClass("contactHide");
            }
            else {
                this.$("#contactTelDiv").removeClass("has-success");
                this.$("#contactTelDiv").addClass("has-error");
                this.$("#contactTelFeedback").addClass("contactHide");
                this.$("#contactTelLabel").removeClass("contactHide");
            }
        },
        toggleTextValid: function (val) {
            if (val === true) {
                this.$("#textDiv").addClass("has-success");
                this.$("#textDiv").removeClass("has-error");
                this.$("#contactTextFeedback").removeClass("contactHide");
            }
            else {
                this.$("#textDiv").removeClass("has-success");
                this.$("#textDiv").addClass("has-error");
                this.$("#contactTextFeedback").addClass("contactHide");
            }
        }
    });

    return formularView;
});
