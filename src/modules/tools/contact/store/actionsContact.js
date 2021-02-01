import {createMessage, createSubject, createTicketId} from "../utils/createFunctions";
import {httpClient, onSendComplete} from "../utils/messageFunctions";

/**
 * Retrieves and returns the url of the mail service.
 *
 * @param {String} id Id of the backend e-mail service.
 * @fires RestReader#RadioRequestRestReaderGetServiceById
 * @returns {?String} Returns the url of the mail service if it is configured.
 */
function getServiceUrl (id) {
    return Radio.request("RestReader", "getServiceById", id)?.get("url");
}

const actions = {
    /**
     * Retrieves information about the system of the user and
     * commits it to the state.
     *
     * @returns {void}
     */
    getSystemInfo: ({commit, rootState}) => {
        const title = rootState.configJson.Portalconfig?.portalTitle?.title,
            {platform, cookieEnabled, userAgent} = navigator;

        commit("setSystemInfo", {
            portalTitle: title ? title : document.title,
            referrer: window.location.href,
            platform,
            cookieEnabled,
            userAgent
        });
    },
    /**
     * This action gets called after an e-mail has successfully been sent.
     * If configured, the ticketId is included in the Alert for the user.
     * If configured, the input is cleared and the tool is closed afterwards.
     *
     * @param {String} ticketId The unique id of the ticket for the e-mail.
     * @return {void}
     */
    onSendSuccess: ({state, commit, dispatch}, ticketId) => {
        const {closeAfterSend, deleteAfterSend, withTicketNo} = state;
        let content = i18next.t("common:modules.tools.contact.successMessage");

        if (withTicketNo) {
            content += "\r\n";
            content += i18next.t("common:modules.tools.contact.successTicket");
            content += ticketId;
        }
        dispatch("Alerting/addSingleAlert", {content}, {root: true});

        // Always uncheck the privacy policy
        commit("setPrivacyPolicyChecked", false);

        if (deleteAfterSend) {
            commit("setMail", "");
            commit("setMessage", "");
            commit("setPhone", "");
            commit("setUsername", "");
        }
        if (closeAfterSend) {
            commit("setActive", false);
        }
    },
    /**
     * Builds a HTML E-Mail and sends it via the backend mail server.
     *
     * @returns {void}
     */
    send: async ({state, dispatch, getters}) => {
        const content = i18next.t("common:modules.tools.contact.errorMessage"),
            {to, from, serviceId, serviceID} = state;
        let id = serviceId,
            data = null,
            mailService = null,
            ticketId = "";

        if (!getters.validForm) {
            console.warn("An error occurred sending an email: send with incorrect fields aborted");
            dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.tools.contact.errorIncompleteDeclarations"), category: "Warning"}, {root: true});
            onSendComplete();
            return;
        }
        if (serviceID !== "") {
            console.warn("Contact: The parameter 'serviceID' is deprecated in the next major release! Please use serviceId instead.");
            id = serviceID;
        }

        dispatch("getSystemInfo");

        ticketId = createTicketId();
        mailService = getServiceUrl(state);
        data = {
            from,
            to,
            subject: createSubject(ticketId, state.subject || (i18next.t("common:modules.tools.contact.mailSubject") + state.systemInfo.portalTitle)),
            text: createMessage(state)
        };

        if (mailService === undefined) {
            console.warn(`"An error occurred sending an e-mail: serviceId ${id} is unknown to the RestReader.`);
            dispatch("Alerting/addSingleAlert", {content, category: "Warning"}, {root: true});
            onSendComplete();
            return;
        }

        // Show the loader when the dispatch of the e-mail is initiated.
        Radio.trigger("Util", "showLoader");
        httpClient(
            mailService,
            data,
            response => {
                if (response.success) {
                    dispatch("onSendSuccess", ticketId);
                }
                else {
                    console.warn(`An error occured sending an email - server response is: ${response.message}`);
                    dispatch("Alerting/addSingleAlert", {content, category: "Warning"}, {root: true});
                    onSendComplete();
                }
            },
            err => {
                console.warn(`An error occurred sending an email: ${err}`);
                dispatch("Alerting/addSingleAlert", {content, category: "Warning"}, {root: true});
                onSendComplete();
            }
        );
    }
};

export default actions;
