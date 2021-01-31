import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateContact";
import {minMessageLength, minUsernameLength, regexMail, regexPhone} from "./constantsContact";

const getters = {
    ...generateSimpleGetters(initialState),
    validForm: ({showTermsOfPrivacy, privacyPolicyChecked},
        {validMail, validMessage, validPhone, validUsername}) => (!showTermsOfPrivacy || privacyPolicyChecked) && validMail && validMessage && validPhone && validUsername,
    validMail: ({mail}) => regexMail.test(mail),
    validMessage: ({message}) => message.length > minMessageLength,
    validPhone: ({phone}) => regexPhone.test(phone),
    validUsername: ({username}) => username.length > minUsernameLength
};

export default getters;
