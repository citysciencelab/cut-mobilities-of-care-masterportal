define([
    "backbone",
    "openlayers",
    "eventbus"
], function (Backbone, ol, EventBus) {

    var RecordData = Backbone.Model.extend({

        //
        defaults: {
            buttons: ["point", "line", "area", "edit", "delete"],
            activeButton: "",
            source: new ol.source.Vector()
        },

        //
        initialize: function () {
            this.listenTo(EventBus, {
                "winParams": this.setStatus
            });
            this.set("layer", new ol.layer.Vector({
                source: this.get("source")
            }));
            EventBus.trigger("addLayer", this.get("layer"));
            this.set("drawInteraction", new ol.interaction.Draw({
                source: this.get("source"),
                type: "Point"
            }));
            this.get("drawInteraction").on("drawend", function (evt) {
                console.log(evt);
            });
            // EventBus.trigger("addInteraction", this.get("draw"));
        },

        //
        setStatus: function (args) {
            if (args[2] === "record" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                // EventBus.trigger("addInteraction", this.get("draw"));
                // this.createInteraction();
            }
            else {
                this.set("isCurrentWin", false);
                // EventBus.trigger("removeInteraction", this.get("draw"));
            }
        },

        // Setzt das Atribut "activeButton". Wir aus der View aufgerufen.
        setActive: function (value) {
            switch (value) {
                case "record-button-point": {
                    this.set("activeButton", "point");
                    this.setDrawPointInteraction();
                    break;
                }
                case "record-button-line": {
                    this.set("activeButton", "line");
                    break;
                }
                case "record-button-area": {
                    this.set("activeButton", "area");
                    break;
                }
                case "record-button-edit": {
                    this.set("activeButton", "edit");
                    break;
                }
                case "record-button-delete": {
                    this.set("activeButton", "delete");
                    break;
                }
                default: {
                    break;
                }
            }
        },

        setDrawPointInteraction: function () {
            this.set("interaction", new ol.interaction.Draw({
                type: "Point",
                source: this.get("source")
            }));
            console.log(4);
        }
    });

    return new RecordData();
});
