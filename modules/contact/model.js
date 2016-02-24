define([
    "backbone",
    "eventbus",
    "config",
    "modules/restReader/collection",
    "modules/core/util"
], function (Backbone, EventBus, Config, RestReader, Util) {
    "use strict";
    var ContactModel = Backbone.Model.extend({
        defaults: {
            from: Config.menu.contact.from,
            to: Config.menu.contact.from,
            cc: Config.menu.contact.cc ? Config.menu.contact.cc : "",
            ccToUser: Config.menu.contact.ccToUser ? Config.menu.contact.ccToUser : false,
            bcc: Config.menu.contact.bcc ? Config.menu.contact.bcc : "",
            subject: Config.menu.contact.subject ? Config.menu.contact.subject : "Supportanfrage zum Portal " + document.title,
            textPlaceholder: Config.menu.contact.textPlaceholder ? Config.menu.contact.textPlaceholder : "Bitte formulieren Sie hier Ihre Frage und drücken Sie auf &quot;Senden&quot;",
            text: "",
            systemInfo: Config.menu.contact.includeSystemInfo && Config.menu.contact.includeSystemInfo === true ? "Platform: " + navigator.platform + "</br>" + "Cookies enabled: " + navigator.cookieEnabled + "</br>" + "UserAgent: " + navigator.userAgent : "",
            url: "",
            ticketID: ""
        },
        initialize: function () {
            var date = new Date(),
                day = date.getUTCDate() < 10 ? "0" + date.getUTCDate().toString() : date.getUTCDate().toString(),
                month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
                ticketID = month + day + "-" + _.random(1000, 9999),
                resp = RestReader.getServiceById(Config.menu.contact.serviceID);

            this.set("url", _.first(resp).get("url"));
            this.set("ticketID", ticketID);
            this.listenTo(EventBus, {
                "winParams": this.setStatus
            });
        },
        setStatus: function (args) { // Fenstermanagement
            if (args[2] === "contact") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        // Validation
        validators: {
            minLength: function (value, minLength) {
                return value.length >= minLength;
            },
            maxLength: function (value, maxLength) {
                return value.length <= maxLength;
            },
            maxValue: function (value, maxValue) {
                return value <= maxValue;
            },
            minValue: function (value, minValue) {
                return value >= minValue;
            },
            isLessThan: function (min, max) {
                return min <= max;
            },
            pattern: function (value, pattern) {
                return new RegExp(pattern, "gi").test(value) ? true : false;
            }
        },
        validate: function (attributes, identifier) {
            var errors = {};

            if (identifier.validate === true) {
            }
            // return die Errors
            this.set("errors", errors);
            if (_.isEmpty(errors) === false) {
                return errors;
            }
        }
    });

    return new ContactModel();
});
