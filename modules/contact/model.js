import Tool from "../core/modelList/tool/model";

const ContactModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
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
        contactInfo: "",
        portalConfig: {},
        renderToWindow: true,
        glyphicon: "glyphicon-envelope"
    }),
    initialize: function () {
        this.superInitialize();
        this.setPortalConfig(Radio.request("Parser", "getPortalConfig"));
        this.setAttributes();
    },
    setAttributes: function () {
        var portalConfig = _.has(this.get("portalConfig"), "portalTitle") ? this.get("portalConfig") : "",
            portalTitle = _.has(portalConfig.portalTitle, "title") ? portalConfig.portalTitle.title : document.title,
            hrefString = "<br>==================<br>Referer: <a href='" + window.location.href + "'>" + portalTitle + "</a>",
            platformString = "<br>Platform: " + navigator.platform + "<br>",
            cookiesString = "Cookies enabled: " + navigator.cookieEnabled + "<br>",
            userAgentString = "UserAgent: " + navigator.userAgent,
            systemInfo = hrefString + platformString + cookiesString + userAgentString,
            isSubjectUndefined = _.isUndefined(this) === false ? _.isUndefined(this.get("subject")) : true,
            subject = isSubjectUndefined === true ? "Supportanfrage zum Portal " + portalTitle : this.get("subject"),
            date = new Date(),
            day = date.getUTCDate() < 10 ? "0" + date.getUTCDate().toString() : date.getUTCDate().toString(),
            month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
            ticketID = month + day + "-" + _.random(1000, 9999),
            resp = _.isUndefined(this) === false ? Radio.request("RestReader", "getServiceById", this.get("serviceID")) : undefined;

        if (_.isUndefined(resp) === false && resp.get("url")) {
            this.setUrl(resp.get("url"));
            this.setTicketID(ticketID);
            this.setSystemInfo(this.get("includeSystemInfo") === true ? systemInfo : "");
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
            default: {
                break;
            }
        }
        this.isValid();
    },

    validate: function (attributes) {
        var userNameValid = _.isUndefined(attributes.userName) === false ? attributes.userName.length >= 3 : false,
            userEmailValid1 = _.isUndefined(attributes.userEmail) === false ? attributes.userEmail.length >= 1 : false,
            userEmailValid2 = _.isUndefined(attributes.userEmail) === false ? attributes.userEmail.match(/^[A-Z0-9._%+-]+@{1}[A-Z0-9.-]+\.{1}[A-Z]{2,4}$/igm) !== null : false,
            userTelValid = _.isUndefined(attributes.userTel) === false ? attributes.userTel.match(/^[0-9]{1}[0-9\-+()]*[0-9]$/ig) !== null : false,
            textValid = _.isUndefined(attributes.text) === false ? attributes.text.length >= 10 : false;

        if (userNameValid === false || userEmailValid1 === false || userEmailValid2 === false || userTelValid === false || textValid === false) {
            return {
                userName: userNameValid,
                userEmail: Boolean(userEmailValid1 === true && userEmailValid2 === true),
                userTel: userTelValid,
                text: textValid
            };
        }

        return true;

    },

    send: function () {
        var cc = _.map(this.get("cc"), _.clone), // deep copy instead of passing object by reference
            text,
            dataToSend;

        if (this.get("ccToUser") === true) {
            cc.push({
                email: this.get("userEmail"),
                name: this.get("userName")
            });
        }
        text = "Name: " + this.get("userName") + "<br>Email: " + this.get("userEmail") + "<br>Tel: " + this.get("userTel") + "<br>==================<br>" + this.get("text") + this.get("systemInfo");
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
    },

    // setter for url
    setUrl: function (value) {
        this.set("url", value);
    },

    // setter for ticketID
    setTicketID: function (value) {
        this.set("ticketID", value);
    },

    // setter for systemInfo
    setSystemInfo: function (value) {
        this.set("systemInfo", value);
    },

    // setter for includeSystemInfo
    setIncludeSystemInfo: function (value) {
        this.set("includeSystemInfo", value);
    },

    // setter for subject
    setSubject: function (value) {
        this.set("subject", value);
    },

    // setter for isCollapsed
    setIsCollapsed: function (value) {
        this.set("isCollapsed", value);
    },

    // setter for isCurrentWin
    setIsCurrentWin: function (value) {
        this.set("isCurrentWin", value);
    },

    // setter for userName
    setUserName: function (value) {
        this.set("userName", value);
    },

    // setter for userEmail
    setUserEmail: function (value) {
        this.set("userEmail", value);
    },

    // setter for userTel
    setUserTel: function (value) {
        this.set("userTel", value);
    },

    // setter for text
    setText: function (value) {
        this.set("text", value);
    },

    // setter for cc
    setCc: function (value) {
        this.set("cc", value);
    },

    // setter for ccToUser
    setCcToUser: function (value) {
        this.set("ccToUser", value);
    },

    // setter for from
    setFrom: function (value) {
        this.set("from", value);
    },

    // setter for to
    setTo: function (value) {
        this.set("to", value);
    },

    // setter for bcc
    setBcc: function (value) {
        this.set("bcc", value);
    },

    // setter for portalConfig
    setPortalConfig: function (value) {
        this.set("portalConfig", value);
    }

});

export default ContactModel;
