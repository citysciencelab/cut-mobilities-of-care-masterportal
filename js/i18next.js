import VueI18Next from "@panter/vue-i18next";
import Vue from "vue";

Vue.use(VueI18Next);

export default new VueI18Next(i18next, {namespaces: ["additional", "common"]});
