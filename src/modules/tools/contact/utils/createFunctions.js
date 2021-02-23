import moment from "moment";

/**
 * Creates HTML for the system information.
 * @param {String} systemInfo Information about the system which the user uses.
 * @return {String} An HTML String to be used as part of the E-Mail.
 */
function createSystemInfo (systemInfo) {
    let info = "";

    info += "<br>";
    info += "==================<br>";
    info += `Referrer: <a href="${systemInfo.referrer}">${systemInfo.portalTitle}</a><br>`;
    info += `Platform: ${systemInfo.platform}<br>`;
    info += `Cookies enabled: ${systemInfo.cookieEnabled}<br>`;
    info += `UserAgent: ${systemInfo.userAgent}<br>`;

    return info;
}

/**
 * Creates HTML with the message of the user.
 * Includes the username, mail-address, phone number and, if configured, information about the system of the user.
 *
 * @param {Object} state VueX state object of the contact tool.
 * @param {String} state.username Name of the user.
 * @param {String} state.mail E-Mail-Address of the user.
 * @param {String} state.phone Phone number of the user.
 * @param {String} state.message Message the user wants to be sent.
 * @param {Boolean} state.includeSystemInfo If true, information about the system of the user is included.
 * @param {?ContactSystemInfo} systemInfo Information about the system of the user.
 * @returns {String} The prepared message as HTML.
 */
function createMessage ({username, mail, phone, message}, systemInfo) {
    let msg = "";

    msg += `Name: ${username}<br>`;
    msg += `E-Mail: ${mail}<br>`;
    msg += `Tel.:: ${phone}<br>`;
    msg += "==================<br>";
    msg += `${message}<br>`;
    msg += systemInfo ? createSystemInfo(systemInfo) : "";

    return msg;
}

/**
 * Creates the subject of the E-Mail.
 *
 * @param {String} ticketId The unique Id of the ticket.
 * @param {String} subject The subject that was configured.
 * @returns {String} The subject that will be used for the E-Mail.
 */
function createSubject (ticketId, subject) {
    return `${ticketId}: ${subject}`;
}

/**
 * Creates a unique id for the ticket of a user.
 * It is formatted as 'MMDD-[numbers]-[numbers]', if not prefix is given.
 * @param {String} locationOfCustomerService locale key for moment
 * @returns {String} The generated unique Id.
 */
function createTicketId (locationOfCustomerService = "de") {
    const prefix = moment().locale(locationOfCustomerService).format("MMDD"),
        randomNumber = String(Math.floor(Math.random() * 9000) + 1000),
        anotherRandomNumber = String(Math.floor(Math.random() * 9000) + 1000);

    return prefix + "-" + randomNumber + "-" + anotherRandomNumber;
}

export {
    createMessage,
    createSubject,
    createTicketId
};
