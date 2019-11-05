import Theme from "../../model";

const SchulenWohnortThemeModel = Theme.extend(/** @lends SchulenWohnortThemeModel.prototype */{
    defaults: _.extend({}, Theme.prototype.defaults, {
        /**
         * layer name of internal layer with Schule
         * @type {String}
         */
        layernameAreas: {"primary": "internal Layer for primary schule am wohnort", "secondary": "internal Layer for middle schule am wohnort"},
        /**
         * layer theme to select school layers for wohnort
         * @type {String}
         */
        layerTheme: "schulenWohnort",
        isCreated: false
    }),
    /**
     * @class SchulenWohnortThemeModel
     * @extends Theme
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @constructs
     * @listens GFI#RadioTriggerGFISetIsVisible
     * @listens Layer#RadioTriggerLayerFeaturesLoaded
     * @fires Core#RadioTriggerUtilIsViewMobileChanged
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     */
    initialize: function () {
        this.set("isViewMobile", Radio.request("Util", "isViewMobile"));

        this.listenTo(this, {
            "change:isReady": this.onIsVisibleEvent
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
            this.destroy();
            this.set("isCreated", false);
        }
    },

    /**
     * Toggles the visibility of this GFI according to its visibitily.
     * @param   {Boolean} isVisible is gfi visible
     * @returns {void}
     */
    onIsVisibleEvent: function (isVisible) {
        // make sure to check on isVisible as well as on isCreated to avoid problems mith multiple einzugsgebieten in gfi
        if (isVisible && this.get("isCreated") === false) {
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
            layerSchuleLevel = layerWohnort[0].get("gfiFormat").gfiBildungsatlasFormat.themeType,
            conf = this.getStatisticAreasConfig(layerSchuleLevel),
            layerStatistischeGebiete = this.getStatisticAreasLayer(layerSchuleLevel),
            statGebNr = this.get("statGebNr");

        if (conf && layerId === conf.id) {
            if (layerStatistischeGebiete && statGebNr !== "") {
                this.filterAreasById(layerStatistischeGebiete, statGebNr, layerSchuleLevel);
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
                layerSchuleLevel = layerWohnort[0].get("gfiFormat").gfiBildungsatlasFormat.themeType,
                layerStatistischeGebiete = this.getStatisticAreasLayer(layerSchuleLevel),
                statGebNr = this.get("statGebNr"),
                level = {"primary": "Primarstufe", "secondary": "Sekundarstufe I"};

            if (this.get("anzahlSchuler") && layerSchuleLevel === "secondary") {
                this.set("anzahlSchuler", this.get("gfiContent").allProperties.C32_SuS);
            }

            this.set("schuleLevel", layerSchuleLevel);
            this.set("level", level);

            this.listenTo(Radio.channel("VectorLayer"), {
                "featuresLoaded": this.onFeaturesLoadedEvent
            });

            if (layerWohnort) {
                this.filterFeature(layerWohnort, [this.get("feature").getId()]);
            }
            else {
                console.warn("Missing data for school filter");
            }

            if (layerStatistischeGebiete && statGebNr !== "") {
                this.filterAreasById(layerStatistischeGebiete, statGebNr, layerSchuleLevel);
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
            layerSchuleLevel = layerWohnort[0].get("gfiFormat").gfiBildungsatlasFormat.themeType,
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
     * @param   {string} layerSchuleLevel pass the parameter for the school level
     * @returns {void}
     */
    filterAreasById: function (layer, statGebNr, layerSchuleLevel) {
        const schulen = layer.get("layer").getSource().getFeatures(),
            featureIds = [],
            anzahlAll = this.get("anzahlSchuler");

        schulen.forEach(function (schule) {
            const statGebFinal = schule.get("SG_" + statGebNr);

            if (statGebFinal) {
                featureIds.push(schule.getId());

                schule.set("html", this.getHtml(schule, anzahlAll, statGebFinal, layerSchuleLevel));
            }
        }.bind(this));

        layer.setIsSelected(true);
        this.filterFeature([layer], featureIds);
    },

    /**
     * returns  the html as hover ionformation
     * @param   {object} schule the school information
     * @param   {number} anzahlAll the whole number of students in this area
     * @param   {float} statGebFinal the percetage of students in this school
     * @param   {string} layerSchuleLevel which level is the school
     * @returns {string} text
     */
    getHtml: function (schule, anzahlAll, statGebFinal, layerSchuleLevel) {
        const name = schule.get("C_S_Name"),
            address = schule.get("C_S_Str") + " " + schule.get("C_S_HNr") + "<br>" + schule.get("C_S_PLZ") + " " + schule.get("C_S_Ort"),
            totalSum = schule.get("C_S_SuS"),
            priSum = schule.get("C_S_SuS_PS"),
            sozialIndex = schule.get("C_S_SI") === -1 ? "nicht vergeben" : schule.get("C_S_SI"),
            percentage = Math.round(statGebFinal) + "%",
            sum = Math.round(anzahlAll * statGebFinal / 100),
            level = {"primary": "Primarstufe", "secondary": "Sekundarstufe I"},
            finalHtml = "<table class=\"table table-striped\">" +
                        "<thead>" +
                            "<tr>" +
                                "<th colspan=\"2\">" + name + "</th>" +
                            "</tr>" +
                        "</thead>" +
                        "<tbody>" +
                            "<tr colspan=\"2\">" +
                                "<td>Adresse: </td>" +
                                "<td>" + address + "</td>" +
                            "</tr>" +
                            "<tr colspan=\"2\">" +
                                "<td>Gesamtanzahl der Schüler: </td>" +
                                "<td>" + totalSum + "</td>" +
                            "</tr>" +
                            "<tr colspan=\"2\">" +
                                "<td>Anzahl der Schülerinnen und Schüler<br> in der Primarstufe: </td>" +
                                "<td>" + priSum + "</td>" +
                            "</tr>" +
                            "<tr colspan=\"2\">" +
                                "<td>Sozialindex der Schüler: </td>" +
                                "<td>" + sozialIndex + "</td>" +
                            "</tr>" +
                            "<tr colspan=\"2\">" +
                                "<td>Anteil der Schülerschaft des angeklickten<br> Gebiets, der diese Schule besucht<br> an der gesamten Schülerschaft des<br> angeklickten Gebiets (" + level[layerSchuleLevel] + "): </td>" +
                                "<td>" + percentage + "</td>" +
                            "</tr>" +
                            "<tr colspan=\"2\">" +
                                "<td>Anzahl: </td>" +
                                "<td>" + sum + "</td>" +
                            "</tr>" +
                        "</tbody>" +
                    "</table>";

        return finalHtml;
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
                this.set("anzahlSchuler", Math.round(attr.C12_SuS));
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
        const layerList = Radio.request("ModelList", "getModelsByAttributes", {"gfiTheme": this.get("layerTheme"), "id": this.get("themeId")});

        if (!Array.isArray(layerList)) {
            console.warn("The layer does not exist");
            return false;
        }

        return layerList;
    },

    /**
     * Requests the Modellist for layer with layernameAreas. If necessary this function starts its creation.
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @param {object} layerSchuleLevel get the key for the layers
     * @returns {Layer|false} layers
     */
    getStatisticAreasLayer: function (layerSchuleLevel) {
        let layer = Radio.request("ModelList", "getModelByAttributes", {"name": this.get("layernameAreas")[layerSchuleLevel]});

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
