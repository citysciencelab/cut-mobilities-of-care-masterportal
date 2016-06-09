define([
    "modules/core/modelList/item",
    "backbone.radio"
], function () {

    var Item = require("modules/core/modelList/item"),
        Radio = require("backbone.radio"),
        Layer;

    Layer = Item.extend({
        defaults: {
            // true wenn der Layer sichtbar ist
            isVisibleInMap: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // true wenn die Node sichtbar ist
           // isVisible: false,
            // true wenn die Node "gechecked" ist
            isSelected: false,
            // die ID der Parent-Node
            parentId: "",
            // Layer Name
            name: "",
            // true wenn die Einstellungen (Transparenz etc.) sichtbar sind
            isSettingVisible: false,
            // die Transparenz des Layers
            transparence: 0,
            // der Index der die Reihenfolge beim Zeichnen der ausgewählten Layer bestimmt
            selectionIDX: 0
        },
        initialize: function () {

            this.listenToOnce(this, {
                // Die LayerSource wird beim ersten Aktivieren einmalig erstellt
                "change:isSelected": this.createLayerSource,
                // Anschließend evt. die ClusterSource und der Layer
                "change:layerSource": function () {
                    if (this.has("clusterDistance") === true) {
                        this.createClusterLayerSource();
                    }
                    this.createLayer();
                },
                "change:layer": this.createLegendURL
            });

            this.listenTo(this, {
                "change:isSelected": function () {
                    this.setIsVisibleInMap(this.getIsSelected());
                },
                "change:isVisibleInMap": function () {
                    this.toggleLayerOnMap();
                },
                "change:transparence": this.updateLayerTransparence
            });

            if (this.getIsVisibleInMap() === true) {
                this.setIsSelected(true);
            }
        },

        /**
         * abstrakte Funktionen die in den Subclasses überschrieben werden
         */
        createLayerSource: function () {},
        createLayer: function () {},

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
         * Setter für Attribut "transparence"
         * @param {number} value
         */
        setTransparence: function (value) {
            this.set("transparence", value);
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
         * Getter für Attribut "transparence"
         * @return {number}
         */
        getTransparence: function () {
            return this.get("transparence");
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
                this.setSelectionIDX(Radio.request("ModelList", "getSelectionIDX", this));
            }
            else {
                this.setIsSelected(true);
                Radio.trigger("ModelList", "removeSelectionIDX", this);
            }
            // TODO nur ausführen wenn parent ein leaffodler ist --> noch zu machen
            this.collection.everyLayerIsSelected(this);
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
                Radio.trigger("Map", "addLayerToIndex", this.getSelectionIDX());
            }
            else {
                Radio.trigger("Map", "removeLayer", this.getLayer());
            }
        },

        /**
         *
         */
        updateLayerTransparence: function () {
            var opacity = (100 - this.get("transparence")) / 100;

            this.get("layer").setOpacity(opacity);
        },
        showLayerInformation: function () {
                Radio.trigger("LayerInformation", "add", {
                    "id": this.getId(),
                    "legendURL": this.get("legendURL"),
                    // "metaURL": this.get("dt"),
                    "metaID": this.get("datasets")[0].md_id,
                    "name": this.get("datasets")[0].md_name
                });
                // window.open(this.get("metaURL"), "_blank");
        },
        setSelectionIDX: function (idx) {
            this.set("selectionIDX", idx);
        },
        getSelectionIDX: function () {
           return this.get("selectionIDX");
       },
       moveDown: function () {
           Radio.trigger("SelectedList", "moveModelDownById", this.getId());
       },
       moveUp: function () {
           Radio.trigger("SelectedList", "modeModelUpById", this.getId());
       }
    });

    return Layer;
});
