<script>
import {mapGetters, mapMutations} from "vuex";
import Tool from "../../Tool.vue";
import moment from "moment";
import {configContact} from "../store/configContact";

/**
 * contact form of the Masterportal
 * @displayName Contact
 * @fires Alerting#RadioTriggerAlertAlert
 * @fires Util#RadioTriggerUtilShowLoader
 * @fires Util#RadioTriggerUtilHideLoader
 * @fires RestReader#RadioRequestRestReaderGetServiceById
 */
export default {
    name: "Contact",
    components: {
        Tool
    },
    data () {
        return {
            username: "",
            email: "",
            phone: "",
            message: "",
            termsOfPrivacyChecked: false,

            // default data from config json
            ...configContact,
            // data from config json
            ...this.$store.state.configJson.Portalconfig.menu.contact
        };
    },
    computed: {
        ...mapGetters("Tools/Contact", ["active", "renderToWindow"]),

        /**
         * validates the username
         * @return {Boolean}  returns true if the username is valid, false if it is invalid
         */
        isValidUsername () {
            return this.username.length >= this.minUsernameLength;
        },

        /**
         * validates the email
         * @return {Boolean}  returns true if the email is valid, false if it is invalid
         */
        isValidEmail () {
            return this.email.match(this.regexEmail) !== null;
        },

        /**
         * validates the customers phone number
         * @return {Boolean}  returns true if the phone number is valid, false if it is invalid
         */
        isValidPhone () {
            return this.phone.match(this.regexPhone) !== null;
        },

        /**
         * validates the message
         * @return {Boolean}  returns true if the message is valid, false if it is invalid
         */
        isValidMessage () {
            return this.message.length >= this.minMessageLength;
        },

        /**
         * checks all fields if they are valid
         * @returns {Boolean}  true if sending a message is possible, false if no message should be send
         */
        isValidForm: function () {
            return (!this.showTermsOfPrivacy || this.termsOfPrivacyChecked)
                && this.username && this.isValidUsername
                && this.email && this.isValidEmail
                && this.phone && this.isValidPhone
                && this.message && this.isValidMessage;
        }
    },
    created () {
        this.$on("close", this.close);
        // NOTE: setActive call on created is needed for the RemoteInterface so that the Radio can be interacted with

        this.minUsernameLength = 3;
        this.regexEmail = /^[A-Z0-9._%+-]+@{1}[A-Z0-9.-]+\.{1}[A-Z]{2,7}$/igm;
        this.regexPhone = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/g;
        this.minMessageLength = 10;

        // change time to the location where customer service is based (see generateTicketId)
        moment.locale(this.locationOfCustomerService);
    },
    methods: {
        ...mapMutations("Tools/Contact", ["setActive", "setRenderToWindow"]),

        close () {
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.id});

            if (model) {
                model.set("isActive", false);
            }

            this.setActive(false);
        },

        /**
         * an async function to call for sending and receiving data from an url
         * @param {String} url the url to call
         * @param {Object} data the data to send
         * @param {Function} onsuccess a function(resp) with resp as json response of the call
         * @param {Function} onerror a function(error) with error the description of the error
         * @param {Function} oncomplete a function() to call in any case
         * @returns {Void}  -
         */
        defaultHttpClient: (url, data, onsuccess, onerror, oncomplete) => {
            /*
            // TOREMOVE: für Funktionstests kann dieser Bereich einkommentiert werden - das Senden wird dann nur simuliert
            console.log("defaultHttpClient", url, data);
            setTimeout(() => {
                onsuccess({success: true, message: "ok"});
                oncomplete();
            }, 1500);
            return;
            */
            $.ajax({
                url: url,
                data: data,
                async: true,
                type: "POST",
                cache: false,
                dataType: "json",
                context: this,
                success: response => {
                    if (typeof onsuccess === "function") {
                        onsuccess(response);
                    }
                },
                error: error => {
                    if (typeof onerror === "function") {
                        onerror(error);
                    }
                },
                complete: () => {
                    if (typeof oncomplete === "function") {
                        oncomplete();
                    }
                }
            });
        },

        /**
         * default behavior for sending an email successfully
         * @param {String} response the success message from the server
         * @param {String} ticketId the ticket id
         * @fires Alerting#RadioTriggerAlertAlert
         * @return {Void}  -
         */
        defaultOnSendSuccess: function (response, ticketId) {
            if (this.withTicketNo) {
                let msg = "";

                msg += this.$i18n.i18next.t("modules.tools.contact.successMessage") + "\r\n";
                msg += this.$i18n.i18next.t("modules.tools.contact.successTicket");
                msg += ticketId;

                Radio.trigger("Alert", "alert", msg);
            }
            else {
                Radio.trigger("Alert", "alert", this.$i18n.i18next.t("modules.tools.contact.successMessage"));
            }

            if (this.deleteAfterSend) {
                this.username = "";
                this.email = "";
                this.phone = "";
                this.message = "";
            }

            // always uncheck terms of privacy
            this.termsOfPrivacyChecked = false;

            if (this.closeAfterSend) {
                this.active = false;
            }
        },

        /**
         * default behavior on error
         * @param {String} msg the message to show to the customer using alert
         * @param {String} error the error to show on the browsers console
         * @fires Alerting#RadioTriggerAlertAlert
         * @return {Void}  -
         */
        defaultOnSendError: (msg, error) => {
            console.warn(error);
            Radio.trigger("Alert", "alert", {
                content: msg,
                category: "Warning"
            });
        },

        /**
         * default behavior for when sending starts
         * @fires Util#RadioTriggerUtilShowLoader
         * @return {Void}  -
         */
        defaultOnSendStart: () => {
            Radio.trigger("Util", "showLoader");
        },

        /**
         * default behavior for when sending has ended (called in any case)
         * @fires Util#RadioTriggerUtilHideLoader
         * @return {Void}  -
         */
        defaultOnSendComplete: () => {
            Radio.trigger("Util", "hideLoader");
        },

        /**
         * gets the email services data by service id
         * @param {String} serviceID the id of service in rest-services.json that contains the service url
         * @fires RestReader#RadioRequestRestReaderGetServiceById
         * @returns {Object}  an object with a getter to respond to url (e.g. obj.get("url")) that contains the service url
         */
        getServiceObject: function (serviceID) {
            return Radio.request("RestReader", "getServiceById", serviceID);
        },

        /**
         * creates the system info string
         * @param {String} portalTitle the portal title to use - fallback is document.title
         * @returns {Object} the system info
         */
        getSystemInfo: function (portalTitle) {
            return {
                portalTitle: portalTitle ? portalTitle : document.title,
                referrer: window.location.href,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                userAgent: navigator.userAgent
            };
        },

        /**
         * create a html text for the system info
         * @param {Object} systemInfo the system info
         * @param {String} systemInfo.portalTitle the title of the portal
         * @param {String} systemInfo.referrer the customers referrer
         * @param {String} systemInfo.platform the customers platform
         * @param {String} systemInfo.cookieEnabled are cookies enabled?
         * @param {String} systemInfo.userAgent the customers user agent
         * @return {String}  a html string to use in the email for customer service
         */
        createSystemInfo: (systemInfo) => {
            let info = "";

            info += "<br>";
            info += "==================<br>";
            info += "Referrer: <a href='" + systemInfo.referrer + "'>" + systemInfo.portalTitle + "</a><br>";
            info += "Platform: " + systemInfo.platform + "<br>";
            info += "Cookies enabled: " + systemInfo.cookieEnabled + "<br>";
            info += "UserAgent: " + systemInfo.userAgent + "<br>";

            return info;
        },

        /**
         * creates the ticketId using date. Format is "mmdd-[uniqueId]"
         * @param {String} prefixOpt the prefix of the ticketId if not given format MMDD- is used
         * @returns {String}  the generated id
         */
        createTicketId: (prefixOpt = null) => {
            const prefix = prefixOpt || moment().format("MMDD-"),
                randomNumber = String(Math.floor(Math.random() * 9000) + 1000);

            return prefix + randomNumber;
        },

        /**
         * create the subject for the email
         * @param {String} ticketId the id of the ticket
         * @param {String} subject the subject to use
         * @returns {String}  the subject to send
         */
        createSubject: (ticketId, subject) => {
            return ticketId + ": " + subject;
        },

        /**
         * creates the email message
         * @param {String} username the name of the customer
         * @param {String} email the email address of the customer
         * @param {String} phone the phone of the customer
         * @param {String} message the message to send to customer service
         * @param {String} [systemInfo=""] the system info
         * @returns {String} the message to be send
         */
        createMessage: (username, email, phone, message, systemInfo = "") => {
            let msg = "";

            msg += "Name: " + username + "<br>";
            msg += "Email: " + email + "<br>";
            msg += "Tel: " + phone + "<br>";
            msg += "==================<br>";
            msg += message + "<br>";
            msg += systemInfo;

            return msg;
        },

        /**
         * sends the data to a server
         * @param {String} url the url to send the data to (a server to send the mail via smtp)
         * @param {Object[]} from the senders email address
         * @param {Object[]} to the receivers email address
         * @param {String} subject the subject of the mail
         * @param {String} message the message to send
         * @param {Function} onsuccess the function(resp) to call on success
         * @param {Function} onerror the function(error) to call on error
         * @param {Function} oncomplete the function to call in any case
         * @param {Function} [httpClient=null] a function(url, data, onsuccess, onerror, oncomplete) to send the data with
         * @returns {Void}  -
         */
        callServer: function (url, from, to, subject, message, onsuccess, onerror, oncomplete, httpClient = null) {
            const data = {
                from: from,
                to: to,
                subject: subject,
                text: message
            };

            (httpClient || this.defaultHttpClient)(url, data, onsuccess, onerror, oncomplete);
        },

        /**
         * builds an email and sends it
         * @param {Function} [onSendStart=null] a callback function() to call before any action has taken place
         * @param {Function} [onSendSuccess=null] a callback function(response, ticketId)
         * @param {Function} [onSendError=null] a callback function(msg, error)
         * @param {Function} [onSendComplete=null] the function to call in any case
         * @param {Function} [httpClient=null] a function(url, data, onsuccess, onerror, oncomplete) for unit testing only
         * @param {Object} [serviceObjectOpt=null] an object(get:function) representing the RestReaders response for unit testing only
         * @fires Alerting#RadioTriggerAlertAlert
         * @returns {Void}  -
         */
        send: function (onSendStart = null, onSendSuccess = null, onSendError = null, onSendComplete = null, httpClient = null, serviceObjectOpt = null) {
            if (!this.isValidForm) {
                (onSendError || this.defaultOnSendError)(
                    this.$i18n.i18next.t("modules.tools.contact.errorIncompleteDeclarations"),
                    "An error occured sending an email: send with incorrect fields aborted"
                );
                (onSendComplete || this.defaultOnSendComplete)();
                return;
            }

            const systemInfo = this.getSystemInfo(this.$store.state.configJson.Portalconfig.portalTitle.title),
                subject = this.subject || (this.$i18n.i18next.t("modules.tools.contact.emailSubject") + systemInfo.portalTitle),
                ticketId = this.createTicketId(),
                message = this.createMessage(this.username, this.email, this.phone, this.message, this.includeSystemInfo ? this.createSystemInfo(systemInfo) : ""),
                emailService = serviceObjectOpt || this.getServiceObject(this.serviceID);

            if (emailService === undefined || !emailService.get("url")) {
                (onSendError || this.defaultOnSendError)(
                    this.$i18n.i18next.t("modules.tools.contact.errorMessage"),
                    "An error occured sending an email: serviceId " + this.serviceID + " is unknown to RestReader"
                );
                (onSendComplete || this.defaultOnSendComplete)();
                return;
            }

            (onSendStart || this.defaultOnSendStart)();

            this.callServer(
                emailService.get("url"),
                this.from,
                this.to,
                this.createSubject(ticketId, subject),
                message,
                (response) => {
                    // onsuccess
                    if (response.success) {
                        // on smtp success
                        (onSendSuccess || this.defaultOnSendSuccess)(response.message, ticketId);
                    }
                    else {
                        // on smtp error
                        (onSendError || this.defaultOnSendError)(
                            this.$i18n.i18next.t("modules.tools.contact.errorMessage"),
                            "An error occured sending an email - server response is: " + response.message
                        );
                    }
                },
                (error) => {
                    // onerror
                    (onSendError || this.defaultOnSendError)(
                        this.$i18n.i18next.t("modules.tools.contact.errorMessage"),
                        "An error occured sending an email: " + error
                    );
                },
                onSendComplete || this.defaultOnSendComplete,
                httpClient
            );
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('menu.contact')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
    >
        <template v-slot:toolBody>
            <div
                v-if="contactInfo"
                id="contactInfoDiv"
                class="form-group"
            >
                {{ contactInfo }}
            </div>
            <form @submit.prevent="send()">
                <div
                    :class="['form-group', 'has-feedback', isValidUsername ? 'has-success' : (!username ? '' : 'has-error')]"
                >
                    <div class="input-group">
                        <label
                            class="control-label input-group-addon"
                            for="contactInputUsername"
                        >Name</label>
                        <input
                            id="contactInputUsername"
                            v-model.lazy.trim="username"
                            type="text"
                            class="form-control"
                            aria-describedby="contactHelpUsername"
                            :placeholder="$t('modules.tools.contact.userNamePlaceholder')"
                        >
                    </div>
                    <span
                        v-show="username && !isValidUsername"
                        id="contactHelpUsername"
                        class="help-block"
                    >
                        {{ $t('modules.tools.contact.errorName') }}
                    </span>
                    <span
                        v-show="username && isValidUsername"
                        class="glyphicon glyphicon-ok form-control-feedback"
                        aria-hidden="true"
                    ></span>
                </div>
                <div
                    :class="['form-group', 'has-feedback', isValidEmail ? 'has-success' : (!email ? '' : 'has-error')]"
                >
                    <div class="input-group">
                        <label
                            class="control-label input-group-addon"
                            for="contactInputEmail"
                        >Email</label>
                        <input
                            id="contactInputEmail"
                            v-model.lazy.trim="email"
                            type="email"
                            class="form-control"
                            aria-describedby="contactHelpEmail"
                            :placeholder="$t('modules.tools.contact.emailAddressPlaceholder')"
                        >
                    </div>
                    <span
                        v-show="email && !isValidEmail"
                        id="contactHelpEmail"
                        class="help-block"
                    >
                        {{ $t('modules.tools.contact.errorEmail') }}
                    </span>
                    <span
                        v-show="email && isValidEmail"
                        class="glyphicon glyphicon-ok form-control-feedback"
                        aria-hidden="true"
                    ></span>
                </div>
                <div
                    :class="['form-group', 'has-feedback', isValidPhone ? 'has-success' : (!phone ? '' : 'has-error')]"
                >
                    <div class="input-group">
                        <label
                            class="control-label input-group-addon"
                            for="contactInputPhone"
                        >Tel.</label>
                        <input
                            id="contactInputPhone"
                            v-model.lazy.trim="phone"
                            type="tel"
                            class="form-control"
                            aria-describedby="contactHelpPhone"
                            :placeholder="$t('modules.tools.contact.telephonePlaceholder')"
                        >
                    </div>
                    <span
                        v-show="phone && !isValidPhone"
                        id="contactHelpPhone"
                        class="help-block"
                    >
                        {{ $t('modules.tools.contact.errorNumber') }}
                    </span>
                    <span
                        v-show="phone && isValidPhone"
                        class="glyphicon glyphicon-ok form-control-feedback"
                        aria-hidden="true"
                    ></span>
                </div>
                <div
                    :class="['form-group', 'has-feedback', isValidMessage ? 'has-success' : (!message ? '' : 'has-error')]"
                >
                    <textarea
                        id="contactInputMessage"
                        v-model.trim="message"
                        class="form-control"
                        :placeholder="$t('modules.tools.contact.textPlaceholder')"
                        :rows="maxLines"
                    >
                    </textarea>
                    <span
                        v-show="message && isValidMessage"
                        class="glyphicon glyphicon-ok form-control-feedback"
                        aria-hidden="true"
                    ></span>
                </div>
                <div
                    v-if="showTermsOfPrivacy"
                    id="contactTermsOfPrivacy"
                    class="form-group termsOfPrivacy"
                >
                    <label>
                        <input
                            v-model="termsOfPrivacyChecked"
                            type="checkbox"
                        >
                        <span
                            v-html="$t('modules.tools.contact.termsOfPrivacy')"
                        ></span>
                    </label>
                </div>
                <button
                    type="submit"
                    class="btn btn-default pull-right"
                    :disabled="!isValidForm"
                >
                    {{ $t('modules.tools.contact.textSendButton') }}
                </button>
            </form>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";

    label.control-label {
        min-width: 65px;
    }

    div.termsOfPrivacy {
        label, span {
            cursor: pointer;
        }
    }
</style>
