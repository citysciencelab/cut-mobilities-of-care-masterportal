const ShowParcelGFI = Backbone.Model.extend({
    defaults: {
        "requestedParcelId": false
    },

    /**
     * @class ShowParcelGFI
     * @extends Backbone.Model
     * @memberof Backbone.Model
     * @constructs
     * @listens ParcelSearch#RadioTriggerParcelFound
     * @listens GFI#RadioRequestGetRequestedParcelId
     * @fires GFI#RadioTriggerLayerAtPosition
     */
    initialize: function () {
        Radio.on("ParcelSearch", "parcelFound", this.parcelFound, this);
        Radio.channel("GFI").reply({
            "getRequestedParcelId": function () {
                return this.get("requestedParcelId");
            }
        }, this);
    },

    /**
     * Initiiert die Darstellung des Flurstücke-GFI an der gefundenen Flurstücksposition
     * @param   {object} attributes gefundenes Objekt
     * @fires GFI#RadioTriggerLayerAtPosition
     * @returns {void}
     */
    parcelFound: function (attributes) {
        this.setRequestedParcelId(attributes.flurstuecksnummer);
        Radio.trigger("GFI", "layerAtPosition", "2619", attributes.coordinate);
    },

    /**
     * Setter for requested parcel Id
     * @param {String} value requested parcel id
     * @returns {void}
     */
    setRequestedParcelId: function (value) {
        this.set("requestedParcelId", value);
    }

});

export default ShowParcelGFI;
