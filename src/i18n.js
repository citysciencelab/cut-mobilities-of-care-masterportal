import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

/**
 * Scans the src/locales/common folder for JSON files to load in the translation messages.
 *
 * @returns {Object} The messages object containing the translations
 */
function loadLocaleMessages () {
    const locales = require.context(
            "./locales",
            true,
            /[A-Za-z0-9-_,\s]+\.json$/i
        ),
        messages = {};


    // TODO: schauen, ob alte Ordnerstruktur auch ohne Probleme geht
    // TODO: i18next braucht die aktuelle Ordnerstruktur! --> Nur Pflege einer einzelnen Datei ermöglichen
    // TODO: Die regex sauber machen
    locales.keys().forEach(key => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i);

        if (matched && matched.length > 1) {
            const currentLocale = matched[1];

            /* // Merges the results of the different JSON files together to one message object
            if (messages[currentLocale] !== undefined) {
                // TODO: Merge the results
                /* Code von Dennis zum mergen (Bugs possible)
                const merginator = (a, b) => {
                    const new = {};
                    const keysA = Object.keys(a);
                    const keysB = Object.keys(b);

                    return new Set([...keysA, ...keysB]).toArray().reduce((acc, key) => {
                        const aVal = a[key];
                        const bVal = b[key];

                        acc[key] = typeof bVal === 'undefined'  ? aVal : bVal;

                        if (typeof aVal === 'object' && typeof bVal === 'object') {
                            acc[key] = merginator(aVal, bVal);
                        }
                        return acc;
                    }, {});
                }

            }
            else {*/
            messages[currentLocale] = locales(key);
            // }
        }
    });
    return messages;
}

/**
 * Creates an array of the available languages.
 *
 * @param {*} languages - The languages.
 * @returns {Array} The available languages as codes.
 */
function loadAvailableLocales (languages) {
    // TODO: Anmerken: Vllt eher Array?
    return Object.keys(languages);
}

// TODO: Folgendes alles machen
// Ergebnis von detection Plugin (Sprache) nutzen bei locale -> erstmal fallbackLanguage
// --> Plugin manuell importieren und hacken!
// --> Oder selbst implementieren, Gruppe ansprechen
// Irgendwas mit dem debug machen

/**
 * Creates the i18n Object using the configuration from the config.js.
 *
 * @param {*} store - The VueX Store of the Application.
 * @returns {VueI18n} The i18n Module for the Application.
 */
export function makeI18n (store) {
    return new VueI18n({
        locale: store.getters.languageConfig.fallbackLanguage,
        fallbackLocale: store.getters.languageConfig.fallbackLanguage,
        availableLocales: loadAvailableLocales(store.getters.languageConfig.languages),
        messages: loadLocaleMessages()
    });
}
