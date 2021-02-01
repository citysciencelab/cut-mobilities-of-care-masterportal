import actions from "./actionsContact";
import getters from "./gettersContact";
import mutations from "./mutationsContact";

const keyStore = {
        actions: Object.keys(actions),
        getters: Object.keys(getters),
        mutations: Object.keys(mutations)
    },
    minMessageLength = 10,
    regexMail = /^[A-Z0-9._%+-]+@{1}[A-Z0-9.-]+\.{1}[A-Z]{2,7}$/im,
    regexPhone = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/,
    regexUsername = /^[A-Za-z\xC0-\xFF][A-Za-z\xC0-\xFF'-]*([ A-Za-z\xC0-\xFF][A-Za-z\xC0-\xFF'-]+)*$/u;

export {
    keyStore,
    minMessageLength,
    regexMail,
    regexPhone,
    regexUsername
};
