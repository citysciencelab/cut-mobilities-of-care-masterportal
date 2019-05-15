const BackForwardModel = Backbone.Model.extend(/** @lends BackForwardModel.prototype */{
    /**
     * @class BackForwardModel
     * @extends Backbone.Model
     * @memberof Controls.BackForward
     * @constructs
     */
    defaults: {
        CenterScales: [],
        wentFor: false,
        currentPos: 0,
        config: {}
    },
    /**
     * Create backforward control instance
     * @returns {void}
     */
    initialize: function () {
        this.setConfigData(Radio.request("Parser", "getItemByAttributes", {id: "backforward"}));
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
