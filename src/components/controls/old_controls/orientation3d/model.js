
const Orientation3DModel = Backbone.Model.extend(/** @lends Orientation3DModel.prototype */{
    defaults: {
        // translations
        "pointerNorthText": "",
        "pointerSouthText": "",
        "pointerEastText": "",
        "pointerWestText": "",
        "moveNorthText": "",
        "moveSouthText": "",
        "moveWestText": "",
        "moveEastText": "",
        "tiltDownText": "",
        "tiltResetText": "",
        "zoomInText": "",
        "zoomOutText": ""
    },

    /**
     * @class Orientation3DModel
     * @description model for the 3d orientation compass
     * @extends Backbone.Model
     * @memberof Controls/Orientation3d
     * @constructs
     * @property {String} pointerNorthText="", filled with "Ansicht einnorden/Ansicht drehen"- translated
     * @property {String} pointerSouthText="", filled with "Südblick"- translated
     * @property {String} pointerEastText="", filled with "Ost Blick"- translated
     * @property {String} pointerWestText="", filled with "West Blick"- translated
     * @property {String} moveNorthText="", filled with "Nach Norden bewegen"- translated
     * @property {String} moveSouthText="", filled with "Nach Süden bewegen"- translated
     * @property {String} moveWestText="", filled with "Nach Westen bewegen"- translated
     * @property {String} moveEastText="", filled with "Nach Osten bewegen"- translated
     * @property {String} tiltDownText="", filled with "Ansicht neigen"- translated
     * @property {String} tiltResetText="", filled with "Ansicht zurückstellen"- translated
     * @property {String} zoomInText="", filled with "Hineinzoomen"- translated
     * @property {String} zoomOutText="", filled with "Herauszoomen"- translated
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
            pointerNorthText: i18next.t("common:modules.controls.orientation3d.compass.pointerNorth"),
            pointerSouthText: i18next.t("common:modules.controls.orientation3d.compass.pointerSouth"),
            pointerEastText: i18next.t("common:modules.controls.orientation3d.compass.pointerEast"),
            pointerWestText: i18next.t("common:modules.controls.orientation3d.compass.pointerWest"),
            moveNorthText: i18next.t("common:modules.controls.orientation3d.compass.moveNorth"),
            moveSouthText: i18next.t("common:modules.controls.orientation3d.compass.moveSouth"),
            moveWestText: i18next.t("common:modules.controls.orientation3d.compass.moveWest"),
            moveEastText: i18next.t("common:modules.controls.orientation3d.compass.moveEast"),
            tiltDownText: i18next.t("common:modules.controls.orientation3d.control.tiltDown"),
            tiltResetText: i18next.t("common:modules.controls.orientation3d.control.tiltReset"),
            zoomInText: i18next.t("common:modules.controls.orientation3d.control.zoomIn"),
            zoomOutText: i18next.t("common:modules.controls.orientation3d.control.zoomOut")
        });
    }
});

export default Orientation3DModel;
