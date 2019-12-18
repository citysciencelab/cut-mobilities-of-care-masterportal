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

        this.changeLang(i18next.language);
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        const defaultCode = lng,
            languageCode = i18next.options.getLanguages();

        if (defaultCode) {
            this.setDefaultCode(defaultCode);
        }

        if (languageCode) {
            this.setLanguageCode(languageCode);
            this.set({
                closeButton: i18next.t("common:button.close"),
                languageTitle: i18next.t("common:modules.language.languageTitle")
            });
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
