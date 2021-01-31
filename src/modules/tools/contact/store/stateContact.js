// TODO: Check all the changed parameters and give information, that the old one is deprecated
// TODO: Update the tests
/**
 * Contact tool state definition.
 * @typedef {Object} ContactState
 * @property {Boolean} active If true, SaveSelection will be rendered.
 * @property {String} id Id of the Contact component.
 * @property {String} name Displayed as the title. (config-param)
 * @property {String} glyphicon Icon next to the title. (config-param)
 * @property {Boolean} renderToWindow If true, tool is rendered in a window, else in the sidebar. (config-param)
 * @property {Boolean} resizableWindow If true, window is resizable. (config-param)
 * @property {Boolean} isVisibleInMenu If true, tool is selectable in menu. (config-param)
 * @property {Boolean} deactivateGFI Flag if tool should deactivate GFI. (config-param)
 * TODO(roehlipa): Take a closer look at the to and from parts, as they should not have the lgv-mails --> these should be required and empty in state at first
 * @property {Object[]} from Default sender for the e-mail. (config-param)
 * @property {String} from.email The mail address. (config-param)
 * @property {String} from.name The name to be displayed for the mail address. (config-param)
 * @property {Object[]} to Default recipient of the e-mail. (config-param)
 * @property {String} to.email The mail address. (config-param)
 * @property {String} to.name The name to be displayed for the mail address. (config-param)
 * @property {String} serviceId The id of the service (rest-services.json) that contains the url of the mail service. (config-param)
 * @property {Boolean} [closeAfterSend=false] Flag if the contact window should be closed after an E-Mail has been sent. (config-param)
 * @property {String} [contactInfo=""] Additional text shown above the contact form. (config-param)
 * @property {Boolean} [deleteAfterSend=false] Flag if the input fields should be emptied after an E-Mail has been sent. (config-param)
 * @property {Boolean} [includeSystemInfo=false] Flag if information of the the system of the user should be included in the E-Mail. (config-param)
 * @property {String} [locationOfCustomerService="de"] The timezone the customer service is based in. The parameter is used for the date in the ticketId. (config-param)
 * @property {Number} [maxLines=5] Amount of lines (height) for the textArea of the form. (config-param)
 * @property {Boolean} [showTermsOfPrivacy=true] Flag if a checkbox should be displayed for agreeing to the privacy policy. (config-param) TODO(roehlipa): Deprecate this and change it to showPrivacyPolicy
 * @property {String} [subject=""] The subject to be used for the E-Mail. (config-param)
 * @property {Boolean} [withTicketNo=true] Flag if the ticketId should be shown to the user after an E-Mail has been sent. (config-param)
 * @property {String} mail TODO
 * @property {String} message TODO
 * @property {Boolean} privacyPolicyChecked TODO
 * @property {String} phone TODO
 * @property {String} username TODO
 * @property {?Object} systemInfo TODO
 */
const state = {
    active: false,
    id: "contact",
    // defaults for config.json tool parameters
    name: "common:menu.contact",
    glyphicon: "glyphicon-envelope",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    closeAfterSend: true,
    contactInfo: "",
    deleteAfterSend: true,
    from: [
        {
            email: "lgvgeoportal-hilfe@gv.hamburg.de",
            name: "LGVGeoportalHilfe"
        }
    ],
    includeSystemInfo: false,
    locationOfCustomerService: "de",
    maxLines: 5,
    serviceId: null,
    showTermsOfPrivacy: false,
    subject: "",
    to: [
        {
            email: "lgvgeoportal-hilfe@gv.hamburg.de",
            name: "LGVGeoportalHilfe"
        }
    ],
    withTicketNo: true,
    // contact state
    mail: "",
    message: "",
    privacyPolicyChecked: false,
    phone: "",
    username: "",
    systemInfo: null
};

export default state;
