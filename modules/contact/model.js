define([
    "backbone",
    "backbone.radio"
], function (Backbone, Radio) {
    "use strict";
    var ContactModel = Backbone.Model.extend({
        defaults: {
            maxLines: Radio.request("Util", "isAny") ? "5" : "10",
            from: [{
                  "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                  "name": "LGVGeoportalHilfe"
                }],
            to: [{
                  "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                  "name": "LGVGeoportalHilfe"
                }],
            cc: [],
            ccToUser: false,
            bcc: [],
            textPlaceholder: "Bitte formulieren Sie hier Ihre Frage und drücken Sie auf &quot;Abschicken&quot;",
            text: "",
            url: "",
            ticketID: "",
            systemInfo: "",
            subject: "",
            userName: "",
            userEmail: "",
            userTel: "",
            isCurrentWin: false,
            includeSystemInfo: false,
            contactInfo: ""
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });

            this.setAttributes();
            Radio.trigger("Autostart", "initializedModul", "contact");
        },
        setAttributes: function () {
            var toolModel = Radio.request("ModelList", "getModelByAttributes", {id: "contact"}),
                isPortalTitleUndefined = _.isUndefined(Radio.request("Parser", "getPortalConfig").PortalTitle),
                portaltitle = isPortalTitleUndefined === false ? Radio.request("Parser", "getPortalConfig").PortalTitle : document.title,
                hrefString = "<br>==================<br>" + "Referer: <a href='" + window.location.href + "'>" + portaltitle + "</a>",
                platformString = "<br>Platform: " + navigator.platform + "<br>",
                cookiesString = "Cookies enabled: " + navigator.cookieEnabled + "<br>",
                userAgentString = "UserAgent: " + navigator.userAgent,
                systemInfo = hrefString + platformString + cookiesString + userAgentString,
                isSubjectUndefined = _.isUndefined(toolModel.get("subject")),
                subject = isSubjectUndefined === true ? "Supportanfrage zum Portal " + portaltitle : toolModel.get("subject"),
                date = new Date(),
                day = date.getUTCDate() < 10 ? "0" + date.getUTCDate().toString() : date.getUTCDate().toString(),
                month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
                ticketID = month + day + "-" + _.random(1000, 9999),
                resp = Radio.request("RestReader", "getServiceById", toolModel.get("serviceID"));

            this.set(toolModel.attributes);
            if (resp && resp.get("url")) {
                this.set("url", resp.get("url"));
                this.set("ticketID", ticketID);
                this.set("systemInfo", this.get("includeSystemInfo") === true ? systemInfo : "");
                this.set("subject", subject);
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

            var text = "Name: " + this.get("userName") + "<br>Email: " + this.get("userEmail") + "<br>Tel: " + this.get("userTel") + "<br>==================<br>" + this.get("text") + this.get("systemInfo"),
                dataToSend = {
                    from: this.get("from"),
                    to: this.get("to"),
                    cc: cc,
                    bcc: this.get("bcc"),
                    subject: this.get("ticketID") + ": " + this.get("subject"),
                    text: text
                };

            Radio.trigger("Util", "showLoader");
            $.ajax({
                url: this.get("url"),
                data: dataToSend,
                async: true,
                type: "POST",
                cache: false,
                dataType: "json",
                context: this,
                complete: function (jqXHR) {
                    Radio.trigger("Util", "hideLoader");
                    if (jqXHR.status !== 200 || jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
                        Radio.trigger("Alert", "alert", {text: "<strong>Emailversand fehlgeschlagen!</strong> " + jqXHR.statusText + " (" + jqXHR.status + ")", kategorie: "alert-danger"});
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
