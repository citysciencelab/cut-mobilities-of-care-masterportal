import Theme from "../model";

const FlaecheninfoTheme = Theme.extend({
    defaults: {
        geometryKey: "Umringspolygon",
        geometry: null,
        isMapMarkerVisible: false,
        isReady: false
    },

    initialize: function () {
        const channel = Radio.channel("GFI");

        this.listenToOnce(channel, {
            "hideGFI": this.resetIsMapMarkerVisible
        }, this);

        this.listenTo(this, {
            "change:isReady": this.parseGfiContent
        }, this);

        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": function () {
                const layerModelFlaecheninfo = Radio.request("ModelList", "getModelByAttributes", {gfiTheme: this.get("gfiTheme")});

                if (!layerModelFlaecheninfo.get("isVisibleInMap") || !layerModelFlaecheninfo.get("isSelected")) {
                    this.setIsVisible(false);
                    this.resetIsMapMarkerVisible();
                }
            }
        });
    },

    /**
     * Parsed die GFI-Attribute
     * @fires Tools.GFI#RadioRequestGFIGetRequestedParcelId
     * @returns {void}
     */
    parseGfiContent: function () {
        const requestedParcelId = Radio.request("GFI", "getRequestedParcelId");
        let textContent,
            ring,
            gfiContent = this.get("gfiContent");

        // Sometimes parcel service returns multiple results as center points parcels may be inside another
        // parcel. Because this, results are sorted this way.
        if (gfiContent && typeof gfiContent.sort === "function") {
            gfiContent = gfiContent.sort(foundGfiContent => {
                return foundGfiContent.Flurstück === requestedParcelId ? -1 : 1;
            });

            textContent = Radio.request("Util", "omit", gfiContent[0], [this.get("geometryKey")]);
            ring = gfiContent[0].hasOwnProperty(this.get("geometryKey")) ? gfiContent[0][this.get("geometryKey")] : "";

            this.setGfiContent([textContent]);
            this.setGeometry(ring);
            this.showUmring();
        }
    },

    createReport: function () {
        const flurst = this.get("gfiContent")[0].Flurstück,
            gemarkung = this.get("gfiContent")[0].Gemarkung;

        Radio.trigger("ParcelSearch", "createReport", flurst, gemarkung);
    },

    /**
     * Speichert die Geometrie als WKT
     * @param {string} umring WKT
     * @returns {void}
     */
    setGeometry: function (umring) {
        let coordinatesString,
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
        const coordinates = this.get("geometry");

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
