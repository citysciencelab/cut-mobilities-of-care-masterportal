import Theme from "../../model";

const SchulenEinzugsgebieteThemeModel = Theme.extend(/** @lends SchulenEinzugsgebieteThemeModel.prototype */{
    defaults: _.extend({}, Theme.prototype.defaults, {
        name: "",
        id: "",
        address: "",
        countStudents: "",
        countStudentsPrimary: "",
        countStudentsSecondary: "",
        socialIndex: "",
        /**
         * layer name of internal layer with statistical areas
         * @type {String}
         */
        layernameAreas: "internal Layer for Einzugsgebiete",
        /**
         * layer theme to select school layers for Einzugsgebiete
         * @type {String}
         */
        layerTheme: "schulenEinzugsgebiete",
        /**
         * kind of Einzugsgebiet delivired by feature primary || secondary
         * @type {String}
         */
        schoolKey: "",
        /**
         * due to events order (isReady -> isVisible)
         * but isReady is not fired on gfi toggle
         * and isVisible is fired before the gfi can be rendered
         * this parameter holds the state
         * @type {Boolean}
         */
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
     * Fired only once when layer of statistical areas is loaded initially to filter areas
     * @param   {string} layerId  layerId that was loaded
     * @returns {void}
     */
    onFeaturesLoadedEvent: function (layerId) {
        const conf = this.getStatisticAreasConfig(),
            layerStatistischeGebiete = this.getStatisticAreasLayer(),
            id = this.get("id"),
            schoolKey = this.get("schoolKey"),
            countStudents = this.get("countStudents");

        if (layerId === conf.id) {
            if (layerStatistischeGebiete && id !== "" && schoolKey !== "" && countStudents !== "") {
                this.filterAreasById(layerStatistischeGebiete, id, schoolKey, countStudents);
            }
            else {
                console.warn("Missing data for area filter");
            }
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
     * Sets this GFI
     * @listens Layer#RadioTriggerLayerFeaturesLoaded
     * @returns {void}
     */
    create: function () {
        if (this.parseGfiContent(this.get("gfiContent"))) {
            const layerEinzugsgebiete = this.getEinzugsgebieteLayer(),
                layerStatistischeGebiete = this.getStatisticAreasLayer(),
                id = this.get("id"),
                schoolKey = this.get("schoolKey"),
                countStudents = this.get("countStudents");

            this.listenToOnce(Radio.channel("Layer"), {
                "featuresLoaded": this.onFeaturesLoadedEvent
            });
            if (layerEinzugsgebiete) {
                this.filterFeature(layerEinzugsgebiete, [this.get("feature").getId()]);
            }
            else {
                console.warn("Missing data for school filter");
            }

            if (layerStatistischeGebiete && id !== "" && schoolKey !== "" && countStudents !== "") {
                this.filterAreasById(layerStatistischeGebiete, id, schoolKey, countStudents);
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
        const layerEinzugsgebiete = this.getEinzugsgebieteLayer(),
            layerStatistischeGebiete = this.getStatisticAreasLayer();

        if (layerEinzugsgebiete) {
            this.unfilterFeature(layerEinzugsgebiete);
        }

        if (layerStatistischeGebiete) {
            this.unfilterFeature([layerStatistischeGebiete]);
            layerStatistischeGebiete.setIsSelected(false);
        }
    },

    /**
     * Filters the areas by schoolId
     * @param   {Layer} layer Layer with statistical areas
     * @param   {string} id schoolId
     * @param   {string} schoolKey schoolKey
     * @param   {string} countStudents countStudents
     * @returns {void}
     */
    filterAreasById: function (layer, id, schoolKey, countStudents) {
        const areas = layer.get("layer").getSource().getFeatures(),
            featureIds = [];

        areas.forEach(function (area) {
            const schools = area.get(schoolKey);

            if (schools) {
                schools.forEach(function (school) {
                    if (school.schulId === id) {
                        // remember ids of areas with influence of school
                        featureIds.push(area.getId());
                        // set styling category to those areas
                        area.set("styling", this.getCategory(school.anteil));
                        // set mouse hover field with more informations
                        area.set("text", this.getText(school.anteil, countStudents));
                    }
                }.bind(this));
            }
        }.bind(this));

        layer.setIsSelected(true);
        this.filterFeature([layer], featureIds);
    },

    /**
     * returns  the text as hover ionformation
     * @param   {float} value anteil in %
     * @param   {float} countStudents count students
     * @returns {string} text
     */
    getText: function (value, countStudents) {
        const proportion = Math.round(countStudents * value / 100);

        return "Anteil " + String(Math.round(value)) + "% (Anzahl: " + proportion + ")";
    },

    /**
     * returns the category to render area features
     * @param   {float} value anteil in %
     * @returns {string} styling
     */
    getCategory: function (value) {
        if (value < 5) {
            return "<5";
        }
        else if (value < 10) {
            return "<10";
        }
        else if (value < 15) {
            return "<15";
        }
        else if (value < 30) {
            return "<30";
        }
        return ">=30";
    },

    /**
     * parses the gfiContent and sets all variables
     * @param {object} gfiContent gfiContent
     * @returns {boolean} valid true if gfiContent could be parsed
     */
    parseGfiContent: function (gfiContent) {
        if (gfiContent && gfiContent.allProperties) {
            const attr = gfiContent.allProperties;

            if (attr.C_S_Nr) {
                this.set("id", String(attr.C_S_Nr));
            }
            if (attr.C_S_Name) {
                this.set("name", attr.C_S_Name);
            }
            if (attr.C_S_Str && attr.C_S_HNr && attr.C_S_PLZ && attr.C_S_Ort) {
                this.set("address", attr.C_S_Str + " " + attr.C_S_HNr + ", " + attr.C_S_PLZ + " " + attr.C_S_Ort);
            }
            if (attr.C_S_SuS_PS && attr.C_S_SuS_S1) {
                this.set("countStudents", String(parseInt(attr.C_S_SuS_PS, 10) + parseInt(attr.C_S_SuS_S1, 10)));
            }
            if (attr.C_S_SuS_PS) {
                this.set("countStudentsPrimary", attr.C_S_SuS_PS);
            }
            if (attr.C_S_SuS_S1) {
                this.set("countStudentsSecondary", attr.C_S_SuS_S1);
            }
            if (attr.C_S_SI) {
                this.set("socialIndex", attr.C_S_SI);
            }
            if (attr.schoolKey) {
                this.set("schoolKey", attr.schoolKey);
            }

            return true;
        }

        return false;
    },

    /**
     * requests the Modellist for all layer of einzugsgebiete
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @returns {Layer[]} layers
     */
    getEinzugsgebieteLayer: function () {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {"gfiTheme": this.get("layerTheme")});

        if (!layers || layers.length === 0) {
            console.warn("No layer configuration with gfiTheme: " + this.get("layerTheme"));

            return false;
        }

        return layers;
    },

    /**
     * Requests the Modellist for layer with layernameAreas. If necessary this function starts its creation.
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {Layer|false} layers
     */
    getStatisticAreasLayer: function () {
        let layer = Radio.request("ModelList", "getModelByAttributes", {"name": this.get("layernameAreas")});

        if (!layer) {
            const conf = this.getStatisticAreasConfig();

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
     * @returns {object|false} conf
     */
    getStatisticAreasConfig: function () {
        const conf = Radio.request("Parser", "getItemByAttributes", {"name": this.get("layernameAreas")});

        if (!conf) {
            console.warn("No layer configuration with name: " + this.get("layernameAreas"));

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

export default SchulenEinzugsgebieteThemeModel;
