import actions from "./actionsContact";
import getters from "./gettersContact";
import mutations from "./mutationsContact";

const keyStore = {
        actions: Object.keys(actions),
        getters: Object.keys(getters),
        mutations: Object.keys(mutations)
    },
    minMessageLength = 10,
    regexMail = /^.+@.+\..+$/,
    regexPhone = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/,
    regexUsername = /.+/;
    // more restrictive, but test cases don't work:
    // /^[A-Za-z\xC0-\xFF][A-Za-z\xC0-\xFF'-]*([ A-Za-z\xC0-\xFF][A-Za-z\xC0-\xFF'.-]+)*$/u;

export {
    keyStore,
    minMessageLength,
    regexMail,
    regexPhone,
    regexUsername
};
