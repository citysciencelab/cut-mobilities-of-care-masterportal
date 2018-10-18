import Theme from "../model";

const FlaecheninfoTheme = Theme.extend({
    defaults: {
        geometryKey: "Umringspolygon",
        geometry: null
    },

    initialize: function () {
        var channel = Radio.channel("GFI");

        this.listenTo(channel, {
            "afterRender": this.showUmring
        }, this);

        this.listenTo(this, {
            "change:isReady": this.parseGfiContent
        }, this);
    },

    /**
     * Parsed die GFI-Attribute
     * @returns {void}
     */
    parseGfiContent: function () {
        var textContent = _.omit(this.get("gfiContent")[0], this.get("geometryKey")),
            umring = _.find(this.get("gfiContent")[0], function (val, key) {
                if (key === this.get("geometryKey")) {
                    return val;
                }
                return null;
            }, this);

        this.setGfiContent(textContent);
        this.setGeometry(umring);
    },

    createReport: function () {
        var flurst = this.get("gfiContent").Flurstück,
            gemarkung = this.get("gfiContent").Gemarkung;

        Radio.trigger("ParcelSearch", "createReport", flurst, gemarkung);
    },

    /**
     * Speichert die Geometrie als WKT
     * @param {string} umring WKT
     * @returns {void}
     */
    setGeometry: function (umring) {
        var coordinatesString,
            coordinates;

        if (umring) {
            coordinatesString = umring.slice(10, umring.length - 2);
            coordinates = coordinatesString.replace(/,/g, " ");
            this.set("geometry", coordinates);
        }
        else {
            this.set("geometry", null);
        }
    },

    /**
     * Triggert die Darstellung des Flurstücks über MapMarker
     * @fires MapMarker:zoomTo
     * @returns {void}
     */
    showUmring: function () {
        var coordinates = this.get("geometry");

        if (coordinates) {
            Radio.trigger("MapMarker", "zoomTo", {
                coordinate: coordinates,
                type: "flaecheninfo"
            });
        }
    }
});

export default FlaecheninfoTheme;
