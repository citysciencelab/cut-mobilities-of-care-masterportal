
const Button3dModel = Backbone.Model.extend(/** @lends Button3dModel.prototype */{
    defaults: {
        buttonTitle: "3D",
        // translations
        openView3dText: "",
        closeView3dText: ""
    },

    /**
     * @class Button3dModel
     * @description model for the 3d button
     * @extends Backbone.Model
     * @memberof Controls/Zoom
     * @constructs
     * @property {String} openView3dText="", filled with "Ansicht einschalten"- translated
     * @property {String} closeView3dText="", filled with "Ansicht ausschalten"- translated
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
    * @returns {void}  -
    */
    changeLang: function () {
        this.set({
            buttonTitle: i18next.exists("common:modules.controls.3d.buttonTitle") ? i18next.t("common:modules.controls.3d.buttonTitle") : "3D",
            openView3dText: i18next.t("common:modules.controls.3d.openView3d"),
            closeView3dText: i18next.t("common:modules.controls.3d.closeView3d")
        });
    },

    /**
     * sets the button title/tooltip
     * @param {String} value -
     * @returns {void}
     */
    setButtonTitle: function (value) {
        this.set("buttonTitle", value);
    }
});

export default Button3dModel;
