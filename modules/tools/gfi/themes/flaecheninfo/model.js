import Theme from "../model";

const FlaecheninfoTheme = Theme.extend({
    defaults: {
        geometryKey: "Umringspolygon",
        geometry: null,
        isMapMarkerVisible: false,
        isReady: false
    },

    initialize: function () {
        var channel = Radio.channel("GFI");

        this.listenToOnce(channel, {
            "hideGFI": this.resetIsMapMarkerVisible
        }, this);

        this.listenTo(this, {
            "change:isReady": this.parseGfiContent
        }, this);

        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": function () {
                var layerModelFlaecheninfo = Radio.request("ModelList", "getModelByAttributes", {gfiTheme: this.get("gfiTheme")});

                if (!layerModelFlaecheninfo.get("isVisibleInMap") || !layerModelFlaecheninfo.get("isSelected")) {
                    this.setIsVisible(false);
                    this.resetIsMapMarkerVisible();
                }
            }
        });
    },

    /**
     * Parsed die GFI-Attribute
     * @returns {void}
     */
    parseGfiContent: function () {
        var requestedParcelId = Radio.request("GFI", "getRequestedParcelId"),
            textContent,
            umring,
            gfiContent = this.get("gfiContent");

        // Sometimes parcel service returns multiple results as center points parcels may be inside another
        // parcel. Because this, results are sorted this way.
        gfiContent = gfiContent.sort(foundGfiContent => {
            return foundGfiContent.Flurstück === requestedParcelId ? -1 : 1;
        });

        textContent = _.omit(gfiContent[0], this.get("geometryKey"));
        umring = _.find(gfiContent[0], function (val, key) {
            if (key === this.get("geometryKey")) {
                return val;
            }
            return null;
        }, this);

        this.setGfiContent([textContent]);
        this.setGeometry(umring);
        this.showUmring();
    },

    createReport: function () {
        var flurst = this.get("gfiContent")[0].Flurstück,
            gemarkung = this.get("gfiContent")[0].Gemarkung;

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

        Radio.trigger("GFI", "isMapMarkerVisible", this.get("isMapMarkerVisible"));
        if (coordinates) {
            Radio.trigger("MapMarker", "zoomTo", {
                coordinate: coordinates,
                type: "flaecheninfo"
            });
        }
    },

    /**
     * Triggert ans GFI und MapMarker, wenn das gfi nicht mehr sichtbar ist.
     * @fires GFI:isMapMarkerVisible
     * @fires MapMarker:hidePolygon
     * @returns {void}
     */
    resetIsMapMarkerVisible: function () {
        if (!this.get("isVisible")) {
            Radio.trigger("GFI", "isMapMarkerVisible", true);
            Radio.trigger("MapMarker", "hidePolygon");
        }
    }
});

export default FlaecheninfoTheme;
