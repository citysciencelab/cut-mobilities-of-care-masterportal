
const ZoomControlModel = Backbone.Model.extend(/** @lends ZoomControlModel.prototype */{
    defaults: {
        zoomInText: "",
        zoomOutText: ""
    },

    /**
     * @class ControlsZoomModel
     * @description model for the zoom buttons +/-
     * @extends Backbone.Model
     * @memberof Controls/Zoom
     * @constructs
     * @property {String} zoomIn="" the title text for zooming in
     * @property {String} zoomOut="" the title text for zooming out
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
            zoomInText: i18next.t("common:modules.controls.zoom.zoomIn"),
            zoomOutText: i18next.t("common:modules.controls.zoom.zoomOut")
        });
    }
});

export default ZoomControlModel;
