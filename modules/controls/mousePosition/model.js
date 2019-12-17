
const MousePositionControlModel = Backbone.Model.extend(/** @lends MousePositionControlModel.prototype */{
    defaults: {
        hintText: "Bewegen Sie die Maus über die Karte",
        showMousePositionText: "Einblenden",
        hideMousePositionText: "Ausblenden"
    },

    /**
     * @class MousePositionControlModel
     * @description model for the mouse position
     * @extends Backbone.Model
     * @memberof Controls/MousePosition
     * @constructs
     * @property {String} zoomIn="" the title text for zooming in
     * @property {String} zoomOut="" the title text for zooming out
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
