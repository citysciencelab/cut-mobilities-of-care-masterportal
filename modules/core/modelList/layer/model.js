define(function (require) {

    var Item = require("modules/core/modelList/item"),
        Radio = require("backbone.radio"),
        Layer;

    Layer = Item.extend({
        defaults: {
            // ist der Layer (ol.layer) in der Karte sichtbar
            isVisibleInMap: false,
            // ist das Model im Baum selektiert
            isSelected: false,
            // sind die Einstellungen (Transparenz etc.) vom Model im Baum sichtbar
            isSettingVisible: false,
            // Transparenz in %
            transparency: 0,
            // der Index der die Reihenfolge der selektierten Models beim Zeichnen in "Auswahl der Themen" bestimmt
            selectionIDX: 0
        },
        initialize: function () {
            this.listenToOnce(this, {
                // Die LayerSource wird beim ersten Selektieren einmalig erstellt
                "change:isSelected": this.createLayerSource,
                // Anschließend evt. die ClusterSource und der Layer
                "change:layerSource": function () {
                    if (this.has("clusterDistance") === true) {
                        this.createClusterLayerSource();
                    }
                    this.createLayer();
                },
                "change:layer": function () {
                    this.updateLayerTransparency();
                    this.getResolutions();
                }
            });

            this.listenTo(this, {
                "change:isVisibleInMap": function () {
                    this.toggleLayerOnMap();
                    this.toggleAttributionsInterval();
                },
                "change:transparency": this.updateLayerTransparency,
                "change:SLDBody": this.updateSourceSLDBody
            });

            this.listenTo(Radio.channel("MapView"), {
                "changedOptions": function (options) {
                    this.checkForScale(options);
                }
            });

            this.checkForScale(Radio.request("MapView", "getOptions"));

            //  Ol Layer anhängen, wenn die Layer initial Sichtbar sein soll
            //  Im Lighttree auch nicht selektierte, da dort alle Layer von anfang an einen
            //  selectionIDX benötigen, um verschoben werden zu können
            if (this.getIsSelected() === true || Radio.request("Parser", "getTreeType") === "light") {
                if (_.isUndefined(Radio.request("ParametricURL", "getLayerParams")) === false) {
                    this.collection.appendToSelectionIDX(this);
                }
                else {
                    this.collection.insertIntoSelectionIDX(this);
                }

                this.createLayerSource();
                this.toggleLayerOnMap();
            }
            this.setAttributes();
            this.createLegendURL();
        },

        /**
        * Prüft anhand der Scale ob der Layer sichtbar ist oder nicht
        **/
        checkForScale: function (options) {
            if (parseInt(options.scale, 10) <= this.get("maxScale") && parseInt(options.scale, 10) >= this.get("minScale")) {
                this.setIsOutOfScale(true);
            }
            else {
                this.setIsOutOfScale(false);
            }
        },

        /**
         * abstrakte Funktionen die in den Subclasses überschrieben werden
         */
        createLegendURL: function () {},
        createLayerSource: function () {},
        createLayer: function () {},
        setAttributes: function () {},

        getResolutions: function () {
            var resoByMaxScale = Radio.request("MapView", "getResoByScale", this.getMaxScale(), "max"),
                resoByMinScale = Radio.request("MapView", "getResoByScale", this.getMinScale(), "min");

            this.setMaxResolution(resoByMaxScale + 1);
            this.setMinResolution(resoByMinScale);
        },

        /**
         * Setter für Attribut "layerSource"
         * @param {ol.source} value
         */
        setLayerSource: function (value) {
            this.set("layerSource", value);
        },

        /**
         * Setter für Attribut "layer"
         * @param {ol.layer} value
         */
        setLayer: function (value) {
            this.set("layer", value);
        },

        /**
         * Setter für Attribut "isVisibleInMap"
         * Zusätzlich wird das "visible-Attribut" vom Layer auf den gleichen Wert gesetzt
         * @param {boolean} value
         */
        setIsVisibleInMap: function (value) {
            this.set("isVisibleInMap", value);
            this.getLayer().setVisible(value);
        },

        /**
         * Setter für Attribut "isSelected"
         * @param {boolean} value
         */
        setIsSelected: function (value) {
            this.set("isSelected", value);
        },

        /**
         * Setter für Attribut "isSettingVisible"
         * @param {boolean} value
         */
        setIsSettingVisible: function (value) {
            this.set("isSettingVisible", value);
        },

        /**
         * Setter für Attribut "transparency"
         * @param {number} value
         */
        setTransparency: function (value) {
            this.set("transparency", value);
        },

        setIsOutOfScale: function (value) {
            this.set("isOutOfScale", value);
        },

        setMaxResolution: function (value) {
            this.getLayer().setMaxResolution(value);
        },

        setMinResolution: function (value) {
            this.getLayer().setMinResolution(value);
        },

        /**
         * Getter für Attribut "layerSource"
         * @return {ol.source}
         */
        getLayerSource: function () {
            return this.get("layerSource");
        },

        /**
         * Getter für Attribut "layer"
         * @return {ol.layer}
         */
        getLayer: function () {
            return this.get("layer");
        },

        /**
         * Getter für Attribut "isVisibleInMap"
         * @return {boolean}
         */
        getIsVisibleInMap: function () {
            return this.get("isVisibleInMap");
        },

        /**
         * Getter für Attribut "isSelected"
         * @return {boolean}
         */
        getIsSelected: function () {
            return this.get("isSelected");
        },

        /**
         * Getter für Attribut "isSettingVisible"
         * @return {boolean}
         */
        getIsSettingVisible: function () {
            return this.get("isSettingVisible");
        },

        /**
         * Getter für Attribut "transparency"
         * @return {number}
         */
        getTransparency: function () {
            return this.get("transparency");
        },

        /**
         * Getter für Attribut "attributions"
         * @return {String|Object}
         */
        getAttributions: function () {
            return this.get("layerAttribution");
        },

        getIsOutOfScale: function () {
            return this.get("isOutOfScale");
        },

        getMaxScale: function () {
            return this.get("maxScale");
        },

        getMinScale: function () {
            return this.get("minScale");
        },

        incTransparency: function () {
            if (this.getTransparency() <= 90) {
                this.setTransparency(this.get("transparency") + 10);
            }
        },
        decTransparency: function () {
             if (this.getTransparency() >= 10) {
                this.setTransparency(this.get("transparency") - 10);
            }
        },
        getVersion: function () {
            return this.get("version");
        },

        getImageFormat: function () {
            return this.get("format");
        },

        getTransparent: function () {
            return this.get("transparent");
        },

        toggleIsSelected: function () {
            if (this.getIsSelected() === true) {
                this.setIsSelected(false);
            }
            else {
                this.setIsSelected(true);
            }
        },

        toggleIsVisibleInMap: function () {
            if (this.getIsVisibleInMap() === true) {
                this.setIsVisibleInMap(false);
            }
            else {
                this.setIsVisibleInMap(true);
            }
        },

        toggleIsSettingVisible: function () {
            if (this.getIsSettingVisible() === true) {
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
         * Abhängig vom Attribut "isVisibleInMap"
         */
        toggleLayerOnMap: function () {
            if (this.getIsVisibleInMap() === true) {
                Radio.trigger("Map", "addLayerToIndex", [this.getLayer(), this.getSelectionIDX()]);
            }
            else {
                // model.collection besser?!
                Radio.trigger("Map", "removeLayer", this.getLayer());
            }
        },

        /**
         * Wenn die Attributions als Objekt definiert ist,
         * wird in einem bestimmten Intervall die Attributions angefragt, solange "isVisibleInMap" true ist
         * Wird für die Verkehrslage auf den Autobahnen genutzt
         */
        toggleAttributionsInterval: function () {
            if (this.has("layerAttribution") && _.isObject(this.getAttributions())) {
                var channelName = this.getAttributions().channel,
                    eventName = this.getAttributions().eventname,
                    timeout = this.getAttributions().timeout;

                if (this.getIsVisibleInMap() === true) {
                    Radio.trigger(channelName, eventName, this);
                    this.getAttributions().interval = setInterval (function (model) {
                        Radio.trigger(channelName, eventName, model);
                    }, timeout, this);
                }
                else {
                    clearInterval(this.getAttributions().interval);
                }
            }
        },

        /**
         *
         */
        updateLayerTransparency: function () {
            var opacity = (100 - this.get("transparency")) / 100;
            // Auch wenn die Layer im simple Tree noch nicht selected wurde können
            // die Settings angezeigt werden. Das Layer objekt wurden dann jedoch noch nicht erzeugt und ist undefined
            if (!_.isUndefined(this.getLayer())) {
                this.getLayer().setOpacity(opacity);
            }
        },
        showLayerInformation: function () {
            Radio.trigger("LayerInformation", "add", {
                "id": this.getId(),
                "legendURL": this.get("legendURL"),
                "metaID": this.get("datasets")[0].md_id,
                "name": this.get("datasets")[0].md_name
            });
        },
        setSelectionIDX: function (idx) {
            this.set("selectionIDX", idx);
        },
        getSelectionIDX: function () {
           return this.get("selectionIDX");
        },
        moveDown: function () {
            this.collection.moveModelDown(this);
        },
        moveUp: function () {
            this.collection.moveModelUp(this);
        }
    });

    return Layer;
});
