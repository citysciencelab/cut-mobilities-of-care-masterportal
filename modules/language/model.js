import Overlay from "ol/Overlay";

const LanguageModel = Backbone.Model.extend(/** @lends LanguageModel.prototype */ {
    defaults: {
        languageCodes: {},
        activeCode: "",
        overlay: new Overlay({
            element: null
        }),
        // translations
        closeButton: "",
        languageTitle: ""
    },
    /**
     * @class LanguageModel
     * @extends Backbone.Model
     * @memberof language
     * @constructs
     * @property {Object} languageCodes={}, all available langiages as codes
     * @property {String} activeCode="", actual used language as code
     * @property {Overlay} overlay=new Overlay({ element: null }) render this in an overlay for not bubbling down click-events
     * @property {String} closeButton="", filled with "Schliessen"- translated
     * @property {String} languageTitle="", filled with "Bitte wählen Sie eine Sprache aus"- translated
     */
    initialize: function () {
        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                Radio.trigger("Map", "addOverlay", this.get("overlay"));
            }
        }, this);
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },

    /**
     * change language - sets default values for the language
     * @param {String} activeCode the language changed to
     * @returns {Void}  -
     */
    changeLang: function (activeCode) {
        const languageCodes = i18next.options.getLanguages();

        if (activeCode) {
            this.set("activeCode", activeCode);
        }

        if (languageCodes) {
            this.set({
                languageCodes: languageCodes,
                closeButton: i18next.t("common:button.close"),
                languageTitle: i18next.t("common:modules.language.languageTitle")
            });
        }
    },
    /**
    * Setter function for overlay element
    * @param {Object} value the element
    * @returns {void}
    */
    setOverlayElement: function (value) {
        this.get("overlay").setElement(value);
    }
});

export default LanguageModel;
