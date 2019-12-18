const LanguageModel = Backbone.Model.extend(/** @lends LanguageModel.prototype */ {
    defaults: {
        languageCode: {},
        defaultCode: "",
        closeButton: "",
        languageTitle: ""
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

        this.changeLang(i18next.language, i18next.options.getLanguages());
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @param {Object} lngList the list of languages
     * @returns {Void}  -
     */
    changeLang: function (lng, lngList) {
        const defaultCode = lng,
            languageCode = lngList;

        if (defaultCode) {
            this.setDefaultCode(defaultCode);
        }

        if (languageCode) {
            this.setLanguageCode(languageCode);
            this.set("closeButton", i18next.t("common:button.close"));
            this.set("languageTitle", i18next.t("common:modules.language.languageTitle"));
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
    },

    /**
     * requests util if portal is running on mobile device
     * @returns {Boolean}  - isMobile
     */
    checkIsMobile: function () {
        return Radio.request("Util", "isViewMobile");
    }
});

export default LanguageModel;
