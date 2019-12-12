
const Orientation3DModel = Backbone.Model.extend(/** @lends Orientation3DModel.prototype */{
    defaults: {
        "pointerNorthText": "Ansicht einnorden/Ansicht drehen",
        "pointerSouthText": "Südblick",
        "pointerEastText": "Ost Blick",
        "pointerWestText": "West Blick",
        "moveNorthText": "Nach Norden bewegen",
        "moveSouthText": "Nach Süden bewegen",
        "moveWestText": "Nach Westen bewegen",
        "moveEastText": "Nach Osten bewegen",
        "tiltDownText": "Ansicht neigen",
        "tiltResetText": "Ansicht zurückstellen",
        "zoomInText": "Hineinzoomen",
        "zoomOutText": "Herauszoomen"
    },

    /**
     * @class Orientation3DModel
     * @description model for the 3d orientation compass
     * @extends Backbone.Model
     * @memberof Controls/Orientation3d
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
    * @returns {Void} -
    */
    changeLang: function () {
        this.set({
            "pointerNorthText": i18next.t("common:modules.controls.orientation3d.compass.pointerNorth"),
            "pointerSouthText": i18next.t("common:modules.controls.orientation3d.compass.pointerSouth"),
            "pointerEastText": i18next.t("common:modules.controls.orientation3d.compass.pointerEast"),
            "pointerWestText": i18next.t("common:modules.controls.orientation3d.compass.pointerWest"),
            "moveNorthText": i18next.t("common:modules.controls.orientation3d.compass.moveNorth"),
            "moveSouthText": i18next.t("common:modules.controls.orientation3d.compass.moveSouth"),
            "moveWestText": i18next.t("common:modules.controls.orientation3d.compass.moveWest"),
            "moveEastText": i18next.t("common:modules.controls.orientation3d.compass.moveEast"),
            "tiltDownText": i18next.t("common:modules.controls.orientation3d.control.tiltDown"),
            "tiltResetText": i18next.t("common:modules.controls.orientation3d.control.tiltReset"),
            "zoomInText": i18next.t("common:modules.controls.orientation3d.control.zoomIn"),
            "zoomOutText": i18next.t("common:modules.controls.orientation3d.control.zoomOut")
        });
    }
});

export default Orientation3DModel;
