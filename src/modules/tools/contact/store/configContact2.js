/**
 * default config.json values for Contact component
 * diese configContact ist vorbereitet auf die Verwendung als props - ansonsten identisch mit configContact.js
 */
export const configContact = {
    /**
     * the id of service in rest-services.json that contains the service url
     */
    serviceID: {
        type: String,
        required: true
    },
    /**
     * the time zone the customer service is based (used for date in ticketId)
     */
    locationOfCustomerService: {
        type: String,
        required: false,
        default: "de"
    },
    /**
     * the icon that is shown in the title bar of the tool
     */
    glyphicon: {
        type: String,
        required: false,
        default: "glyphicon-envelope"
    },
    /**
     * number of lines (the height) for the textarea of the form
     */
    maxLines: {
        type: Number,
        required: false,
        default: 5
    },
    /**
     * flag to close gfi first
     */
    deactivateGFI: {
        type: Boolean,
        required: false,
        default: true
    },
    /**
     * default sender of email as array of objects
     * @property {String} email the email address
     * @property {String} name the email name to be shown
     */
    from: {
        type: Array,
        required: false,
        default: [
            {
                email: "lgvgeoportal-hilfe@gv.hamburg.de",
                name: "LGVGeoportalHilfe"
            }
        ]
    },
    /**
     * default receiver of email as array of objects
     * @property {String} email the email address
     * @property {String} name the email name to be shown
     */
    to: {
        type: Array,
        required: false,
        default: [
            {
                email: "lgvgeoportal-hilfe@gv.hamburg.de",
                name: "LGVGeoportalHilfe"
            }
        ]
    },
    /**
     * the subject for the email - if no subject is given the default subject is used
     */
    subject: {
        type: String,
        required: false,
        default: ""
    },
    /**
     * flag if system info should be included in email
     */
    includeSystemInfo: {
        type: Boolean,
        required: false,
        default: false
    },
    /**
     * flag if input fields should be emptied after send
     */
    deleteAfterSend: {
        type: Boolean,
        required: false,
        default: true
    },
    /**
     * flag if contact window should be closed after send
     */
    closeAfterSend: {
        type: Boolean,
        required: false,
        default: true
    },
    /**
     * flag if ticket number should be communicated to the customer after send
     */
    withTicketNo: {
        type: Boolean,
        required: false,
        default: true
    },
    /**
     * flag if a checkbox should be shown and be mandatory for agreeing to the terms of privacy
     */
    showTermsOfPrivacy: {
        type: Boolean,
        required: false,
        default: false
    },
    /**
     * additional info text shown on top of the contact form
     */
    contactInfo: {
        type: String,
        required: false,
        default: ""
    }
};
