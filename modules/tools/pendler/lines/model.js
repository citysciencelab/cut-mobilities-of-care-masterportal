import PendlerCoreModel from "../core/model";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import thousandsSeparator from "../../../../src/utils/thousandsSeparator";
import store from "../../../../src/app-store";

const Lines = PendlerCoreModel.extend(/** @lends Lines.prototype */{
    defaults: Object.assign({}, PendlerCoreModel.prototype.defaults, {
        zoomLevel: 0,
        // Layer zur Darstellung der Linien / Strahlen
        lineLayer: new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "pendlerLineLayer"
        }),
        // Layer zur Darstellung der Beschriftung an Punkten am Strahlenende
        labelLayer: new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "pendlerLabelLayer"
        }),
        glyphicon: "glyphicon-play-circle",
        // translations
        workplace: "",
        domicile: "",
        chooseDistrict: "",
        chooseBorough: "",
        relationshipsToDisplay: "",
        deleteGeometries: "",
        people: "",
        csvDownload: "",
        top5: "",
        top10: "",
        top15: ""
    }),
    /**
     * @class Lines
     * @extends PendlerCoreModel
     * @memberof pendler
     * @constructs
     * @property {Number} zoomLevel=0 level map is not zoomed
     * @property {Object} lineLayer=new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "pendlerLineLayer"
        }) Layer zur Darstellung der Linien / Strahlen
     * @property {Object} labelLayer=new VectorLayer({
            source: new VectorSource(),
            style: null,
            name: "pendlerLabelLayer"
        }) Layer zur Darstellung der Beschriftung an Punkten am Strahlenende
     * @property {String} glyphicon="glyphicon-play-circle" icon to start the animation
     * @fires Core#RadioTriggerMapRender
     */

    /**
     * Iterates over the given features and prepares the data for the legend.
     * @param {Object[]} features array of 'gemeinde' features
     * @returns {void}
     */
    preparePendlerLegend: function (features) {
        const pendlerLegend = [];

        features.forEach(feature => {
            // Ein Feature entspricht einer Gemeinde. Extraktion der für die Legende
            // nötigen Attribute (abhängig von der gewünschten Richtung).
            pendlerLegend.push({
                anzahlPendler: thousandsSeparator(feature.get(this.get("attrAnzahl"))),
                name: feature.get(this.get("attrGemeinde"))
            });
        });

        this.set("pendlerLegend", pendlerLegend);
    },
    /**
     * creates the layers and their order and centers the 'gemeinde'
     * @returns {void}
     */
    handleData: function () {
        const rawFeatures = this.get("lineFeatures");
        let topFeatures = null,
            lineLayer = null,
            labelLayer = null;

        // Handling for "no data": Just refresh legend (clear and print message).
        if (rawFeatures.length === 0) {

            // Since legend is already rendered while data is fetched it's necessary to introduce a flag for empty result.
            // Otherwise the message for "empty result" is printed always before the data has been fetched.
            this.set("emptyResult", true);
            return;
        }

        // Add layers for lines and labels if neccessary. If Layers
        // are already exiting clean them.
        labelLayer = Radio.request("Map", "createLayerIfNotExists", "pendlerLabelLayer");
        this.set("pendlerLabelLayer", labelLayer);
        this.get("pendlerLabelLayer").getSource().clear();
        lineLayer = Radio.request("Map", "createLayerIfNotExists", "pendlerLineLayer");
        this.set("pendlerLineLayer", lineLayer);
        this.get("pendlerLineLayer").getSource().clear();

        // Lege die Reihenfolge der Layer fest, damit die Beschriftungen nicht von den Zahlen überdeckt werden.
        this.assertLayerOnTop("pendlerLineLayer");
        this.assertLayerOnTop("pendlerLabelLayer");

        // Zentriere View auf die Gemeinde, zeichne aber keinen Marker ein.
        this.centerGemeinde(false);

        topFeatures = this.selectFeatures(rawFeatures);

        this.preparePendlerLegend(topFeatures);
        this.createFeatures(topFeatures);
        // setzte den layer nochmals ganz oben drauf, da der z-index zwischenzeitlich angepaßt wurde
        this.assertLayerOnTop("pendlerLabelLayer");

        Radio.trigger("Map", "render");
    },

    /**
     * Erzeuge die Strahlen mit Beschriftung für jede Gemeinde.
     * @param {Object[]} features Feature-Liste
     * @returns {void} Keine Rückgabe
     */
    createFeatures: function (features) {
        const layer = this.get("pendlerLineLayer");

        this.addCenterLabelToLayer(feature => feature.get(this.get("attrGemeindeContrary")), features, layer);
        features.forEach(feature => {
            this.addBeamFeatureToLayer(feature, layer);
            this.addLabelFeatureToLayer(feature.get(this.get("attrGemeinde")) + "\n" + thousandsSeparator(feature.get(this.get("attrAnzahl"))), feature, layer);
        });

        this.zoomToExtentOfFeatureGroup(features);
    },

    /**
     * Entfernt das Diagramm von der Karte
     * @returns {void}
     */
    clear: function () {
        let lineLayer = null,
            labelLayer = null;

        lineLayer = this.get("pendlerLineLayer");
        if (lineLayer !== undefined) {
            Radio.trigger("Map", "removeLayer", lineLayer);
        }

        labelLayer = this.get("pendlerLabelLayer");
        if (labelLayer !== undefined) {
            Radio.trigger("Map", "removeLayer", labelLayer);
        }
        store.dispatch("MapMarker/removePointMarker");
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        if (this.model.get("isActive") === true) {
            this.model.set({
                "workplace": i18next.t("common:modules.tools.pendler.lines.workplace"),
                "domicile": i18next.t("common:modules.tools.pendler.lines.domicile"),
                "chooseDistrict": i18next.t("common:modules.tools.pendler.lines.chooseDistrict"),
                "chooseBorough": i18next.t("common:modules.tools.pendler.lines.chooseBorough"),
                "relationshipsToDisplay": i18next.t("common:modules.tools.pendler.lines.relationshipsToDisplay"),
                "deleteGeometries": i18next.t("common:modules.tools.pendler.lines.deleteGeometries"),
                "noCommutersKnown": i18next.t("common:modules.tools.pendler.lines.noCommutersKnown"),
                "people": i18next.t("common:modules.tools.pendler.lines.people"),
                "csvDownload": i18next.t("common:modules.tools.pendler.lines.csvDownload"),
                "top5": i18next.t("common:modules.tools.pendler.lines.top5"),
                "top10": i18next.t("common:modules.tools.pendler.lines.top10"),
                "top15": i18next.t("common:modules.tools.pendler.lines.top15"),
                "currentLng": lng
            });
        }
    }
});

export default Lines;
