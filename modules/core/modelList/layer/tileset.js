import Layer from "./model";

const TileSetLayer = Layer.extend({
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["3D"],
        showSettings: false

    }),
    initialize: function () {
        this.listenToOnce(this, {
            // Die LayerSource wird beim ersten Selektieren einmalig erstellt
            "change:isSelected": function () {
                if (this.has("tileSet") === false) {
                    this.createTileSet();
                }
            }
        });
        this.listenTo(Radio.channel("Layer"), {
            "updateLayerInfo": function (name) {
                if (this.get("name") === name && this.get("layerInfoChecked") === true) {
                    this.showLayerInformation();
                }
            },
            "setLayerInfoChecked": function (layerInfoChecked) {
                this.setLayerInfoChecked(layerInfoChecked);
            }
        });

        this.listenTo(this, {
            "change:isVisibleInMap": function () {
                // triggert das Ein- und Ausschalten von Layern
                Radio.trigger("ClickCounter", "layerVisibleChanged");
                this.toggleLayerOnMap();
                this.toggleAttributionsInterval();
            }
        });

        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                if (mode === "3D") {
                    this.setIsSelected(true);
                }
                else {
                    this.setIsSelected(false);
                }
            }
        });
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

            this.createTileSet();
            if (this.get("isSelected")) {
                this.listenToOnce(Radio.channel("Map"), {
                    // Die LayerSource wird beim ersten Selektieren einmalig erstellt
                    "activateMap3d": function () {
                        this.toggleLayerOnMap(this.get("isSelected"));
                    }
                });
            }
        }
    },

    /**
     * Der Layer wird der Karte hinzugefügt, bzw. von der Karte entfernt
     * Abhängig vom Attribut "isSelected"
     * @returns {void}
     */
    toggleLayerOnMap: function () {
        var map3d,
            tileset;

        if (Radio.request("Map", "isMap3d") === true) {
            map3d = Radio.request("Map", "getMap3d");
            tileset = this.get("tileSet");

            if (this.get("isVisibleInMap") === true) {
                if (!map3d.getCesiumScene().primitives.contains(tileset)) {
                    map3d.getCesiumScene().primitives.add(tileset);
                }
                else {
                    tileset.show = true;
                }
            }
            else {
                tileset.show = false;
            }
        }
    },

    createTileSet: function () {
        var options;

        if (this.has("tileSet") === false) {
            options = {};
            if (this.has("cesium3DTilesetOptions")) {
                _.extend(options, this.get("cesium3DTilesetOptions"));
            }
            options.url = this.get("url") + "/tileset.json";
            this.setTileSet(new Cesium.Cesium3DTileset(options));
        }
    },

    /**
     * Setter für Attribut "isVisibleInMap"
     * Zusätzlich wird das "visible-Attribut" vom Layer auf den gleichen Wert gesetzt
     * @param {boolean} value -
     * @returns {void}
     */
    setIsVisibleInMap: function (value) {
        this.set("isVisibleInMap", value);
    },

    /**
     * @param {Cesium.Cesium3DTileset} value -
     * @returns {void}
     */
    setTileSet: function (value) {
        this.set("tileSet", value);
    }
});

export default TileSetLayer;
