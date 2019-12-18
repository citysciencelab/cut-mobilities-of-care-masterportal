const BackForwardModel = Backbone.Model.extend(/** @lends BackForwardModel.prototype */{
    defaults: {
        CenterScales: [],
        wentFor: false,
        currentPos: 0,
        config: {},

        stepForwardText: "Nächste Ansicht",
        stepBackwardText: "Letzte Ansicht"
    },
    /**
     * @class BackForwardModel
     * @description Create backforward control instance
     * @extends Backbone.Model
     * @memberof Controls.BackForward
     * @constructs
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.setConfigData(Radio.request("Parser", "getItemByAttributes", {id: "backforward"}));

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
            stepForwardText: i18next.t("common:modules.controls.backForward.stepForward"),
            stepBackwardText: i18next.t("common:modules.controls.backForward.stepBackward")
        });
    },

    /**
     * Sets the given parameter for config
     * @param {Object} configData - bakcforward object form config.json
     * @returns {void}
     */
    setConfigData: function (configData) {
        this.set("config", configData);
    },
    /**
     * Sets given parameters for CenterScales.
     * @param {Array} val Value array with information about center coordinates
     * @returns {void}
     */
    setCenterScales: function (val) {
        this.set("CenterScales", val);
    },
    /**
     * Sets given parameters for WentFor.
     * @param {Boolean} bool boolean with true or false
     * @returns {void}
     */
    setWentFor: function (bool) {
        this.set("wentFor", bool);
    },
    /**
     * Sets given parameters for CurrentPos.
     * @param {Array} val Value array with information about current position
     * @returns {void}
     */
    setCurrentPos: function (val) {
        this.set("currentPos", val);
    }
});

export default BackForwardModel;
