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
            maxLines: Util.isAny() ? "5" : "10",
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
            ticketID: "",
            userName: "",
            userEmail: "",
            userTel: ""
        },
        initialize: function () {
            var date = new Date(),
                day = date.getUTCDate() < 10 ? "0" + date.getUTCDate().toString() : date.getUTCDate().toString(),
                month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
                ticketID = month + day + "-" + _.random(1000, 9999),
                resp = RestReader.getServiceById(Config.menu.contact.serviceID);

            if (resp && resp.length === 1) {
                this.set("url", _.first(resp).get("url"));
                this.set("ticketID", ticketID);
                this.listenTo(EventBus, {
                    "winParams": this.setStatus
                });
            }
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
        validate: function (attributes, identifier) {
            var userNameValid = attributes.userName.length >= 3,
                userEmailValid1 = attributes.userEmail.length >= 1,
                userEmailValid2 = attributes.userEmail.match(/^[A-Z0-9\.\_\%\+\-]+@{1}[A-Z0-9\.\-]+\.{1}[A-Z]{2,4}$/igm) === null ? false : true,
                userTelValid = attributes.userTel.match(/^[0-9]{1}[0-9\-\+\(\)]*[0-9]$/ig) === null ? false : true,
                textValid = attributes.text.length >= 10;

            if (userNameValid === false || userEmailValid1 === false || userEmailValid2 === false || userTelValid === false || textValid === false) {
                return {
                    userName: userNameValid,
                    userEmail: userEmailValid1 === true && userEmailValid2 === true ? true : false,
                    userTel: userTelValid,
                    text: textValid
                };
            }
            else {
                return true;
            }
        },
        send: function () {
            console.log("implementiere Senden");
        }
    });

    return new ContactModel();
});
