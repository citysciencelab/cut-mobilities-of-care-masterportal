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
            settings: false,
            visibility: false,
            metaName: null // --> für Olympia-Portal, rendern sonst nicht möglich
        },
        initialize: function () {
            this.listenToOnce(EventBus, {
                "mapView:sendResolutions": this.setResolutions,
                "mapView:sendViewStartResolution": this.setViewResolution,
                "mapView:sendMinResolution": this.setMinResolution,
                "mapView:sendMaxResolution": this.setMaxResolution
            });

            this.listenTo(EventBus, {
                "mapView:sendViewResolution": this.setViewResolution
            });

            this.listenToOnce(this, {
                "change:layer": function () {
                    EventBus.trigger("mapView:getMinResolution", this.get("minScale"));
                    EventBus.trigger("mapView:getMaxResolution", this.get("maxScale"));
                }
            });

            this.listenTo(this, {
                "change:viewResolution": this.setIsResolutionInRange,
                "change:visibility": this.setVisibility,
                "change:transparence": this.updateOpacity,
                "change:selected": this.toggleToSelectionLayerList,
                "change:SLDBody": this.updateSourceSLDBody
            });
            this.set("settings", false);
            // Setze 'gfiTemplate' in Abhängigkeit der Config-Layerkonfiguration: entweder Wert aus config oder 'default'
            this.set('gfiTheme', this.get('gfiTheme') || 'default');
            // Setze 'routable' in Abhängigkeit der Config-Layerkonfiguration: entweder Wert aus config oder ''
            this.set('routable', this.get('routable') || false);
            // Tranparenz
            this.listenTo(this, "change:transparence", this.updateOpacity);

            // Prüfung, ob die Attributions ausgewertet werden sollen.
            if (Config.attributions && Config.attributions === true) {
                EventBus.trigger("setAttributionToLayer", this);
                this.postInit();
            }
            else {
                this.postInit();
            }
            EventBus.trigger("mapView:getViewStartResolution");
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

            if (datasets && datasets.length > 0) {
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

            if (Config.metadatenURL === "ignore") {
                // hack
                this.set("metaURL", null);
            }
            else if (Config.metadatenURL && Config.metadatenURL !== "") {
                this.set("metaURL", Config.metadatenURL + this.get("metaID"));
            }
            else {
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
            }
        },
        moveUp: function () {
            this.collection.moveModelUp(this);
        },
        moveDown: function () {
            this.collection.moveModelDown(this);
        }
    });

    return Layer;
});
