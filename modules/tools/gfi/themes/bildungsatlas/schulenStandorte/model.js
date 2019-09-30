import Theme from "../../model";

const SchulenStandorteViewTheme = Theme.extend({
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": function () {
                this.replaceValuesWithChildObjects();
            }
        });
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
            idx,
            value;

        for (key in element[0]) {
            idx = key.replace(" ", "_");
            value = element[0][key];
            if (idx === "SchPu_PrSt") {
                value = value === 0 ? "nein" : "ja";
            }
            else if (idx === "C_S_SuS_ES") {
                value = value === 0 ? "nein" : "ja";
            }
            else if (idx === "C_S_GTA") {
                value = value === 0 ? "nein" : "ja";
            }

            this.set(idx, value);
        }
    }
});

export default SchulenStandorteViewTheme;
