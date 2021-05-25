import VueAddonComponent from "./components/VueAddon.vue";
import VueAddonStore from "./store/index";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: VueAddonComponent,
    store: VueAddonStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
