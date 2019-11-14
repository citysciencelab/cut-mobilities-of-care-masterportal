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
        isCreated: false,
        accountStudents: "",
        urbanArea: "",
        urbanAreaNr: ""
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
            this.set("isCreated", false);
            this.destroy();
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
            this.set("isCreated", true);
            if (this.parseGfiContent(this.get("gfiContent"))) {
                this.create();
            }
        }
    },

    /**
     * Fired only once when layer of statistical areas is loaded initially to filter areas
     * @param   {string} layerId  layerId that was loaded
     * @returns {void}
     */
    onFeaturesLoadedEvent: function (layerId) {
        const layerHomeAddress = this.getHomeAddressLayer(),
            urbanAreaNr = this.get("urbanAreaNr");
        let layerSchoolLevel,
            conf,
            layerStatistischeGebiete;

        if (layerHomeAddress && layerHomeAddress[0].get("gfiFormat") && layerHomeAddress[0].get("gfiFormat").gfiBildungsatlasFormat.themeType) {
            layerSchoolLevel = layerHomeAddress[0].get("gfiFormat").gfiBildungsatlasFormat.themeType;
        }
        else {
            console.warn("Missing data for school level");
        }

        if (layerSchoolLevel) {
            conf = this.getStatisticAreasConfig(layerSchoolLevel);
            layerStatistischeGebiete = this.getStatisticAreasLayer(layerSchoolLevel);
        }
        else {
            console.warn("Missing data for school areas");
        }

        if (conf && layerId === conf.id) {
            if (layerStatistischeGebiete && urbanAreaNr !== "") {
                this.filterAreasById(layerStatistischeGebiete, urbanAreaNr, layerSchoolLevel);
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
            const layerHomeAddress = this.getHomeAddressLayer(),
                urbanAreaNr = this.get("urbanAreaNr"),
                level = {"primary": "Primarstufe", "secondary": "Sekundarstufe I"};
            let layerSchoolLevel,
                layerStatistischeGebiete;

            this.listenTo(Radio.channel("VectorLayer"), {
                "featuresLoaded": this.onFeaturesLoadedEvent
            });

            if (layerHomeAddress) {
                this.filterFeature(layerHomeAddress, [this.get("feature").getId()]);
                if (layerHomeAddress[0].get("gfiFormat") && layerHomeAddress[0].get("gfiFormat").gfiBildungsatlasFormat.themeType) {
                    layerSchoolLevel = layerHomeAddress[0].get("gfiFormat").gfiBildungsatlasFormat.themeType;
                }
            }
            else {
                console.warn("Missing data for layer theme type");
            }

            this.updateTemplateValue(this.get("accountStudents"), level, layerSchoolLevel, this.get("gfiContent").allProperties.C32_SuS);

            if (layerSchoolLevel) {
                layerStatistischeGebiete = this.getStatisticAreasLayer(layerSchoolLevel);
            }
            else {
                console.warn("Missing data for layer theme type");
            }

            if (layerStatistischeGebiete && urbanAreaNr !== "") {
                this.filterAreasById(layerStatistischeGebiete, urbanAreaNr, layerSchoolLevel);
            }
            else {
                console.warn("Missing data for layer area filter");
            }
        }
    },

    /**
     * Destroys this GFI and resets all layer data
     * @returns {void}
     */
    destroy: function () {
        const layerHomeAddress = this.getHomeAddressLayer();
        let layerSchoolLevel,
            layerStatistischeGebiete;

        if (layerHomeAddress) {
            this.unfilterFeature(layerHomeAddress);
            if (Array.isArray(layerHomeAddress) && layerHomeAddress[0].get("gfiFormat") && layerHomeAddress[0].get("gfiFormat").gfiBildungsatlasFormat.themeType) {
                layerSchoolLevel = layerHomeAddress[0].get("gfiFormat").gfiBildungsatlasFormat.themeType;
            }
        }

        if (layerSchoolLevel) {
            layerStatistischeGebiete = this.getStatisticAreasLayer(layerSchoolLevel);
        }

        if (layerStatistischeGebiete) {
            this.unfilterFeature([layerStatistischeGebiete]);
            layerStatistischeGebiete.setIsSelected(false);
        }
    },

    /**
     * Filters the areas by schoolId
     * @param   {integer} accountStudents - the account of the students
     * @param   {object} level - the level object for primary and secondary school
     * @param   {string} layerSchoolLevel - the current school layer level
     * @param   {integer} accountStudentSecondary - the account of the secondary students
     * @returns {void}
     */
    updateTemplateValue: function (accountStudents, level, layerSchoolLevel, accountStudentSecondary) {
        if (accountStudents && layerSchoolLevel === "secondary") {
            this.set("accountStudents", accountStudentSecondary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }

        this.set("schoolLevel", layerSchoolLevel);
        this.set("level", level);
    },

    /**
     * Filters the areas by schoolId
     * @param   {Layer} layer Layer with statistical areas
     * @param   {string} urbanAreaNr statistische Gebiete Number
     * @param   {string} layerSchoolLevel pass the parameter for the school level
     * @returns {void}
     */
    filterAreasById: function (layer, urbanAreaNr, layerSchoolLevel) {
        const schools = layer.get("layer").getSource().getFeatures(),
            featureIds = [],
            accountsAll = this.get("accountStudents");

        schools.forEach(function (school) {
            const urbanAreaFinal = school.get("SG_" + urbanAreaNr);

            if (urbanAreaFinal) {
                featureIds.push(school.getId());

                school.set("html", this.getHtml(school, accountsAll, urbanAreaFinal, layerSchoolLevel));
            }
        }.bind(this));

        layer.setIsSelected(true);
        this.filterFeature([layer], featureIds);
    },

    /**
     * returns  the html as hover ionformation
     * @param   {object} school the school information
     * @param   {number} accountsAll the whole number of students in this area
     * @param   {float} urbanAreaFinal the percetage of students in this school
     * @param   {string} layerSchoolLevel which level is the school
     * @returns {string} text
     */
    getHtml: function (school, accountsAll, urbanAreaFinal, layerSchoolLevel) {
        const name = school.get("C_S_Name"),
            address = school.get("C_S_Str") + " " + school.get("C_S_HNr") + "<br>" + school.get("C_S_PLZ") + " " + school.get("C_S_Ort"),
            totalSum = school.get("C_S_SuS"),
            priSum = school.get("C_S_SuS_PS"),
            socialIndex = school.get("C_S_SI") === -1 ? "nicht vergeben" : school.get("C_S_SI"),
            percentage = Math.round(urbanAreaFinal) + "%",
            sum = Math.round(accountsAll * urbanAreaFinal / 100),
            level = {"primary": "Primarstufe", "secondary": "Sekundarstufe I"};

        // triggere view an
        this.trigger("renderMouseHover", {
            accountsAll: accountsAll,
            urbanAreaFinal: urbanAreaFinal,
            layerSchoolLevel: layerSchoolLevel,
            name: name,
            address: address,
            totalSum: totalSum,
            priSum: priSum,
            socialIndex: socialIndex,
            percentage: percentage,
            sum: sum,
            level: {"primary": "Primarstufe", "secondary": "Sekundarstufe I"}
        });
    },

    /**
     * parses the gfiContent and sets all variables
     * @param {object} gfiContent gfiContent
     * @returns {boolean} valid true if gfiContent could be parsed
     */
    parseGfiContent: function (gfiContent) {
        if (gfiContent && gfiContent.allProperties) {
            const attr = gfiContent.allProperties;

            this.set("accountStudents", Math.round(attr.C12_SuS).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
            this.set("urbanArea", "Statistisches Gebiet: " + attr.StatGeb_Nr + "<br>(" + attr.ST_Name + ")");
            this.set("urbanAreaNr", attr.StatGeb_Nr);

            return true;
        }

        return false;
    },

    /**
     * check which from layer primary school or secondary scholl
     * @returns {LayerList} return if the current layer
     */
    getHomeAddressLayer: function () {
        const layerList = Radio.request("ModelList", "getModelsByAttributes", {"gfiTheme": this.get("layerTheme"), "id": this.get("themeId")});

        if (!Array.isArray(layerList) || layerList.length === 0) {
            console.warn("The layer does not exist");
            return false;
        }

        return layerList;
    },

    /**
     * Requests the Modellist for layer with layernameAreas. If necessary this function starts its creation.
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @param {object} layerSchoolLevel get the key for the layers
     * @returns {Layer|false} layers
     */
    getStatisticAreasLayer: function (layerSchoolLevel) {
        let layer = Radio.request("ModelList", "getModelByAttributes", {"name": this.get("layernameAreas")[layerSchoolLevel]});

        if (!layer) {
            const conf = this.getStatisticAreasConfig(layerSchoolLevel);

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
     * @param {object} layerSchoolLevel get the key for the layers
     * @returns {object|false} conf
     */
    getStatisticAreasConfig: function (layerSchoolLevel) {
        const conf = Radio.request("Parser", "getItemByAttributes", {"name": this.get("layernameAreas")[layerSchoolLevel]});

        if (!conf) {
            console.warn("No layer configuration with name: " + this.get("layernameAreas")[layerSchoolLevel]);

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
