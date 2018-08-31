define(function (require) {

    var Item = require("modules/core/modelList/item"),
        Radio = require("backbone.radio"),
        Layer;

    Layer = Item.extend({
        defaults: {
            // channel des Layer-Radios
            channel: Radio.channel("Layer"),
            // ist der Layer (ol.layer) in der Karte sichtbar
            isVisibleInMap: false,
            // ist das Model im Baum selektiert
            isSelected: false,
            // sind die Einstellungen (Transparenz etc.) vom Model im Baum sichtbar
            isSettingVisible: false,
            // Transparenz in %
            transparency: 0,
            // der Index der die Reihenfolge der selektierten Models beim Zeichnen in "Auswahl der Themen" bestimmt
            selectionIDX: 0,
            layerInfoClicked: false,
            minScale: "0",
            maxScale: "1000000"
        },

        initialize: function () {
            this.registerInteractionTreeListeners(this.get("channel"));
            this.registerInteractionMapViewListeners();

            //  Ol Layer anhängen, wenn die Layer initial Sichtbar sein soll
            //  Im Lighttree auch nicht selektierte, da dort alle Layer von anfang an einen
            //  selectionIDX benötigen, um verschoben werden zu können
            if (this.get("isSelected") === true || Radio.request("Parser", "getTreeType") === "light") {
                if (_.isUndefined(Radio.request("ParametricURL", "getLayerParams")) === false) {
                    this.collection.appendToSelectionIDX(this);
                }
                else {
                    this.collection.insertIntoSelectionIDX(this);
                }
                this.prepareLayerObject();
                Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), this.get("selectionIDX")]);
                this.setIsVisibleInMap(this.get("isSelected"));
                this.toggleWindowsInterval();
            }
        },

        featuresLoaded: function (features) {
            Radio.trigger(this.get("channel"), "featuresLoaded", this.get("id"), features);
        },

        /**
         * Ruft die Einzelfunktionen zur Layererstellung auf.
         * @returns {void}
         */
        prepareLayerObject: function () {
            this.createLayerSource();
            this.createLayer();
            this.updateLayerTransparency();
            this.getResolutions();
            this.createLegendURL();
            this.checkForScale(Radio.request("MapView", "getOptions"));
        },

        /**
         * Hier wird die Schnittstelle zur Interaktion mit dem Tree registriert.
         * @return {void}
         * @param {Radio.channel} channel Kanal dieses Moduls
         * @listens this~change:isSelected
         * @listens Layer~updateLayerInfo
         * @listens Layer~setLayerInfoChecked
         * @listens this~change:isVisibleInMap
         * @listens this~change:transparency
         */
        registerInteractionTreeListeners: function (channel) {
            // beim treetype: "light" werden alle Layer initial geladen
            if (Radio.request("Parser", "getTreeType") !== "light") {
                this.listenToOnce(this, {
                    // Die LayerSource wird beim ersten Selektieren einmalig erstellt
                    "change:isSelected": function () {
                        if (_.isUndefined(this.get("layerSource"))) {
                            this.prepareLayerObject();
                        }
                    }
                });
            }
            // Dieses Radio kümmert sich um die Darstellung der layerInformation
            this.listenTo(channel, {
                "updateLayerInfo": function (name) {
                    if (this.get("name") === name && this.get("layerInfoChecked") === true) {
                        this.showLayerInformation();
                    }
                },
                "setLayerInfoChecked": function (layerInfoChecked) {
                    this.setLayerInfoChecked(layerInfoChecked);
                }
            });
            // Diese Listener kümmern sich um die Sichtbarkeit der Layer
            this.listenTo(this, {
                "change:isVisibleInMap": function () {
                    // triggert das Ein- und Ausschalten von Layern
                    Radio.trigger("ClickCounter", "layerVisibleChanged");
                    Radio.trigger("Layer", "layerVisibleChanged", this.get("id"), this.get("isVisibleInMap"));
                    this.toggleLayerOnMap();
                    this.toggleWindowsInterval();
                    this.toggleAttributionsInterval();
                },
                "change:transparency": this.updateLayerTransparency
            });
        },

        /**
         * Hier wird die Schnittstelle zur Interaktion mit der MapView registriert.
         * @listens Radio:MapView~changedOptions
         * @returns {void}
         */
        registerInteractionMapViewListeners: function () {
            // Dieser Listener um eine Veränderung des angezeigten Maßstabs
            this.listenTo(Radio.channel("MapView"), {
                "changedOptions": function (options) {
                    this.checkForScale(options);
                }
            });
        },

        /**
         * Setter des Windows Intervals. Bindet an this.
         * @param {function} func                Funktion, die in this ausgeführt werden soll
         * @param {integer}  autorefreshInterval Intervall in ms
         * @returns {void}
         */
        setWindowsInterval: function (func, autorefreshInterval) {
            this.set("windowsInterval", setInterval(func.bind(this), autorefreshInterval));
        },

        /**
         * Steuert die Handlungen in einem Layerinterval
         * @returns {void}
         */
        intervalHandler: function () {
            this.updateSource();
        },

        setLayerInfoChecked: function (value) {
            this.set("layerInfoChecked", value);
        },

        /**
         * Setzt die sichtbaren Resolution an den ol.layer.
         * @returns {void}
         */
        getResolutions: function () {
            var resoByMaxScale = Radio.request("MapView", "getResoByScale", this.get("maxScale"), "max"),
                resoByMinScale = Radio.request("MapView", "getResoByScale", this.get("minScale"), "min");

            this.setMaxResolution(resoByMaxScale + (resoByMaxScale / 100));
            this.setMinResolution(resoByMinScale);
        },

        setLayerSource: function (value) {
            this.set("layerSource", value);
        },

        setLayer: function (value) {
            this.set("layer", value);
        },

        setIsVisibleInMap: function (value) {
            this.set("isVisibleInMap", value);
            this.get("layer").setVisible(value);
        },

        setIsSelected: function (value) {
            this.set("isSelected", value);
        },

        setIsSettingVisible: function (value) {
            this.set("isSettingVisible", value);
        },

        setTransparency: function (value) {
            this.set("transparency", value);
        },

        setIsOutOfRange: function (value) {
            this.set("isOutOfRange", value);
        },

        setMaxResolution: function (value) {
            this.get("layer").setMaxResolution(value);
        },

        setMinResolution: function (value) {
            this.get("layer").setMinResolution(value);
        },

        incTransparency: function () {
            if (this.get("transparency") <= 90) {
                this.setTransparency(this.get("transparency") + 10);
            }
        },
        decTransparency: function () {
            if (this.get("transparency") >= 10) {
                this.setTransparency(this.get("transparency") - 10);
            }
        },

        toggleIsSelected: function () {
            if (this.get("isSelected") === true) {
                this.setIsSelected(false);
            }
            else {
                this.setIsSelected(true);
            }
        },

        toggleIsVisibleInMap: function () {
            if (this.get("isVisibleInMap") === true) {
                this.setIsVisibleInMap(false);
            }
            else {
                this.setIsVisibleInMap(true);
            }
        },

        /**
         * Toggelt das Interval anhand der Layersichtbarkeit.
         * Das autoRefresh Interval muss as Performance-Gründen > 500 sein.
         * @returns {void}
         */
        toggleWindowsInterval: function () {
            var isVisible = this.get("isVisibleInMap"),
                autoRefresh = this.get("autoRefresh");

            if (isVisible === true) {
                if (autoRefresh > 500) {
                    this.setWindowsInterval(this.intervalHandler, autoRefresh);
                }
            }
            else if (!_.isUndefined(this.get("windowsInterval"))) {
                clearInterval(this.get("windowsInterval"));
            }
        },

        toggleIsSettingVisible: function () {
            if (this.get("isSettingVisible") === true) {
                this.setIsSettingVisible(false);
            }
            else {
                // setzt vorher alle Models auf false, damit immer nur eins angezeigt wird
                this.collection.setIsSettingVisible(false);
                this.setIsSettingVisible(true);
            }
        },
        /**
         * Der Layer wird der Karte hinzugefügt, bzw. von der Karte entfernt
         * Abhängig vom Attribut "isSelected"
         * @returns {void}
         */
        toggleLayerOnMap: function () {
            if (Radio.request("Parser", "getTreeType") !== "light") {
                if (this.get("isSelected") === true) {
                    Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), this.get("selectionIDX")]);
                }
                else {
                    // model.collection besser?!
                    Radio.trigger("Map", "removeLayer", this.get("layer"));
                }
            }
        },

        /**
         * Wenn die Attributions als Objekt definiert ist,
         * wird in einem bestimmten Intervall die Attributions angefragt, solange "isVisibleInMap" true ist
         * Wird für die Verkehrslage auf den Autobahnen genutzt
         * @returns {void}
         */
        toggleAttributionsInterval: function () {
            var channelName, eventName, timeout;

            if (this.has("layerAttribution") && _.isObject(this.get("layerAttribution"))) {
                channelName = this.get("layerAttribution").channel;
                eventName = this.get("layerAttribution").eventname;
                timeout = this.get("layerAttribution").timeout;

                if (this.get("isVisibleInMap") === true) {
                    Radio.trigger(channelName, eventName, this);
                    this.get("layerAttribution").interval = setInterval(function (model) {
                        Radio.trigger(channelName, eventName, model);
                    }, timeout, this);
                }
                else {
                    clearInterval(this.get("layerAttribution").interval);
                }
            }
        },

        updateLayerTransparency: function () {
            var opacity = (100 - this.get("transparency")) / 100;

            // Auch wenn die Layer im simple Tree noch nicht selected wurde können
            // die Settings angezeigt werden. Das Layer objekt wurden dann jedoch noch nicht erzeugt und ist undefined
            if (!_.isUndefined(this.get("layer"))) {
                this.get("layer").setOpacity(opacity);
            }
        },
        /**
         * Diese Funktion initiiert für den abgefragten Layer die Darstellung der Information und Legende.
         * In layerinformation/model wird bei Layern ohne LegendURL auf null getestet.
         * @returns {void}
         */
        showLayerInformation: function () {
            var metaID = [],
                legend = Radio.request("Legend", "getLegend", this),
                name = this.get("name"),
                layerMetaId = this.get("datasets") && this.get("datasets")[0] ? this.get("datasets")[0].md_id : null;

            metaID.push(layerMetaId);

            Radio.trigger("LayerInformation", "add", {
                "id": this.get("id"),
                "legend": legend,
                "metaID": metaID,
                "layername": name,
                "url": this.get("url"),
                "typ": this.get("typ")
            });

            this.setLayerInfoChecked(true);
        },
        setSelectionIDX: function (idx) {
            this.set("selectionIDX", idx);
        },

        moveDown: function () {
            this.collection.moveModelDown(this);
        },
        moveUp: function () {
            this.collection.moveModelUp(this);
        },
        /**
         * Überprüft, ob der Layer einen Metadateneintrag in der Service.json besitzt und gibt die metaID wieder.
         * Wenn nicht wird undefined übergeben, damit die Legende trotzdem gezeichnet werden kann.
         * @returns {undefined|string} metadata id
         */
        getmetaID: function () {
            if (this.get("datasets")[0]) {
                return this.get("datasets")[0].md_id;
            }

            return undefined;

        },
        /**
         * Überprüft, ob der Layer einen Metadateneintrag in der Service.json besitzt und gibt den Metanamen wieder
         * Wenn nicht wird undefined übergeben, damit die Legende trotzdem gezeichnet werden kann.
         * @returns {undefined|string} metadata name
         */
        getmetaName: function () {
            if (this.get("datasets")[0]) {
                return this.get("datasets")[0].md_name;
            }

            return undefined;
        },

        // setter for name
        setName: function (value) {
            this.set("name", value);
        },

        // setter for legendURL
        setLegendURL: function (value) {
            this.set("legendURL", value);
        }

    });

    return Layer;
});
