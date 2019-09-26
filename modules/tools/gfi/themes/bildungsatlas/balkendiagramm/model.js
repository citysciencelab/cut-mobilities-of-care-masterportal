import Theme from "../../model";
import RoutableView from "../../../objects/routingButton/view";

const BalkendiagrammTheme = Theme.extend({
    initialize: function () {
        var channel = Radio.channel("defaultTheme");

        this.listenTo(this, {
            "change:isReady": function () {
                this.replaceValuesWithChildObjects();
                this.getDateWithYear();
                this.checkRoutable();
            }
        });

        // render gfi new when changing properties of the associated features
        this.listenTo(channel, {
            "changeGfi": function () {
                Radio.trigger("gfiView", "render");
            }
        });
    },

    /**
     * Prüft, ob der Button zum Routen angezeigt werden soll
     * @returns {void}
     */
    checkRoutable: function () {
        if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "routing"})) === false) {
            if (this.get("routable") === true) {
                this.set("routable", new RoutableView());
            }
        }
    },
    /**
     * Hier werden bei bestimmten Keywords Objekte anstatt von Texten für das template erzeugt. Damit können Bilder oder Videos als eigenständige Objekte erzeugt und komplex
     * gesteuert werden. Im Template werden diese Keywords mit # ersetzt und rausgefiltert. Im view.render() werden diese Objekte attached.
     * Eine leidige Ausnahme bildet z.Z. das Routing, da hier zwei features des Reisezeitenlayers benötigt werden. (1. Ziel(key) mit Dauer (val) und 2. Route mit ol.geom (val).
     * Das Auswählen der richtigen Werte für die Übergabe erfolgt hier.
     * @returns {void}
     */
    replaceValuesWithChildObjects: function () {
        var element = this.get("gfiContent"),
            key,
            newKey;

        for (key in element[0]) {
            newKey = key.replace(" ", "_");
            if (!isNaN(key)) {
                newKey = "year_" + key;
            }
            this.set(newKey, element[0][key]);
        }
    },

    /**
     * Here we get the data with the year for preparaing the balkendiagram
     * @returns {void}
     */
    getDateWithYear: function () {
        var element = this.get("gfiContent"),
            key,
            dataset = [],
            datasetlist;

        for (key in element[0]) {
            if (!isNaN(key)) {
                datasetlist = element[0][key];
                dataset.push({key, datasetlist});
            }
        }
        console.log(dataset);
        this.setDataset(dataset);
    },

    // setting data for balkendiagramm
    setDataset: function (value) {
        this.set("dataset", value);
    }
});

export default BalkendiagrammTheme;
