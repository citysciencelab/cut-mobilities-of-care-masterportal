
const MousePositionControlModel = Backbone.Model.extend(/** @lends MousePositionControlModel.prototype */{
    defaults: {
        // translations
        hintText: "",
        showMousePositionText: "",
        hideMousePositionText: ""
    },

    /**
     * @class MousePositionControlModel
     * @description model for the mouse position
     * @extends Backbone.Model
     * @memberof Controls/MousePosition
     * @constructs
     * @property {String} hintText="", filled with "Bewegen Sie die Maus über die Karte"- translated
     * @property {String} showMousePositionText="", filled with "Einblenden"- translated
     * @property {String} hideMousePositionText="", filled with "Ausblenden"- translated
     * @listens i18next#RadioTriggerLanguageChanged
     * @returns {Void}  -
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
    * @fires Controls.MousePosition#changeHintText
    * @fires Controls.MousePosition#changeShowMousePositionText
    * @fires Controls.MousePosition#changeHideMousePositionText
    * @returns {Void} -
    */
    changeLang: function () {
        this.set({
            hintText: i18next.t("common:modules.controls.mousePosition.hint"),
            showMousePositionText: i18next.t("common:modules.controls.mousePosition.showMousePosition"),
            hideMousePositionText: i18next.t("common:modules.controls.mousePosition.hideMousePosition")
        });
    }
});

export default MousePositionControlModel;
