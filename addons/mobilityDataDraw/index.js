import MobilityDataDrawComponent from "./components/MobilityDataDraw.vue";
import MobilityDataDrawStore from "./store/MobilityDataDraw";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: MobilityDataDrawComponent,
    store: MobilityDataDrawStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
