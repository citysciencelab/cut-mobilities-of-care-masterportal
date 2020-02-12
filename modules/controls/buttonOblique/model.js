
const ButtonObliqueModel = Backbone.Model.extend(/** @lends ButtonObliqueModel.prototype */{
    defaults: {
        // translations
        buttonTitle: "",
        openViewObliqueText: "",
        closeViewObliqueText: ""
    },

    /**
     * @class ButtonObliqueModel
     * @description model for oblique aerial photos
     * @extends Backbone.Model
     * @memberof Controls/ButtonOblique
     * @constructs
     * @property {String} buttonTitle="", filled with "Schrägluftbilder"- translated
     * @property {String} openViewObliqueText="", filled with "Schrägluftbilder einschalten"- translated
     * @property {String} closeViewObliqueText="", filled with "Schrägluftbilder ausschalten"- translated
     * @listens i18next#RadioTriggerLanguageChanged
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang();
    },

    /**
    * change language - sets default values for the language
    * @param {String} lng the language changed to
    * @returns {Void}  -
    */
    changeLang: function () {
        this.set({
            buttonTitle: i18next.t("common:modules.controls.oblique.buttonTitle"),
            openViewObliqueText: i18next.t("common:modules.controls.oblique.openViewOblique"),
            closeViewObliqueText: i18next.t("common:modules.controls.oblique.closeViewOblique")
        });
    }
});

export default ButtonObliqueModel;
