import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

/**
 * Scans the src/locales/common folder for JSON files to load in the translation messages.
 * This function would be generated if using Vue CLI.
 * Copied from https://phrase.com/blog/posts/ultimate-guide-to-vue-localization-with-vue-i18n/
 *
 * @returns {Object} The messages object containing the translations
 */
function loadLocaleMessages () {
    const locales = require.context(
            "./locales/common",
            true,
            /[A-Za-z0-9-_,\s]+\.json$/i
        ),
        messages = {};

    locales.keys().forEach(key => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i);

        if (matched && matched.length > 1) {
            const locale = matched[1];

            messages[locale] = locales(key);
        }
    });
    return messages;
}


// TODO: Add functionality for addons

export default new VueI18n({
    locale: "de",
    fallbackLocale: "de",
    messages: loadLocaleMessages()
});
