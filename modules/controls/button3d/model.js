
const Button3dModel = Backbone.Model.extend(/** @lends Button3dModel.prototype */{
    defaults: {
        buttonTitle: "3D",
        openView3dText: "Ansicht einschalten",
        closeView3dText: "Ansicht ausschalten"
    },

    /**
     * @class Button3dModel
     * @description model for the 3d button
     * @extends Backbone.Model
     * @memberof Controls/Zoom
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
    * @returns {Void}  -
    */
    changeLang: function () {
        this.set({
            buttonTitle: i18next.t("common:modules.controls.3d.buttonTitle"),
            openView3dText: i18next.t("common:modules.controls.3d.openView3d"),
            closeView3dText: i18next.t("common:modules.controls.3d.closeView3d")
        });
    }
});

export default Button3dModel;
