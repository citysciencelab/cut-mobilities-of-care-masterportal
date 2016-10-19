define([
    "backbone",
    "backbone.radio",
    "modules/core/util"
], function (Backbone, Radio, Util) {
    "use strict";
    var ContactModel = Backbone.Model.extend({
        defaults: {
            maxLines: Util.isAny() ? "5" : "10",
            cc: [],
            ccToUser: false,
            bcc: [],
            subject: "Supportanfrage zum Portal " + document.title,
            textPlaceholder: "Bitte formulieren Sie hier Ihre Frage und drücken Sie auf &quot;Abschicken&quot;",
            text: "",
            systemInfo: "<br>==================<br>Platform: " + navigator.platform + "<br>" + "Cookies enabled: " + navigator.cookieEnabled + "<br>" + "UserAgent: " + navigator.userAgent,
            url: "",
            ticketID: "",
            userName: "",
            userEmail: "",
            userTel: "",
            isCurrentWin: false
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });

            this.setAttributes();
        },
        setAttributes: function () {
            var toolModel = Radio.request("ModelList", "getModelByAttributes", {id: "contact"});

            this.set(toolModel.attributes);
            var date = new Date(),
                day = date.getUTCDate() < 10 ? "0" + date.getUTCDate().toString() : date.getUTCDate().toString(),
                month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
                ticketID = month + day + "-" + _.random(1000, 9999),
                resp = Radio.request("RestReader", "getServiceById", toolModel.get("serviceID"));

            if (resp && resp.length === 1) {
                this.set("url", _.first(resp).get("url"));
                this.set("ticketID", ticketID);
            }
        },

        setStatus: function (args) {
            // Fenstermanagement
            if (args[2].getId() === "contact") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        validate: function (attributes) {
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
            var cc = this.get("cc");

            if (this.get("ccToUser") === true) {
                cc.push({
                    email: this.get("userEmail"),
                    name: this.get("userName")
                });
            }

            var text = "Nutzer: " + this.get("userName") + "<br>Email: " + this.get("userEmail") + "<br>Tel: " + this.get("userTel") + "<br>==================<br>" + this.get("text") + this.get("systemInfo"),
                dataToSend = {
                    from: this.get("from"),
                    to: this.get("to"),
                    cc: cc,
                    bcc: this.get("bcc"),
                    subject: this.get("ticketID") + ": " + this.get("subject"),
                    text: text
                };

            Util.showLoader();
            $.ajax({
                url: this.get("url"),
                data: dataToSend,
                async: true,
                type: "POST",
                cache: false,
                dataType: "json",
                context: this,
                complete: function (jqXHR) {
                    Util.hideLoader();
                    if (jqXHR.status !== 200 || jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
                        Radio.trigger("Alert", "alert", {text: "<strong>Emailversandt fehlgeschlagen!</strong> " + jqXHR.statusText + " (" + jqXHR.status + ")", kategorie: "alert-danger"});
                    }
                },
                success: function (data) {
                    if (data.success === false) {
                        Radio.trigger("Alert", "alert", {text: data.message, kategorie: "alert-warning"});
                    }
                    else {
                        Radio.trigger("Alert", "alert", {text: data.message + "<br>Ihre Ticketnummer lautet: <strong>" + this.get("ticketID") + "</strong>.", kategorie: "alert-success"});
                    }
                }
            });
        }
    });

    return ContactModel;
});
