
const ButtonObliqueModel = Backbone.Model.extend(/** @lends ButtonObliqueModel.prototype */{
    defaults: {
        buttonTitle: "Schrägluftbilder",
        openViewObliqueText: "Schrägluftbilder einschalten",
        closeViewObliqueText: "Schrägluftbilder ausschalten"
    },

    /**
     * @class ButtonObliqueModel
     * @description model for oblique aerial photos
     * @extends Backbone.Model
     * @memberof Controls/ButtonOblique
     * @constructs
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
    * @fires Controls.ButtonOblique#changeButtonTitle
    * @fires Controls.ButtonOblique#changeOpenViewObliqueText
    * @fires Controls.ButtonOblique#changeCloseViewObliqueText
    * @returns {Void}  -
    */
    changeLang: function () {
        this.set({
            "buttonTitle": i18next.t("common:modules.controls.oblique.buttonTitle"),
            "openViewObliqueText": i18next.t("common:modules.controls.oblique.openViewOblique"),
            "closeViewObliqueText": i18next.t("common:modules.controls.oblique.closeViewOblique")
        });
    }
});

export default ButtonObliqueModel;
