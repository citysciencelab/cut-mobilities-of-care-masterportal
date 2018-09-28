define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        FlaecheninfoTheme;

    FlaecheninfoTheme = Theme.extend({
        defaults: {
            geometryKey: "Umringspolygon"
        },

        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.parseGfiContent
            });
        },
        parseGfiContent: function () {
            // Unterteile GFIContent
            var textContent = _.omit(this.get("gfiContent")[0], this.get("geometryKey")),
                umring = _.find(this.get("gfiContent")[0], function (val, key) {
                    if (key === this.get("geometryKey")) {
                        return val;
                    }
                    return null;
                }, this);

            this.setGfiContent(textContent);
            if (umring) {
                this.setGeometry(umring);
            }
        },
        createReport: function () {
            var flurst = this.get("gfiContent").Flurstück,
                gemarkung = this.get("gfiContent").Gemarkung;

            Radio.trigger("ParcelSearch", "createReport", flurst, gemarkung);
        },

        /**
         * Übergibt die Koordinaten des Flurstücks in korrekter Form an MapMarker. Dadurch wird der Standard-Pin durch Flächendarstellung ersetzt.
         * @param {string} umring WKT
         * @fires MapMarker#zoomTo
         * @returns {void}
         */
        setGeometry: function (umring) {
            var coordinatesString = umring.slice(10, umring.length - 2),
                coordinates = coordinatesString.replace(/,/g, " ");

            Radio.trigger("MapMarker", "zoomTo", {
                coordinate: coordinates,
                type: "flaecheninfo"
            });
        }
    });

    return FlaecheninfoTheme;
});
