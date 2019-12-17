const LanguageModel = Backbone.Model.extend(/** @lends LanguageModel.prototype */ {
    defaults: {
        languageCode: ["de"],
        defaultCode: "en",
        de: "Deutsch",
        en: "Englisch",
        fr: "Französisch",
        es: "Spanish",
        tr: "Türkisch"
    },
    /**
     * @class LanguageModel
     * @extends Backbone.Model
     * @memberof language
     * @constructs
     */
    initialize: function () {
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function () {
        const defaultCode = i18next.language,
            languageCode = i18next.options.getLanguages();

        if (defaultCode) {
            this.setDefaultCode(defaultCode);
        }

        if (languageCode && defaultCode) {
            this.setLanguageCode(languageCode);
        }
    },

    /**
     * Setter for attribute "defaultCode".
     * @param {object} value - the list of language codes.
     * @returns {void}
     */
    setDefaultCode: function (value) {
        this.set("defaultCode", value);
    },

    /**
     * Setter for attribute "languageCode".
     * @param {object} value - the list of language codes.
     * @returns {void}
     */
    setLanguageCode: function (value) {


        this.set("languageCode", value);
    }
});

export default LanguageModel;
