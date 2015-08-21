define([
    "backbone",
    "openlayers",
    "eventbus",
    "config"
], function (Backbone, ol, EventBus, Config) {
    /**
    * Bereitstellung des Layers
    */
    "use strict";
    var Layer = Backbone.Model.extend({
        defaults: {
            selected: false,
            visibility: false,
            metaName: null // --> für Olympia-Portal, rendern sonst nicht möglich
        },
        initialize: function () {
            this.listenToOnce(EventBus, {
                "mapView:sendResolutions": this.setResolutions
            });
            this.listenTo(this, "change:selected", this.toggleToSelectionLayerList);
            this.listenTo(this, "change:visibility", this.setVisibility);
            this.listenTo(this, "change:visibility", this.toggleLayerInformation);
            // this.listenTo(this, "change:minResolution", this.setMinResoForLayer);
            // this.listenTo(this, "change:maxResolution", this.setMaxResoForLayer);
            this.listenTo(this, "change:SLDBody", this.updateSourceSLDBody);

            // Steuert ob ein Layer aktviert/sichtbar werden kann. Grau dargestellte können nicht sichtbar geschaltet werden.
            EventBus.on("currentMapScale", this.setScaleRange, this);
            // Geht schöner...
            EventBus.once("sendCurrentMapScale", this.setScaleRange, this);
            EventBus.trigger("getCurrentMapScale");

            this.set("settings", false);

            this.listenTo(this, "change:transparence", this.updateOpacity);

            // Prüfung, ob die Attributions ausgewertet werden sollen.
            if (Config.attributions && Config.attributions === true) {
                EventBus.trigger("setAttributionToLayer", this);
                this.postInit();
            }
            else {
                this.postInit();
            }
        },

        postInit: function () {
            this.setAttributionLayerSource();
            this.setAttributionLayer();
            if (this.get("transparence")) {
                this.set("transparence", parseInt(this.get("transparence"), 10));
            }
            else {
                this.set("transparence", 0);
            }
            // this.updateOpacity();
            // NOTE hier werden die datasets[0] Attribute aus der json in das Model geschrieben
            this.setAttributions();
            this.unset("datasets");

            // NOTE hier wird die ID an den Layer geschrieben. Sie ist identisch der ID des Backbone-Layer
            this.get("layer").id = this.get("id");

            // setzen der MetadatenURL, vlt. besser in layerlist??
            this.setMetadataURL();

            if (this.has("minResolution")) {
                this.setMinResoForLayer();
            }
            if (this.has("maxResolution")) {
                this.setMaxResoForLayer();
            }
            if (this.get("visible") !== undefined) {
                this.set("visibility", this.get("visible"));
            }
            this.get("layer").setVisible(this.get("visibility"));
        },
        // NOTE Reload für automatisches Aktualisieren im Rahmen der Attribution
        reload: function () {
            this.setAttributionLayerSource();
            EventBus.trigger("removeLayer", this.get("layer"));
            this.setAttributionLayer();
            EventBus.trigger("addLayer", this.get("layer"));
        },
        setAttributions: function () {
            var datasets = this.get("datasets"),
                dataset;

            if (datasets) {
                if (datasets[0] !== undefined) {
                    dataset = this.get("datasets")[0];
                    this.set("metaID", dataset.md_id);
                    this.set("metaName", dataset.md_name);
                    if (dataset.kategorie_opendata.length > 1) {
                        this.set("kategorieOpendata", dataset.kategorie_opendata);
                    }
                    else {
                        this.set("kategorieOpendata", dataset.kategorie_opendata[0]);
                    }
                    // besser auf type kontrollieren (Array oder String)
                    if (dataset.kategorie_inspire.length > 1) {
                        this.set("kategorieInspire", dataset.kategorie_inspire);
                    }
                    else {
                        this.set("kategorieInspire", dataset.kategorie_inspire[0]);
                    }
                }
            }
            // sollte noch besser gelöst werden, gab Probleme mit dem FHH-Atlas
            else if (this.get("typ") === "GeoJSON") {
                this.set("metaURL", null);
            }
        },
        setScaleRange: function (scale) {
            if (scale <= parseInt(this.get("maxScale"), 10) && scale >= parseInt(this.get("minScale"), 10)) {
                this.set("isInScaleRange", true);
            }
            else if (this.get("typ") === "WFS" || this.get("typ") === "GROUP") {
                this.set("isInScaleRange", true);
            }
            else {
                this.set("isInScaleRange", false);
            }
        },
        /**
         *
         */
        toggleVisibility: function () {
            if (this.get("visibility") === true) {
                this.set({visibility: false});
            }
            else if (this.get("visibility") === false) {
                this.set({visibility: true});
            }
        },
        toggleSelected: function () {
            if (this.get("selected") === true) {
                this.set({selected: false});
            }
            else {
                this.set({selected: true});
            }
            if (this.get("type") === "nodeChildLayer") {
                this.get("parentView").checkSelectedOfAllChildren();
            }
            else {
                // noch komisch
                if (this.get("parentView") !== undefined) {
                    this.get("parentView").toggleStyle();
                }
            }
        },
        /**
         *
         */
        setUpTransparence: function (value) {
            if (this.get("transparence") < 90) {
                this.set("transparence", this.get("transparence") + value);
            }
        },
        /**
         *
         */
        setDownTransparence: function (value) {
            if (this.get("transparence") > 0) {
                this.set("transparence", this.get("transparence") - value);
            }
        },
        /**
         *
         */
        updateOpacity: function () {
            var opacity = (100 - this.get("transparence")) / 100;

            this.get("layer").setOpacity(opacity);
            this.set("opacity", opacity);
        },
        /**
         * wird in WFSLayer und GroupLayer überschrieben
         */
        setVisibility: function () {
            var visibility = this.get("visibility");

            this.get("layer").setVisible(visibility);
            this.toggleEventAttribution(visibility);
        },
        toggleToSelectionLayerList: function () {
            if (this.get("selected") === true) {
                this.set("visibility", true);
                EventBus.trigger("addModelToSelectionList", this);
            }
            else {
                this.set("visibility", false);
                EventBus.trigger("removeModelFromSelectionList", this);
            }
        },
        /**
         *
         */
        toggleSettings: function () {
            if (this.get("settings") === true) {
                this.set({settings: false});
            }
            else {
                this.set({settings: true});
            }
        },
        toggleEventAttribution: function (value) {
            if (_.has(this, "EventAttribution")) {
                if (value === true) {
                    EventBus.trigger("startEventAttribution", this);
                }
                else {
                    EventBus.trigger("stopEventAttribution", this);
                }
            }
        },
        toggleLayerInformation: function () {
            if (this.get("layerAttribution") !== "nicht vorhanden") {
                if (this.get("visibility") === true) {
                    EventBus.trigger("layerinformation:add", {"name": this.get("name"), "text": this.get("layerAttribution"), "id": this.get("id")});
                }
                else {
                    EventBus.trigger("layerinformation:remove", this.get("id"));
                }
            }
        },

        openMetadata: function () {
            window.open(this.get("metaURL"), "_blank");
        },
        setMetadataURL: function () {
            if (this.get("url") !== undefined && this.has("link") === false) {
                if (this.get("url").search("geodienste") !== -1) {
                    this.set("metaURL", "http://metaver.de/trefferanzeige?docuuid=" + this.get("metaID"));
                }
                else {
                    this.set("metaURL", "http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + this.get("metaID"));
                }
            }
            else if (this.get("backbonelayers") !== undefined && this.has("link") === false) { // Für Group-Layer
                if (this.get("backbonelayers")[0].get("url").search("geodienste") !== -1) {
                    this.set("metaURL", "http://metaver.de/trefferanzeige?docuuid=" + this.get("backbonelayers")[0].get("metaID"));
                }
                else {
                    this.set("metaURL", "http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + this.get("backbonelayers")[0].get("metaID"));
                }
            }
            else {
                // für olympia-portal --> hat keine metadaten!! Es wird auf ein PDF verlinkt.
                this.set("metaURL", this.get("link"));
            }
        },
        moveUp: function () {
            this.collection.moveModelUp(this);
        },
        moveDown: function () {
            this.collection.moveModelDown(this);
        },
        setMinResoForLayer: function () {
            this.get("layer").setMinResolution(this.get("minResolution"));
        },
        setMaxResoForLayer: function () {
            this.get("layer").setMaxResolution(this.get("maxResolution"));
        }
    });

    return Layer;
});
