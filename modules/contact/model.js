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
                portalTitleObj = _.isUndefined(portalConfig.portalTitle) === false ? portalConfig.portalTitle : undefined,
                portalTitle = _.isUndefined(portalTitleObj.title) === false ? portalTitleObj.title : document.title,
                hrefString = "<br>==================<br>" + "Referer: <a href='" + window.location.href + "'>" + portalTitle + "</a>",
                platformString = "<br>Platform: " + navigator.platform + "<br>",
                cookiesString = "Cookies enabled: " + navigator.cookieEnabled + "<br>",
                userAgentString = "UserAgent: " + navigator.userAgent,
                systemInfo = hrefString + platformString + cookiesString + userAgentString,
                isSubjectUndefined = _.isUndefined(toolModel) === false ? _.isUndefined(toolModel.get("subject")) : true,
                subject = isSubjectUndefined === true ? "Supportanfrage zum Portal " + portalTitle : toolModel.get("subject"),
                date = new Date(),
                day = date.getUTCDate() < 10 ? "0" + date.getUTCDate().toString() : date.getUTCDate().toString(),
                month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
                ticketID = month + day + "-" + _.random(1000, 9999),
                resp = _.isUndefined(toolModel) === false ? Radio.request("RestReader", "getServiceById", toolModel.get("serviceID")) : undefined;

            if (_.isUndefined(toolModel) === false) {
                this.set(toolModel.attributes);
            }
            if (_.isUndefined(resp) === false && resp.get("url")) {
                this.setUrl(resp.get("url"));
                this.setTicketID(ticketID);
                this.setSystemInfo(this.getIncludeSystemInfo() === true ? systemInfo : "");
                this.setSubject(subject, {validate: true});
            }
        },

        setUserAttributes: function (evt) {

            switch (evt.target.id) {
                case "contactEmail": {
                    this.setUserEmail(evt.target.value);
                    break;
                }
                case "contactName": {
                    this.setUserName(evt.target.value);
                    break;
                }
                case "contactTel": {
                    this.setUserTel(evt.target.value);
                    break;
                }
                case "contactText": {
                    this.setText(evt.target.value);
                    break;
                }
            }
            this.isValid();
        },

        setStatus: function (args) {
            // Fenstermanagement
            if (args[2].getId() === "contact") {
                this.setIsCollapsed(args[1]);
                this.setIsCurrentWin(args[0]);
            }
            else {
                this.setIsCurrentWin(false);
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
            var cc = _.map(this.getCc(), _.clone), // deep copy instead of passing object by reference
                text,
                dataToSend;

            if (this.getCcToUser() === true) {
                cc.push({
                    email: this.getUserEmail(),
                    name: this.getUserName()
                });
            }
            text = "Name: " + this.getUserName() + "<br>Email: " + this.getUserEmail() + "<br>Tel: " + this.getUserTel() + "<br>==================<br>" + this.getText() + this.getSystemInfo();
            dataToSend = {
                from: this.getFrom(),
                to: this.getTo(),
                cc: cc,
                bcc: this.getBcc(),
                subject: this.getTicketID() + ": " + this.getSubject(),
                text: text
            };

            Radio.trigger("Util", "showLoader");
            $.ajax({
                url: this.getUrl(),
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
        },

        // getter for url
        getUrl: function () {
            return this.get("url");
        },

        // setter for url
        setUrl: function (value) {
            this.set("url", value);
        },

        // getter for ticketID
        getTicketID: function () {
            return this.get("ticketID");
        },

        // setter for ticketID
        setTicketID: function (value) {
            this.set("ticketID", value);
         },

         // getter for systemInfo
         getSystemInfo: function () {
            return this.get("systemInfo");
        },

         // setter for systemInfo
         setSystemInfo: function (value) {
            this.set("systemInfo", value);
        },

        // getter for includeSystemInfo
        getIncludeSystemInfo: function () {
            return this.get("includeSystemInfo");
        },
        // setter for includeSystemInfo
        setIncludeSystemInfo: function (value) {
            this.set("includeSystemInfo", value);
        },

        // getter for subject
        getSubject: function () {
            return this.get("subject");
        },

        // setter for subject
        setSubject: function (value) {
            this.set("subject", value);
        },

        // getter for isCollapsed
        getIsCollapsed: function () {
            return this.get("isCollapsed");
        },

        // setter for isCollapsed
        setIsCollapsed: function (value) {
            this.set("isCollapsed", value);
        },

        // getter for isCurrentWin
        getIsCurrentWin: function () {
            return this.get("isCurrentWin");
        },

        // setter for isCurrentWin
        setIsCurrentWin: function (value) {
            this.set("isCurrentWin", value);
        },

        // getter for userName
        getUserName: function () {
            return this.get("userName");
        },

        // setter for userName
        setUserName: function (value) {
            this.set("userName", value);
        },

        // getter for userEmail
        getUserEmail: function () {
            return this.get("userEmail");
        },

        // setter for userEmail
        setUserEmail: function (value) {
            this.set("userEmail", value);
        },

        // getter for userTel
        getUserTel: function () {
            return this.get("userTel");
        },

        // setter for userTel
        setUserTel: function (value) {
            this.set("userTel", value);
        },

        // getter for text
        getText: function () {
            return this.get("text");
        },

        // setter for text
        setText: function (value) {
            this.set("text", value);
        },

        // getter for cc
        getCc: function () {
            return this.get("cc");
        },

        // setter for cc
        setCc: function (value) {
            this.set("cc", value);
        },

        // getter for ccToUser
        getCcToUser: function () {
            return this.get("ccToUser");
        },

        // setter for ccToUser
        setCcToUser: function (value) {
            this.set("ccToUser", value);
        },

        // getter for from
        getFrom: function () {
            return this.get("from");
        },
        // setter for from
        setFrom: function (value) {
            this.set("from", value);
        },

        // getter for to
        getTo: function () {
            return this.get("to");
        },

        // setter for to
        setTo: function (value) {
            this.set("to", value);
        },

        // getter for bcc
        getBcc: function () {
            return this.get("bcc");
        },

        // setter for bcc
        setBcc: function (value) {
            this.set("bcc", value);
        }

    });

    return ContactModel;
});
