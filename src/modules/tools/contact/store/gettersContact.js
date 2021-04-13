import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateContact";
import {minMessageLength, regexMail, regexPhone, regexUsername} from "./constantsContact";

const getters = {
    ...generateSimpleGetters(initialState),
    validForm: (
        {showPrivacyPolicy, privacyPolicyAccepted},
        {validMail, validMessage, validPhone, validUsername}
    ) => (!showPrivacyPolicy || privacyPolicyAccepted) &&
        validMail &&
        validMessage &&
        validPhone &&
        validUsername,
    validMail: ({mail}) => regexMail.test(mail),
    validMessage: ({message}) => message.length >= minMessageLength,
    validPhone: ({phone}) => regexPhone.test(phone),
    validUsername: ({username}) => regexUsername.test(username)
};

export default getters;
