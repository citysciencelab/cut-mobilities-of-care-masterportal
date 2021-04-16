/**
 * Recursive function (!) - adds a translation function named i18nextTranslate := function(setter) to each element in subconf found to be translated.
 * @param {Object} subconf The raw response of the config.json - this is the raw data from the file before any changes are made; for recursion: this is the subobject of any object in the config.json.
 * @param {String} prefix The prefix of values to use to recognize them for translation.
 * @param {String[]} [keysNotToTranslateName=["hitMap"]] Keys that are not to be translated.
 * @returns {void}
 * @pre The subconf (raw data) is as it is.
 * @post All objects of translatable values of subconf (the raw data) have an extended key i18nextTranlate with a function(setter, key) added.
 */
export default function addTranslationToRawConfig (subconf, prefix, keysNotToTranslateName = ["hitMap"]) {
    Object.keys(subconf).forEach(subkey => {
        const subobj = subconf[subkey];
        let translationKey;

        if (typeof subobj === "string") {
            if (subobj.indexOf(prefix) !== 0) {
                if (subkey === "name") {
                    // use name defined in config.json and do not use defaultName (defined in model with key "nameTranslationKey")
                    subconf.useConfigName = true;
                }
                // no translation wanted
                return;
            }

            translationKey = subobj.substr(prefix.length);

            // each entry should get a translation function: in the translationfile might be stuff that is not keyed in the config.json (like pure ids from the Dienstemanager)
            // at this point pure arrays in the config.json can't be translated with a translation function
            if (!Array.isArray(subconf) && !subconf.hasOwnProperty("i18nextTranslate")) {
                /**
                 * callback function i18nextTranslate
                 * @param {Function} setter a function(translation) to set the value of key
                 * @param {String} key the key (of subconf) which value should be translated
                 * @returns {Void}  -
                 * @pre the value of key is as it is
                 * @post the value of key is run and replaced through i18next.t if key exists for i18next to translate
                 */
                subconf.i18nextTranslate = function (setter) {
                    if (typeof setter === "function" && i18next.exists(translationKey)) {
                        setter(subkey, i18next.t(translationKey));
                    }
                    // handle language-files from addons
                    else if (typeof setter === "function" && translationKey.indexOf("additional") === 0) {
                        setter(subkey, i18next.t(translationKey));
                    }
                };
            }
            else if (subconf.hasOwnProperty("i18nextTranslate") && typeof subconf.i18nextTranslate === "function") {
                // a function already exists - this means more then one value of this object in the config.json must be translated
                // put former i18nextTranslate function into scope
                const cascadeFunction = subconf.i18nextTranslate;

                /**
                 * callback function i18nextTranslate with cascading former function (cascadeFunction)
                 * @param {Function} setter a function(translation) to set the value of key
                 * @param {String} key the key (of subconf) which value should be translated
                 * @returns {Void}  -
                 * @pre the values of all keys are as they are
                 * @post the translation functions for all keys where run in a cascade
                 */
                subconf.i18nextTranslate = function (setter) {
                    // translate former values
                    cascadeFunction(setter);

                    // translate actual value
                    if (typeof setter === "function" && i18next.exists(translationKey)) {
                        setter(subkey, i18next.t(translationKey));
                    }
                    // handle language-files from addons
                    else if (typeof setter === "function" && translationKey.indexOf("additional") === 0) {
                        setter(subkey, i18next.t(translationKey));
                    }
                };
            }

            // run the translation once for startup to ensure the absence of any translation key found in the config.json
            // after this - use i18nextTranslate on any object to translate the value
            if (i18next.exists(translationKey)) {
                subconf[subkey] = i18next.t(translationKey);
            }
        }
        else if (subobj instanceof Object && keysNotToTranslateName.indexOf(subkey) < 0) {
            addTranslationToRawConfig(subobj, prefix);
        }
    });
}
