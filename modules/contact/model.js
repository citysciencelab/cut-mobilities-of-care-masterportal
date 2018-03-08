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
                portalConfig = Radio.request("Parser", "getPortalConfig"),
                portaltitle = _.isUndefined(portalConfig) === false ? portalConfig.PortalTitle : document.title,
                hrefString = "<br>==================<br>" + "Referer: <a href='" + window.location.href + "'>" + portaltitle + "</a>",
                platformString = "<br>Platform: " + navigator.platform + "<br>",
                cookiesString = "Cookies enabled: " + navigator.cookieEnabled + "<br>",
                userAgentString = "UserAgent: " + navigator.userAgent,
                systemInfo = hrefString + platformString + cookiesString + userAgentString,
                isSubjectUndefined = _.isUndefined(toolModel) === false ? _.isUndefined(toolModel.get("subject")) : true,
                subject = isSubjectUndefined === true ? "Supportanfrage zum Portal " + portaltitle : toolModel.get("subject"),
                date = new Date(),
                day = date.getUTCDate() < 10 ? "0" + date.getUTCDate().toString() : date.getUTCDate().toString(),
                month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
                ticketID = month + day + "-" + _.random(1000, 9999),
                resp = _.isUndefined(toolModel) === false ? Radio.request("RestReader", "getServiceById", toolModel.get("serviceID")) : undefined;

            if (_.isUndefined(toolModel) === false) {
                this.set(toolModel.attributes);
            }
            if (_.isUndefined(resp) === false && resp.get("url")) {
                this.set("url", resp.get("url"));
                this.set("ticketID", ticketID);
                this.set("systemInfo", this.get("includeSystemInfo") === true ? systemInfo : "");
                this.set("subject", subject, {validate: true});
            }
        },

        setUserAttributes: function (evt) {

            switch (evt.target.id) {
                case "contactEmail": {
                    this.set("userEmail", evt.target.value);
                    break;
                }
                case "contactName": {
                    this.set("userName", evt.target.value);
                    break;
                }
                case "contactTel": {
                    this.set("userTel", evt.target.value);
                    break;
                }
                case "contactText": {
                    this.set("text", evt.target.value);
                    break;
                }
            }
            this.isValid();
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
            var userNameValid = _.isUndefined(attributes.userName) === false ? attributes.userName.length >= 3 : false,
                userEmailValid1 = _.isUndefined(attributes.userEmail) === false ? attributes.userEmail.length >= 1 : false,
                userEmailValid2 = _.isUndefined(attributes.userEmail) === false ? attributes.userEmail.match(/^[A-Z0-9\.\_\%\+\-]+@{1}[A-Z0-9\.\-]+\.{1}[A-Z]{2,4}$/igm) === null ? false : true : false,
                userTelValid = _.isUndefined(attributes.userTel) === false ? attributes.userTel.match(/^[0-9]{1}[0-9\-\+\(\)]*[0-9]$/ig) === null ? false : true : false,
                textValid = _.isUndefined(attributes.text) === false ? attributes.text.length >= 10 : false;

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
            var cc = this.getCc(),
                text,
                dataToSend;

            if (this.get("ccToUser") === true) {
                cc.push({
                    email: this.get("userEmail"),
                    name: this.get("userName")
                });
            }

            text = "Name: " + this.get("userName") + "<br>Email: " + this.get("userEmail") + "<br>Tel: " + this.get("userTel") + "<br>==================<br>" + this.get("text") + this.get("systemInfo"),
            dataToSend = {
                from: this.get("from"),
                to: this.get("to"),
                cc: cc,
                bcc: this.get("bcc"),
                subject: this.get("ticketID") + ": " + this.get("subject"),
                text: text
            };

            // Radio.trigger("Util", "showLoader");
            // $.ajax({
            //     url: this.get("url"),
            //     data: dataToSend,
            //     async: true,
            //     type: "POST",
            //     cache: false,
            //     dataType: "json",
            //     context: this,
            //     complete: function (jqXHR) {
            //         Radio.trigger("Util", "hideLoader");
            //         if (jqXHR.status !== 200 || jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
            //             Radio.trigger("Alert", "alert", {text: "<strong>Emailversandt fehlgeschlagen!</strong> " + jqXHR.statusText + " (" + jqXHR.status + ")", kategorie: "alert-danger"});
            //         }
            //     },
            //     success: function (data) {
            //         if (data.success === false) {
            //             Radio.trigger("Alert", "alert", {text: data.message, kategorie: "alert-warning"});
            //         }
            //         else {
            //             Radio.trigger("Alert", "alert", {text: data.message + "<br>Ihre Ticketnummer lautet: <strong>" + this.get("ticketID") + "</strong>.", kategorie: "alert-success"});
            //         }
            //     }
            // });
            // this.setCc([]);
        },

        // getter for cc
        getCc: function () {
            return this.get("cc");
        },
        // setter for cc
        setCc: function (value) {
            this.set("cc", value);
        }
    });

    return ContactModel;
});
