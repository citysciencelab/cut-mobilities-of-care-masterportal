define(function (require) {
    require("bootstrap/modal");

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ContactModel = require("idaModules/info/model"),
        Template = require("text!idaModules/info/template.html"),
        FormularView;

    FormularView = Backbone.View.extend({
        className: "",
        model: new ContactModel(),
        template: _.template(Template),
        initialize: function () {
            this.listenTo(this.model, {
                "invalid": this.showValidity,
                "hideModal": this.hideModal
            });
            this.checkIfInternetOrDev();
            this.render();
        },
        events: {
            // Modal ist vollständig sichtbar und geladen
            "shown.bs.modal": "createTicketId",
            "keyup #contactName": "setUserName",
            "keyup #contactEmail": "setUserEmail",
            "keyup #contactTel": "setUserTel",
            "keyup #contactText": "setUserText",
            "keyup": function () {
                this.model.isValid();
            },
            // Klick auf Button "Abschicken"
            "click .contactButton": "send",
            "click .navi": "navigateBack"
        },
        render: function () {
            var attr = this.model.toJSON();

            $(".page-header").after(this.$el.html(this.template(attr)));
        },
        hideModal: function () {
            $(".modal").modal("hide");
        },

        navigateBack: function (evt) {
            var id = evt.currentTarget.id;

            switch (id) {
                case "navbar-1-queries": {
                    Radio.trigger("Overview", "destroy");
                    Radio.trigger("ParameterView", "destroy");
                    Radio.trigger("BRWView", "remove");
                    Radio.trigger("QueriesView", "show");
                    break;
                }
                case "navbar-2-brw": {
                    Radio.trigger("Overview", "destroy");
                    Radio.trigger("ParameterView", "destroy");
                    Radio.trigger("BRWView", "remove");
                    Radio.trigger("QueriesView", "show");
                    break;
                }
                case "navbar-3-parameter": {
                    Radio.trigger("Overview", "destroy");
                    Radio.trigger("ParameterView", "show");
                    break;
                }
            }
        },

        /**
         * [description]
         * @return {[type]} [description]
         */
        createTicketId: function () {
            this.model.createTicketId();
        },

        setUserEmail: function (evt) {
            this.model.setUserEmail(evt.target.value);
        },

        setUserName: function (evt) {
            this.model.setUserName(evt.target.value);
        },

        setUserTel: function (evt) {
            this.model.setUserTel(evt.target.value);
        },

        setUserText: function (evt) {
            this.model.setUserText(evt.target.value);
        },

        send: function () {
            this.model.checkCcToUser();
            this.model.send();
        },

        showValidity: function () {
            if (_.isObject(this.model.validationError)) {
                var errors = this.model.validationError;

                this.toggleUserNameValid(errors.userName);
                this.toggleUserEmailValid(errors.userEmail);
                this.toggleUserTelValid(errors.userTel);
                this.toggleTextValid(errors.userText);
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
        },
        checkIfInternetOrDev: function () {
            var url = window.location.href,
                isInternetOrDev = (url.search("geoportal-hamburg.de") !== -1 || url.search("localhost") !== -1) === true ? true : false;

            this.model.set("isInternetOrDev", isInternetOrDev);
        }
    });

    return FormularView;
});
