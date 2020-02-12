
const FullScreenControlModel = Backbone.Model.extend(/** @lends FullScreenControlModel.prototype */{
    defaults: {
        // states wheather or not full screen is enabled (true) or disabled (false) using browser tools
        state: false,
        // translations
        enableText: "",
        disableText: "",
        toggleText: ""
    },

    /**
     * @class FullScreenControlModel
     * @description model for switching fullscreen
     * @extends Backbone.Model
     * @memberof Controls/FullScreen
     * @constructs
     * @property {String} enableText="" the text for enabling fullscreen mode
     * @property {String} disableText="" the text for disabling fullscreen mode
     * @property {String} toggleText="" a enable/disable neutral text for toggling fullscreen mode
     * @listens i18next#RadioTriggerLanguageChanged
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
     * @fires Controls.FullScreen#changeEnableText
     * @fires Controls.FullScreen#changeDisableText
     * @fires Controls.FullScreen#changeToggleText
     * @returns {Void}  -
     */
    changeLang: function () {
        this.set({
            enableText: i18next.t("common:modules.controls.fullScreen.enable"),
            disableText: i18next.t("common:modules.controls.fullScreen.disable"),
            toggleText: i18next.t("common:modules.controls.fullScreen.toggle")
        });
    }
});

export default FullScreenControlModel;
