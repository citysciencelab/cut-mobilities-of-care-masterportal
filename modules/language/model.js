const LanguageModel = Backbone.Model.extend(/** @lends LanguageModel.prototype */ {
    defaults: {
        languageCode: {"de": "deutsch"},
        defaultCode: "en"
    },
    /**
     * @class LanguageModel
     * @extends Backbone.Model
     * @memberof language
     * @constructs
     * @param {String} defaultCode="DE" language code of portal
     * @param {String} languageCode={} the list of language codes
     */
    initialize: function () {
        const languageCode = i18next.options.getLanguages(),
            defaultCode = i18next.language;
        console.log(i18next.language);
        console.log(i18next.languages);
        console.log(languageCode);

        if (languageCode) {
            this.setLanguageCode(languageCode);
        }

        if (defaultCode) {
            this.setDefaultCode(defaultCode);
        }
    },

    /**
     * Setter for attribute "languageCode".
     * @param {object} value - the list of language codes.
     * @returns {void}
     */
    setLanguageCode: function (value) {
        this.set("languageCode", value);
    },

    /**
     * Setter for attribute "defaultCode".
     * @param {object} value - the list of language codes.
     * @returns {void}
     */
    setDefaultCode: function (value) {
        this.set("defaultCode", value);
    }
});

export default LanguageModel;
