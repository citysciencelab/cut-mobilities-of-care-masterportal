import Tool from "../../core/modelList/tool/model";

const ContactModel = Tool.extend(/** @lends ContactModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        maxLines: "5",
        from: [{
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name": "LGVGeoportalHilfe"
        }],
        to: [{
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name": "LGVGeoportalHilfe"
        }],
        text: "",
        url: "",
        ticketId: "",
        systemInfo: "",
        subject: "",
        userName: "",
        userEmail: "",
        userTel: "",
        includeSystemInfo: false,
        contactInfo: "",
        glyphicon: "glyphicon-envelope",
        serviceID: undefined,
        closeAndDelete: false,
        withTicketNo: true,
        lngSwitchDetected: "",
        // translations
        textPlaceholder: "",
        userNamePlaceholder: "",
        emailAddressPlaceholder: "",
        telephonePlaceholder: "",
        errorName: "",
        errorEmail: "",
        errorNumber: "",
        textSendButton: "",
        errorMessage: "",
        successMessage: "",
        successTicket: ""
    }),

    /**
     * @class ContactModel
     * @extends Tool
     * @memberof Contact
     * @constructs
     * @property {String} maxLines="5" Number of lines for the textarea of the form
     * @property {Object[]} [from=[{"email":"lgvgeoportal-hilfe@gv.hamburg.de","name":"LGVGeoportalHilfe"}]] Default sender of email. Email object existst of:
     * @property {String} from.email Email address
     * @property {String} from.name Email name to be shown
     * @property {Object[]} [to=[{"email":"lgvgeoportal-hilfe@gv.hamburg.de","name":"LGVGeoportalHilfe"}]] Default receiver of email. Email object existst of:
     * @property {String} to.email Email address
     * @property {String} to.name Email name to be shown
     * @property {String} text="" Users text
     * @property {String} url="" Url of email service
     * @property {String} ticketId="" Generated Id of user ticket. Format "mm.dd.-[Id]"
     * @property {String} systemInfo="" System info
     * @property {String} subject="" Subject of email
     * @property {String} userName="" name of user
     * @property {String} userEmail="" email of user
     * @property {String} userTel="" telephone number of user
     * @property {Boolean} includeSystemInfo=false Flag if sytsem info should be included in email
     * @property {String} contactInfo="" Additional text that can be shown above the contact form
     * @property {String} glyphicon="glyphicon-envelope" Glyhphicon that is shown before the tool name
     * @property {String} serviceID=undefined Id of service in rest-services.json thats contains the service url
     * @property {String} lngSwitchDetected="" contains the current language, view is listening to it
     * @property {String} textPlaceholder="Bitte formulieren Sie hier Ihre Frage und drücken Sie auf &quot;Abschicken&quot;"] Placeholder for user input textarea
     * @property {String} userNamePlaceholder="", filled with "Ihr Name"- translated
     * @property {String} emailAddressPlaceholder="", filled with "Ihre Emailadresse"- translated
     * @property {String} telephonePlaceholder="", filled with "Ihre Telefonnummer"- translated
     * @property {String} errorName="", filled with "Bitte nennen Sie uns Ihren Namen."- translated
     * @property {String} errorEmail="", filled with "Bitte geben Sie eine gültige Emailadresse ein."- translated
     * @property {String} errorNumber="", filled with "Unter welcher Telefonnummer können wir Sie erreichen?"- translated
     * @property {String} textSendButton="", filled with "Abschicken"- translated
     * @property {String} errorMessage="", filled with "Emailversand fehlgeschlagen!"- translated
     * @property {String} successMessage="", filled with "Ihre Anfrage wurde erfolgreich versendet"- translated
     * @property {String} successTicket="", filled with "Ihre Ticketnummer lautet:"- translated
     * @fires Parser#RadioRequestParserGetPortalConfig
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Util#RadioTriggerUtilShowLoader
     * @fires Util#RadioTriggerUtilHideLoader
     * @fires AlertingModel#RadioTriggerAlertAlert
     * @fires ContactModel#changeIsActive
     * @fires ContactModel#changeInvalid
     */
    initialize: function () {
        this.superInitialize();
        this.setAttributes(Radio.request("Parser", "getPortalConfig"));

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function () {
        this.set({
            textPlaceholder: i18next.t("common:modules.tools.contact.textPlaceholder"),
            userNamePlaceholder: i18next.t("common:modules.tools.contact.userNamePlaceholder"),
            textSendButton: i18next.t("common:modules.tools.contact.textSendButton"),
            emailAddressPlaceholder: i18next.t("common:modules.tools.contact.emailAddressPlaceholder"),
            telephonePlaceholder: i18next.t("common:modules.tools.contact.telephonePlaceholder"),
            errorName: i18next.t("common:modules.tools.contact.errorName"),
            errorEmail: i18next.t("common:modules.tools.contact.errorEmail"),
            errorNumber: i18next.t("common:modules.tools.contact.errorNumber"),
            errorMessage: i18next.t("common:modules.tools.contact.errorMessage"),
            successMessage: i18next.t("common:modules.tools.contact.successMessage"),
            successTicket: i18next.t("common:modules.tools.contact.successTicket"),
            lngSwitchDetected: i18next.language
        });
    },

    /**
     * Creates and sets the initially needed attributes
     * @param {JSON} configJson configJson
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @returns {void}
     */
    setAttributes: function (configJson) {
        const portalTitle = configJson.hasOwnProperty("portalTitle") && configJson.portalTitle.hasOwnProperty("title") ? configJson.portalTitle.title : document.title,
            hrefString = "<br>==================<br>Referer: <a href='" + window.location.href + "'>" + portalTitle + "</a>",
            platformString = "<br>Platform: " + navigator.platform + "<br>",
            cookiesString = "Cookies enabled: " + navigator.cookieEnabled + "<br>",
            userAgentString = "UserAgent: " + navigator.userAgent,
            systemInfo = hrefString + platformString + cookiesString + userAgentString,
            subject = this.get("subject") !== "" ? this.get("subject") : "Supportanfrage zum Portal " + portalTitle,
            resp = Radio.request("RestReader", "getServiceById", this.get("serviceID")),
            closeAndDelete = this.get("deleteAfterSend"),
            withTicketNo = this.get("withTicketNo");

        this.setCloseAndDelete(Boolean(closeAndDelete));
        this.setWithTicketNo(Boolean(withTicketNo));

        if (resp !== undefined && resp.get("url")) {
            this.setUrl(resp.get("url"));
            this.setTicketId(this.generateTicketId());
            this.setSystemInfo(this.get("includeSystemInfo") === true ? systemInfo : "");
            this.setSubject(subject, {validate: true});
        }
    },

    /**
     * Generates the ticketId using date. Format is "mm.dd-[uniqueId]"
     * @returns {String} The generated id
     */
    generateTicketId: function () {
        const date = new Date(),
            day = date.getUTCDate() < 10 ? "0" + date.getUTCDate().toString() : date.getUTCDate().toString(),
            month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
            ticketId = month + day + "-" + (Math.floor(Math.random() * 9000) + 1000);

        return ticketId;
    },

    /**
     * Sets the user attributes on user input
     * @param {KeyboardEvent} evt Event fired if user makes input in form
     * @returns {void}
     */
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

    /**
     * validates the user inputs. Backbone function that is called on this.isValid()
     * @param {Object} attributes User inputs
     * @return {Boolean} Flag if validation failed or not
     */
    validate: function (attributes) {
        const userNameValid = attributes.userName !== undefined ? attributes.userName.length >= 3 : false,
            userEmailValid1 = attributes.userEmail !== undefined ? attributes.userEmail.length >= 1 : false,
            userEmailValid2 = attributes.userEmail !== undefined ? attributes.userEmail.match(/^[A-Z0-9._%+-]+@{1}[A-Z0-9.-]+\.{1}[A-Z]{2,14}$/igm) !== null : false,
            userTelValid = attributes.userTel !== undefined ? attributes.userTel.match(/^[0-9]{1}[0-9\-+()]*[0-9]$/ig) !== null : false,
            textValid = attributes.text !== undefined ? attributes.text.length >= 10 : false;

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

    /**
     * Sends the email via ajax request
     * @fires Util#RadioTriggerUtilShowLoader
     * @fires Util#RadioTriggerUtilHideLoader
     * @fires AlertingModel#RadioTriggerAlertAlert
     * @returns {void}
     */
    send: function () {
        const closeAndDelete = this.get("closeAndDelete"),
            withTicketNo = this.get("withTicketNo");

        let text = "",
            dataToSend = {};

        text = "Name: " + this.get("userName") + "<br>Email: " + this.get("userEmail") + "<br>Tel: " + this.get("userTel") + "<br>==================<br>" + this.get("text") + this.get("systemInfo");
        dataToSend = {
            from: this.get("from"),
            to: this.get("to"),
            subject: this.get("ticketId") + ": " + this.get("subject"),
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
                    Radio.trigger("Alert", "alert", {text: "<strong>" + this.get("errorMessage") + "</strong> " + jqXHR.statusText + " (" + jqXHR.status + ")", kategorie: "alert-danger"});
                }
            },
            success: function (data) {
                if (data.success === false) {
                    Radio.trigger("Alert", "alert", {text: data.message, kategorie: "alert-warning"});
                }
                else {
                    if (withTicketNo === false) {
                        Radio.trigger("Alert", "alert", {text: this.get("successMessage"), kategorie: "alert-success"});
                    }
                    else {
                        Radio.trigger("Alert", "alert", {text: data.message + "<br>" + this.get("successTicket") + "<strong>" + this.get("ticketId") + "</strong>.", kategorie: "alert-success"});
                    }
                    if (closeAndDelete === true) {
                        Radio.trigger("WindowView", "hide");
                        this.cleanFields();
                    }
                }
            }
        });
    },

    /**
     * Resets the form after successfull sending
     * @returns {void}
     */
    cleanFields: function () {
        this.setUserName("");
        this.setUserEmail("");
        this.setUserTel("");
        this.setText("");
    },

    /**
     * Setter for url
     * @param {String} value url
     * @returns {void}
     */
    setUrl: function (value) {
        this.set("url", value);
    },

    /**
     * Setter for ticketId
     * @param {String} value ticketId
     * @returns {void}
     */
    setTicketId: function (value) {
        this.set("ticketId", value);
    },

    /**
     * Setter for systemInfo
     * @param {String} value systemInfo
     * @returns {void}
     */
    setSystemInfo: function (value) {
        this.set("systemInfo", value);
    },

    /**
     * Setter for includeSystemInfo
     * @param {Boolean} value includeSystemInfo
     * @returns {void}
     */
    setIncludeSystemInfo: function (value) {
        this.set("includeSystemInfo", value);
    },

    /**
     * Setter for subject
     * @param {String} value subject
     * @returns {void}
     */
    setSubject: function (value) {
        this.set("subject", value);
    },

    /**
     * Setter for userName
     * @param {String} value userName
     * @returns {void}
     */
    setUserName: function (value) {
        this.set("userName", value);
    },

    /**
     * Setter for userEmail
     * @param {String} value userEmail
     * @returns {void}
     */
    setUserEmail: function (value) {
        this.set("userEmail", value);
    },

    /**
     * Setter for userTel
     * @param {String} value userTel
     * @returns {void}
     */
    setUserTel: function (value) {
        this.set("userTel", value);
    },

    /**
     * Setter for text
     * @param {String} value text
     * @returns {void}
     */
    setText: function (value) {
        this.set("text", value);
    },

    /**
     * Setter for from
     * @param {Object[]} value from
     * @returns {void}
     */
    setFrom: function (value) {
        this.set("from", value);
    },

    /**
     * Setter for to
     * @param {Object[]} value to
     * @returns {void}
     */
    setTo: function (value) {
        this.set("to", value);
    },

    /**
     * Setter for closeAndDelete
     * @param {Boolean} value true: close and delete contact after send, false: do not close after send
     * @returns {void}
     */
    setCloseAndDelete: function (value) {
        this.set("closeAndDelete", value);
    },
    /**
     * Setter for withTicketNo
     * @param {Boolean} value true: use Ticket Number, false: do not use Ticket Number
     * @returns {void}
     */
    setWithTicketNo: function (value) {
        this.set("withTicketNo", value);
    }
});

export default ContactModel;
