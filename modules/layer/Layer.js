define([
    "underscore",
    "backbone",
    "openlayers",
    "eventbus",
    "config"
], function (_, Backbone, ol, EventBus, Config) {
    /**
    * Bereitstellung des Layers
    */
    var Layer = Backbone.Model.extend({
        defaults: {
            selected: false
        },
        initialize: function () {

            this.listenTo(this, "change:selected", this.toggleToSelectionLayerList);

            // NOTE wenn displayInTree auf false steht, ist auch keine GFI-Abfrage möglich. Brauche ich so für treefilter (sd)
            if (this.get("displayInTree") === false) {
                this.set("gfiAttributes", false)
            }

            // Wenn Visibility nicht gesetzt ist (FHH-Atlas), werden alle Layer standardmäßig ausgeblendet.
            if (this.get("visibility") === undefined) {
                this.set("visibility", false);
            }

            // Steuert ob ein Layer aktviert/sichtbar werden kann. Grau dargestellte können nicht sichtbar geschaltet werden.
            this.set("currentScale", Config.view.scale);
            this.setScaleRange();

            this.set("settings", false);

            // EventBus.on("currentMapScale", function () {
            //     console.log(8);
            // });

            this.listenTo(this, "change:visibility", this.setVisibility);

            this.listenTo(this, "change:transparence", this.updateOpacity);
            this.listenTo(this, "change:currentScale", this.setScaleRange);   
            // Prüfung, ob die Attributions ausgewertet werden sollen.
            if (Config.attributions && Config.attributions === true) {
                EventBus.trigger("setAttributionToLayer", this);
                this.postInit();
            }
            else {
                this.postInit();
            }
        },
        postInit: function() {
            this.setAttributionLayerSource();
            this.setAttributionLayer();
            // Default Visibility ist false. In LayerList wird visibility nach config.js gesetzt.
            this.get("layer").setVisible(this.get("visibility"));

            if(this.get("opacity")){
                this.set("transparence", parseInt(this.get("opacity"), 10));
            }
            else{
                 this.set("transparence", 0);
            }
            this.updateOpacity();
            // NOTE hier werden die datasets[0] Attribute aus der json in das Model geschrieben
            this.setAttributions();
            this.unset("datasets");

            // NOTE hier wird die ID an den Layer geschrieben. Sie ist identisch der ID des Backbone-Layer
            this.get("layer").id = this.get("id");

            // setzen der MetadatenURL, vlt. besser in layerlist??
            this.setMetadataURL();
        },
        // NOTE Reload für automatisches Aktualisieren im Rahmen der Attribution
        reload: function () {
            this.setAttributionLayerSource();
            EventBus.trigger('removeLayer', this.get('layer'));                    
            this.setAttributionLayer();
            EventBus.trigger('addLayer', this.get('layer'))
        },
        setAttributions: function () {
            var datasets = this.get("datasets");
            if (datasets) {
                if(datasets[0] !== undefined) {
                    var dataset = this.get("datasets")[0];
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
        },
        /**
        * diese Funktion liest den übergebenen String gfiAttributes ein und erzeugt daraus
        * ein Object. Das Object wird an die WMSLayer, WFSLayer zurückgegeben.
        */
        convertGFIAttributes: function () {
            if (this.get("gfiAttributes")) {
                if (this.get("gfiAttributes").toUpperCase() === "SHOWALL" || this.get("gfiAttributes").toUpperCase() === "IGNORE" ) {
                    return this.get("gfiAttributes");
                }
                else {
                    var gfiAttributList = this.get("gfiAttributes").split(",");
                    var gfiAttributes = {};
                    _.each(gfiAttributList, function (gfiAttributeConfig) {
                        var gfiAttribute = gfiAttributeConfig.split(":");
                        var key = [];
                        key.push(gfiAttribute[0].trim());
                        var value = [];
                        value.push(gfiAttribute[1].trim());
                        var newKey = _.object(key, value);
                        _.extend(gfiAttributes, newKey);
                    });
                    return gfiAttributes;
                }
            }
        },
        setScaleRange: function () {
            if (this.get("currentScale") <= parseInt(this.get("maxScale"),10) && this.get("currentScale") >= parseInt(this.get("minScale"),10)) {
                this.set("isInScaleRange", true);
            }
            else if (this.get("typ") === "WFS" || this.get("typ") === "GROUP") {
                this.set("isInScaleRange", true);
            }
            else {
                this.set("isInScaleRange", false);
                this.set("visibility", false);
            }
        },
        /**
         *
         */
        toggleVisibility: function () {
            if (this.get("visibility") === true) {
                this.set({"visibility": false});
            }
            else if (this.get("visibility") === false && this.get("isInScaleRange") === true) {
                this.set({"visibility": true});
            }
        },
        toggleSelected: function () {
            if (this.get("selected") === true) {
                this.set({"selected": false});
            }
            else {
                this.set({"selected": true});
            }
            if (this.get("layerType") === "nodeChildLayer") {
                this.get("parentView").checkSelectedOfAllChildren();
            }
            else {
                this.get("parentView").toggleStyle();
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
            this.set({"opacity": opacity});
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
                this.set({"settings": false});
            }
            else {
                this.set({"settings": true});
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
        openMetadata: function () {
            window.open(this.get("metaURL"), "_blank");
        },
        setMetadataURL: function () {
            if (this.get("url") !== undefined) {
                if (this.get("url").search("geodienste") !== -1) {
                    this.set("metaURL", "http://metaver.de/trefferanzeige?docuuid=" + this.get("metaID"));
                }
                else {
                    this.set("metaURL", "http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + this.get("metaID"));
                }
            }
            // Für Group-Layer
            else {
                if (this.get("backbonelayers")[0].get("url").search("geodienste") !== -1) {
                    this.set("metaURL", "http://metaver.de/trefferanzeige?docuuid=" + this.get("backbonelayers")[0].get("metaID"));
                }
                else {
                    this.set("metaURL", "http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + this.get("backbonelayers")[0].get("metaID"));
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
