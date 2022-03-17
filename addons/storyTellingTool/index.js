import StoryTellingToolComponent from "./components/StoryTellingTool.vue";
import StoryTellingToolStore from "./store/StoryTellingTool";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: StoryTellingToolComponent,
    store: StoryTellingToolStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
