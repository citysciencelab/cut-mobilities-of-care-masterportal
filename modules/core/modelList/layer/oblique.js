import Layer from "./model";
import Collection from "vcs-oblique/src/vcs/oblique/collection";
import {get} from "ol/proj.js";

const ObliqueLayer = Layer.extend({
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["none"],
        showSettings: false,
        isVisibleInTree: false
    }),
    initialize: function () {
        Radio.trigger("ObliqueMap", "registerLayer", this);
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
                this.toggleAttributionsInterval();
            }
        });
        // set default value for resolution
        this.set("resolution", this.get("resolution") || 10);
    },

    /**
     * gibt die Oblique Collection zurück in einem Promise,
     * falls die Meta Daten noch nicht geladen sind, werden sie geladen.
     * @returns {Promise} -
     */
    getObliqueCollection: function () {
        var projection, proj, obliqueCollection, hideLevels, minZoom;

        if (this.has("obliqueCollection")) {
            return Promise.resolve(this.get("obliqueCollection"));
        }
        hideLevels = this.get("hideLevels") || 0;
        minZoom = this.get("minZoom") || 0;
        projection = Radio.request("MapView", "getProjection");
        proj = get(projection);
        obliqueCollection = new Collection({
            terrainProvider: null,
            projection: proj,
            hideLevels: hideLevels,
            minZoom: minZoom
        });
        return obliqueCollection.loadData(this.get("url")).then(function () {
            this.setObliqueCollection(obliqueCollection);
            return obliqueCollection;
        }.bind(this));
    },


    /**
     * @param {oblique.Collection} obliqueCollection -
     * @returns {void}
     */
    setObliqueCollection: function (obliqueCollection) {
        this.set("obliqueCollection", obliqueCollection);
    },
    /**
     * Der Layer wird der Karte hinzugefügt, bzw. von der Karte entfernt
     * Abhängig vom Attribut "isSelected"
     * @returns {void}
     */
    activateLayerOnMap: function () {
        if (Radio.request("ObliqueMap", "isActive") === true) {
            if (this.get("isVisibleInMap") === true) {
                Radio.trigger("ObliqueMap", "activateLayer", this);
            }
        }
    },

    /**
     * wird von der ObliqueMap aufgerufen, wenn ein anderer Oblique Layer aktiviert wird.
     * (dies ist die einzige Möglichkeit den layer zu deaktivieren)
     * @returns {void}
     */
    deactivateLayer: function () {
        this.set("isVisibleInMap", false);
        this.set("isSelected", false);
    },

    /**
     * Setter für Attribut "isVisibleInMap"
     * Zusätzlich wird das "visible-Attribut" vom Layer auf den gleichen Wert gesetzt
     * wird nur ausgeführt wenn der Layer aktiviert wird. Oblique Layer können nicht direkt ausgeschaltet werden,
     * nur indirekt indem ein anderer Layer aktiviert wird. über die Funktion deactivateLayer
     * @param {boolean} value -
     * @returns {void}
     */
    setIsVisibleInMap: function (value) {
        if (value) {
            this.set("isVisibleInMap", value);
            this.activateLayerOnMap();
        }
    }
});

export default ObliqueLayer;
