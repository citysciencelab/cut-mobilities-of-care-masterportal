import Theme from "../../model";

const SchulenWohnortThemeModel = Theme.extend(/** @lends SchulenWohnortThemeModel.prototype */{
    defaults: _.extend({}, Theme.prototype.defaults, {
        name: "",
        id: "",
        address: "",
        countStudents: "",
        countStudentsPrimary: "",
        countStudentsSecondary: "",
        socialIndex: "",
        statGebNr: "",
        /**
         * layer name of internal layer with Schule
         * @type {String}
         */
        layernameAreas: {"primary": "internal Layer for primary schule am wohnort", "sencondary": "internal Layer for middle schule am wohnort"},
        /**
         * layer theme to select school layers for wohnort
         * @type {String}
         */
        layerTheme: "schulenWohnort",
        isCreated: false,
        hintText: "Zur Abfrage der Schülerzahlen bewegen Sie den Mauszeiger auf ein Gebiet."
    }),
    /**
     * @class SchulenEinzugsgebieteThemeModel
     * @extends Theme
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @constructs
     * @property {String} C_S_Name="" Schulname
     * @property {String} C_S_Nr="" SchulId
     * @property {String} C_S_Str="" Straßenname
     * @property {String} C_S_HNr="" Hausnummer
     * @property {String} C_S_PLZ="" Postleitzahl
     * @property {String} C_S_Ort="" Ort
     * @property {String} C_S_SuS_PS="" Anzahl Grundschüler
     * @property {String} C_S_SuS_S1="" Anzahl Sekundarschüler
     * @property {String} C_S_SI="" Sozialindex
     * @property {String} schoolKey="" Kategorie zum stylen
     * @listens GFI#RadioTriggerGFISetIsVisible
     * @listens Layer#RadioTriggerLayerFeaturesLoaded
     * @fires Core#RadioTriggerUtilIsViewMobileChanged
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     */
    initialize: function () {
        if (Radio.request("Util", "isViewMobile")) {
            this.set("hintText", "In der mobilen Ansicht ist keine Abfrage der Schülerzahlen möglich.");
        }
        this.listenTo(this, {
            "change:isVisible": this.onIsVisibleEvent,
            "change:isReady": this.create
        });
        this.listenTo(Radio.channel("GFI"), {
            "isVisible": this.onGFIIsVisibleEvent
        }, this);
    },

    /**
     * Fired when GFI visibility changes
     * @param   {boolean} visible gfi visibility
     * @returns {void}
     */
    onGFIIsVisibleEvent: function (visible) {
        if (visible === false) {
            this.onIsVisibleEvent(null, false);
        }
    },

    /**
     * Toggles the visibility of this GFI according to its visibitily.
     * @param   {object}  gfi       gfi object
     * @param   {Boolean} isVisible is gfi visible
     * @returns {void}
     */
    onIsVisibleEvent: function (gfi, isVisible) {
        // make sure to check on isVisible as well as on isCreated to avoid problems mith multiple einzugsgebieten in gfi
        if (!isVisible && this.get("isCreated") === true) {
            this.destroy();
            this.set("isCreated", false);
        }
        else if (isVisible && this.get("isCreated") === false) {
            this.create();
            this.set("isCreated", true);
        }
    },

    /**
     * Fired only once when layer of statistical areas is loaded initially to filter areas
     * @param   {string} layerId  layerId that was loaded
     * @returns {void}
     */
    onFeaturesLoadedEvent: function (layerId) {
        const layerWohnort = this.getWohnortLayer(),
            layerSchuleLevel = layerWohnort[0].get("schuleLevel"),
            conf = this.getStatisticAreasConfig(layerSchuleLevel),
            layerStatistischeGebiete = this.getStatisticAreasLayer(layerSchuleLevel),
            statGebNr = this.get("statGebNr");

        if (layerId === conf.id) {
            if (layerStatistischeGebiete && statGebNr !== "") {
                this.filterAreasById(layerStatistischeGebiete, statGebNr);
            }
            else {
                console.warn("Missing data for area filter");
            }
        }
    },

    /**
     * Sets this GFI
     * @listens Layer#RadioTriggerLayerFeaturesLoaded
     * @returns {void}
     */
    create: function () {
        if (this.parseGfiContent(this.get("gfiContent"))) {
            const layerWohnort = this.getWohnortLayer(),
                layerSchuleLevel = layerWohnort[0].get("schuleLevel"),
                layerStatistischeGebiete = this.getStatisticAreasLayer(layerSchuleLevel),
                statGebNr = this.get("statGebNr");

            this.listenToOnce(Radio.channel("Layer"), {
                "featuresLoaded": this.onFeaturesLoadedEvent
            });

            if (layerWohnort) {
                this.filterFeature(layerWohnort, [this.get("feature").getId()]);
            }
            else {
                console.warn("Missing data for school filter");
            }

            if (layerStatistischeGebiete && statGebNr !== "") {
                this.filterAreasById(layerStatistischeGebiete, statGebNr);
            }
            else {
                console.warn("Missing data for area filter");
            }
        }
    },

    /**
     * Destroys this GFI and resets all layer data
     * @returns {void}
     */
    destroy: function () {
        const layerWohnort = this.getWohnortLayer(),
            layerSchuleLevel = layerWohnort[0].get("schuleLevel"),
            layerStatistischeGebiete = this.getStatisticAreasLayer(layerSchuleLevel);

        if (layerWohnort) {
            this.unfilterFeature(layerWohnort);
        }

        if (layerStatistischeGebiete) {
            this.unfilterFeature([layerStatistischeGebiete]);
            layerStatistischeGebiete.setIsSelected(false);
        }
    },

    /**
     * Filters the areas by schoolId
     * @param   {Layer} layer Layer with statistical areas
     * @param   {string} statGebNr statistische Gebiete Number
     * @param   {string} schoolKey schoolKey
     * @param   {string} countStudents countStudents
     * @returns {void}
     */
    filterAreasById: function (layer, statGebNr) {
        const areas = layer.get("layer").getSource().getFeatures(),
            featureIds = [];

        areas.forEach(function (area) {
            const statGebFinalNr = area.get("SG_" + statGebNr);

            if (statGebFinalNr && statGebFinalNr !== null) {
                featureIds.push(area.getId());
            }
        });

        layer.setIsSelected(true);
        this.filterFeature([layer], featureIds);
    },

    /**
     * parses the gfiContent and sets all variables
     * @param {object} gfiContent gfiContent
     * @returns {boolean} valid true if gfiContent could be parsed
     */
    parseGfiContent: function (gfiContent) {
        if (gfiContent && gfiContent.allProperties) {
            const attr = gfiContent.allProperties;

            if (attr.C12_SuS) {
                this.set("anzahlSchuler", attr.C12_SuS);
            }
            if (attr.StatGeb_Nr && attr.ST_Name) {
                this.set("statGebiet", "Statistisches Gebiet: " + attr.StatGeb_Nr + "<br>(" + attr.ST_Name + ")");
            }
            if (attr.StatGeb_Nr) {
                this.set("statGebNr", attr.StatGeb_Nr);
            }
            return true;
        }

        return false;
    },

    /**
     * check which from layer primary school or secondary scholl
     * @returns {LayerList} return if the current layer
     */
    getWohnortLayer: function () {
        var layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": "schulenWohnort", "id": this.get("themeId")});

        return layerList;
    },

    /**
     * Requests the Modellist for layer with layernameAreas. If necessary this function starts its creation.
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @param {object} layerSchuleLevel get the key for the layers
     * @returns {Layer|false} layers
     */
    getStatisticAreasLayer: function (layerSchuleLevel) {
        let layer = Radio.request("ModelList", "getModelByAttributes", this.get("layernameAreas")[layerSchuleLevel]);

        if (!layer) {
            const conf = this.getStatisticAreasConfig(layerSchuleLevel);

            if (!conf) {
                console.warn("Cannot create layer without config.");

                return false;
            }
            layer = this.addStatisticAreasLayer(conf);
        }

        return layer;
    },

    /**
     * Requests the Parser for first layer with statistic areas by name
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @param {object} layerSchuleLevel get the key for the layers
     * @returns {object|false} conf
     */
    getStatisticAreasConfig: function (layerSchuleLevel) {
        const conf = Radio.request("Parser", "getItemByAttributes", {"name": this.get("layernameAreas")[layerSchuleLevel]});

        if (!conf) {
            console.warn("No layer configuration with name: " + this.get("layernameAreas")[layerSchuleLevel]);

            return false;
        }
        return conf;
    },

    /**
     * Creates new layer by given configuration
     * @param {object} conf layer configuration
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @returns {Layer} Layer
     */
    addStatisticAreasLayer: function (conf) {
        Radio.trigger("ModelList", "addModelsByAttributes", {id: conf.id});
        const layer = Radio.request("ModelList", "getModelByAttributes", {id: conf.id});

        layer.setIsSelected(true);

        return layer;
    },

    /**
     * Hide all features in all given layers except all features with given id
     * @param   {Layer[]} layers  Layers filtered by gfiTheme
     * @param   {string[]} featureIds Array of feature Id to keep
     * @returns {void}
     */
    filterFeature: function (layers, featureIds) {
        layers.forEach(function (layer) {
            if (layer.get("isSelected")) {
                layer.showFeaturesByIds(featureIds);
            }
        });
    },

    /**
     * Show all features in all given layers
     * @param   {Layer[]} layers Layers to show
     * @returns {void}
     */
    unfilterFeature: function (layers) {
        layers.forEach(function (layer) {
            if (layer.get("isSelected")) {
                layer.showAllFeatures();
            }
        });
    }
});

export default SchulenWohnortThemeModel;
