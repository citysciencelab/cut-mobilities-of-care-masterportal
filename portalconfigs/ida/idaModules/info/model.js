define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        ContactModel;

    ContactModel = Backbone.Model.extend({
        defaults: {
            // Id für den PHP Email Service
            serviceId: "80001",
            // Eindeutige Ticketnummer
            ticketId: "",
            // Flag, ob zusätzlich Systeminformationen mit verschickt werden
            includeSystemInfo: true,
            from: [{
                  "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                  "name": "LGVGeoportalHilfe"
                }],
            to: [{
                  "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                  "name": "LGVGeoportalHilfe"
                }],
            // E-Mail-Adressen an die eine Kopie der E-Mail gesendet wird
            carbonCopy: [],
            // Flag, ob eine Kopie der Mail an den User gesendet wird
            ccToUser: false,
            bcc: [],
            textPlaceholder: "Bitte formulieren Sie hier Ihre Frage und drücken Sie auf Abschicken",
            subject: "Fragen zu IDA.HH der ImmobilienwertDatenAuskunft Hamburg",
            // Name vom User
            userName: "",
            // E-Mail-Adresse User
            userEmail: "",
            // Telefonnummer User
            userTel: "",
            // Text der E-Mail
            userText: "",
            isInternetOrDev: false
        },

        /**
         * Prüft ob in der Config entsprechende Paramter gesetzt sind
         * und ob Systeminformationen mit versendet werden sollen
         */
        initialize: function () {
            var channel = Radio.channel("Info");

            channel.on({
                "setNavStatus": this.setNavStatus
            }, this);

            if (_.has(Config, "contact") === true) {
                this.overwriteDefaults();
            }

            if (this.getIncludeSystemInfo() === true) {
                this.collectSystemInfo();
            }
        },

        /**
         * Überschreibt defaults mit den Werten aus der Config
         */
        overwriteDefaults: function () {
            _.each(Config.contact, function (value, key) {
                this.set(key, value);
            }, this);
        },

        setNavStatus: function (newStatus) {
            var elementFound = false;

            if (newStatus === "navbar-6-download") {
                var downloadButton = $("#navbar").find("#navbar-6-download button");

                $(downloadButton).attr("disabled", false);
                $(downloadButton).addClass("active");
            }
            else if (newStatus === "navbar-5-payment") {
                var downloadButton = $("#navbar").find("#navbar-5-payment button");

                $(downloadButton).attr("disabled", false);
                $(downloadButton).addClass("active");
            }
            else {
                $("#navbar").children().each(function (index, element) {
                    var button = $(element).find("button");

                    // setze Standard-Button
                    $(button).attr("disabled", false);
                    $(button).removeClass("active");

                    if (newStatus === element.id) {
                        // aktiver Button
                        elementFound = true;
                        $(button).addClass("active");
                    }
                    else {
                        if (elementFound === true) {
                            // dem aktiven folgende Button
                            $(button).attr("disabled", true);
                        }
                    }
                });
            }
        },
        /**
         * Sammelt alle systemrelevanten Informationen zusammen,
         * die mit der E-Mail verschickt werden
         */
        collectSystemInfo: function () {
            var hrefString = "<br>==================<br>" + "Referer: <a href='" + window.location.href + "'>" + document.title + "</a>",
                platformString = "<br>Platform: " + navigator.platform + "<br>",
                cookiesString = "Cookies enabled: " + navigator.cookieEnabled + "<br>",
                userAgentString = "UserAgent: " + navigator.userAgent,
                systemInfo = hrefString + platformString + cookiesString + userAgentString;

            this.setSystemInfo(systemInfo);
        },

        /**
         * Erstellt eine eindeutige Ticket-Id
         */
        createTicketId: function () {
            var date = new Date(),
                day = date.getUTCDate() < 10 ? "0" + date.getUTCDate().toString() : date.getUTCDate().toString(),
                month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
                ticketId = month + day + "-" + _.random(1000, 9999);

            this.setTicketId(ticketId);
        },

        /**
         * Prüft ob eine Kopie der E-Mail an den User geschickt werden soll
         * Abhängig davon wird das Attribut "carbonCopy" gesetzt
         */
        checkCcToUser: function () {
            if (this.get("ccToUser") === true) {
                this.push("carbonCopy", {
                    email: this.get("userEmail"),
                    name: this.get("userName")
                });
            }
        },

        /**
         * Sammelt die benötigten Daten zusammen
         * und schickt den Request an den E-Mail-Sever
         */
        send: function () {
            var resp = Radio.request("RestReader", "getServiceById", this.get("serviceId")),
                dataToSend = {
                    from: this.get("from"),
                    to: this.get("to"),
                    cc: this.getCarbonCopy(),
                    bcc: this.get("bcc"),
                    subject: this.getTicketId() + ": " + this.get("subject"),
                    text: "Name: " + this.getUserName() + "<br>Email: " + this.getUserEmail() + "<br>Tel: " + this.getUserTel() + "<br>==================<br>" + this.getUserText() + this.getSystemInfo()
                };

            $.ajax({
                url: resp.get("url"),
                data: dataToSend,
                async: true,
                type: "POST",
                cache: false,
                dataType: "json",
                success: this.successFunction,
                error: this.errorFunction,
                complete: this.completeFunction,
                context: this
            });
        },

        /**
         * Succes-Funktion für den Request
         * @param  {Object} data - response
         */
        successFunction: function (data) {
            if (data.success === false) {
                Radio.trigger("Alert", "alert", {
                    text: data.message,
                    kategorie: "alert-warning"
                });
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: data.message + "<br>Ihre Ticketnummer lautet: <strong>" + this.getTicketId() + "</strong>.",
                    kategorie: "alert-success"
                });
            }
        },

        /**
         * Error-Funktion für den Request
         * @param  {Object} jqXHR
         */
        errorFunction: function () {
            Radio.trigger("Alert", "alert", {
                text: "<strong>Emailversandt fehlgeschlagen!</strong> " +
                    "Bitte versuche Sie es erneut.",
                kategorie: "alert-danger"
            });
        },

        /**
         * complete-Funktion für den Request
         */
        completeFunction: function () {
            this.trigger("hideModal");
        },

        /**
         * @param  {Object} attributes - alle Attribute des Models
         * @return {Object || Boolean}
         */
        validate: function (attributes) {
            var userNameValid1 = attributes.userName.length >= 3,
                userNameValid2 = !(/[\\/&;´`"']/.test(attributes.userName)),
                userEmailValid1 = attributes.userEmail.length >= 1,
                userEmailValid2 = attributes.userEmail.match(/^[A-Z0-9\.\_\%\+\-]+@{1}[A-Z0-9\.\-]+\.{1}[A-Z]{2,4}$/igm) === null ? false : true,
                userTelValid = attributes.userTel.match(/^[0-9]{1}[0-9\-\+\(\)]*[0-9]$/ig) === null ? false : true,
                textValid1 = attributes.userText.length >= 10,
                textValid2 = !(/[\\/&´`"']/.test(attributes.userText));

            if (userNameValid1 === false || userNameValid2 === false || userEmailValid1 === false || userEmailValid2 === false || userTelValid === false || textValid1 === false || textValid2 === false) {
                return {
                    userName: userNameValid1 === true && userNameValid2 === true ? true : false,
                    userEmail: userEmailValid1 === true && userEmailValid2 === true ? true : false,
                    userTel: userTelValid,
                    userText: textValid1 === true && textValid2 === true ? true : false
                };
            }
            else {
                return true;
            }
        },
        /**
         * Getter für das Attribut "carbonCopy"
         * @return {Object[]} - Objekte beinhalten Name und E-Mail-Adresse
         */
        getCarbonCopy: function () {
            return this.get("carbonCopy");
        },

        /**
         * Getter für das Attribut "includeSystemInfo"
         * @return {Boolean}
         */
        getIncludeSystemInfo: function () {
            return this.get("includeSystemInfo");
        },

        /**
         * Setter für das Attribut "systemInfo"
         * @param  {Object} value - alle relevanten Systeminformationen
         */
        setSystemInfo: function (value) {
            this.set("systemInfo", value);
        },

        /**
         * Getter für das Attribut "systemInfo"
         * @return {Object}
         */
        getSystemInfo: function () {
            return this.get("systemInfo");
        },

        /**
         * Setter für das Attribut "ticketId"
         * @param  {String} value
         */
        setTicketId: function (value) {
            this.set("ticketId", value);
        },

        /**
         * Getter für das Attribut "ticketId"
         * @return {String}
         */
        getTicketId: function () {
            return this.get("ticketId");
        },

        /**
         * Setter für das Attribut "userEmail"
         * @return {String}
         */
        setUserEmail: function (value) {
            this.set("userEmail", value);
        },

        /**
         * Getter für das Attribut "userEmail"
         * @return {String}
         */
        getUserEmail: function () {
            return this.get("userEmail");
        },

        /**
         * Setter für das Attribut "userName"
         * @return {String}
         */
        setUserName: function (value) {
            this.set("userName", value);
        },

        /**
         * Getter für das Attribut "userName"
         * @return {String}
         */
        getUserName: function () {
            return this.get("userName");
        },

        /**
         * Setter für das Attribut "userTel"
         * @return {String}
         */
        setUserTel: function (value) {
            this.set("userTel", value);
        },

        /**
         * Getter für das Attribut "userTel"
         * @return {String}
         */
        getUserTel: function () {
            return this.get("userTel");
        },

        /**
         * Setter für das Attribut "userText"
         * @return {String}
         */
        setUserText: function (value) {
            this.set("userText", value);
        },

        /**
         * Getter für das Attribut "userText"
         * @return {String}
         */
        getUserText: function () {
            return this.get("userText");
        },

        /**
         * @desc Hilfsmethode um ein Attribut vom Typ Array zu setzen.
         * @param {String} attribute - Das Attribut das gesetzt werden soll.
         * @param {whatever} value - Der Wert des Attributs.
         */
        push: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        }
    });

    return ContactModel;
});
