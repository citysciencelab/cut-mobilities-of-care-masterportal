import Theme from "../model";
import {TrafficCountApi} from "./trafficCountApi";

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
        const api = new TrafficCountApi("https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de", "v1.0", {
                host: "udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de",
                protocol: "wss",
                path: "/mqtt",
                context: this
            }),
            // @todo delete this
            thingId = 5222,
            // @todo delete this
            meansOfTransport = "AnzFahrzeuge";

        // @todo delete this
        // das hier ausführen bei Registerkarten-Wechsel und beim Schließen des GFI (und besser auch beim Öffnen des GFI)
        api.unsubscribeEverything();

        // @todo delete this
        // hier ein Beispiel für einen asynchronen Aufruf + Subscription
        api.subscribeLastUpdate(thingId, meansOfTransport, phenomenonTime => {
            this.setLastUpdate(phenomenonTime);
        }, errormsg => {
            console.warn(errormsg);
        });
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
