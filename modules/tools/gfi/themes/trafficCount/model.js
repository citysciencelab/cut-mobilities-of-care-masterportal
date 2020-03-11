import Theme from "../model";

const TrafficCountModel = Theme.extend(/** @lends TrafficCountModel.prototype*/{
    defaults: Object.assign({}, Theme.prototype.defaults, {
        title: "",
        type: "",
        meansOfTransport: "",
        lastUpdate: ""
    }),

    /**
     * @class TrafficCountModel
     * @description This theme is used to show trafficCount data for Radzählstationen, Radzählsäulen and aVME data
     * @memberof Tools.GFI.Themes.TrafficCount
     * @constructs
     * @property {Object} feature feature to show gfi.
     */
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.parseProperties
        });
    },

    /**
     * Actions to check kind of feature and to parse its properties into this model
     * @returns {void}
     */
    parseProperties: function () {
        // this lines are just for demonstration purposes!!!!
        // @todo delete this
        this.setLastUpdate("jetzt");
        setTimeout(() => {
            this.setLastUpdate("später");
        }, 200);
    },

    /**
     * Setter for lastUpdate
     * @param {string} value value
     * @returns {void}
     */
    setLastUpdate: function (value) {
        this.set("lastUpdate", value);
    }
});

export default TrafficCountModel;
