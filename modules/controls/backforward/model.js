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
        currentPos: 0
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
