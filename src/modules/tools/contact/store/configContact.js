/**
 * default config.json values for Contact component
 * @property {String} serviceID the id of service in rest-services.json that contains the service url
 * @property {String} [locationOfCustomerService="de"] the time zone the customer service is based (used for date in ticketId)
 * @property {String} [glyphicon="glyphicon-envelope"] the icon that is shown in the title bar of the tool
 * @property {Number} [maxLines=5] number of lines (the height) for the textarea of the form
 * @property {Boolean} [deactivateGFI=true] flag to close gfi first
 * @property {Object[]} from default sender of email
 * @property {String} from.email the email address
 * @property {String} from.name the email name to be shown
 * @property {Object[]} to default receiver of email
 * @property {String} to.email the email address
 * @property {String} to.name the email name to be shown
 * @property {String} [subject=""] the subject for the email - if no subject is given the default subject is used
 * @property {Boolean} [includeSystemInfo=false] flag if system info should be included in email
 * @property {Boolean} [deleteAfterSend=false] flag if input fields should be emptied after send
 * @property {Boolean} [closeAfterSend=false] flag if contact window should be closed after send
 * @property {Boolean} [withTicketNo=true] flag if ticket number should be communicated to the customer after send
 * @property {Boolean} [showTermsOfPrivacy=true] flag if a checkbox should be shown for agreeing to the terms of privacy
 * @property {String} [contactInfo=""] additional text shown above the contact form
 */
export const configContact = {
    serviceID: undefined,
    locationOfCustomerService: "de",
    glyphicon: "glyphicon-envelope",
    maxLines: 5,
    deactivateGFI: true,
    from: [
        {
            email: "lgvgeoportal-hilfe@gv.hamburg.de",
            name: "LGVGeoportalHilfe"
        }
    ],
    to: [
        {
            email: "lgvgeoportal-hilfe@gv.hamburg.de",
            name: "LGVGeoportalHilfe"
        }
    ],
    subject: "",
    includeSystemInfo: false,
    deleteAfterSend: true,
    closeAfterSend: true,
    withTicketNo: true,
    showTermsOfPrivacy: false,
    contactInfo: ""
};
