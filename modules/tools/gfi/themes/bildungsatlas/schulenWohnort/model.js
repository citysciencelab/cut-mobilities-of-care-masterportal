import Theme from "../../model";

const SchulenWohnortThemeModel = Theme.extend(/** @lends SchulenWohnortThemeModel.prototype */{
    defaults: Object.assign({}, Theme.prototype.defaults, {
        /**
         * the theme type according to config.json -> gfiFormat.gfiBildungsatlasFormat.themeType (should equal school levels: primary, secondary)
         * @type {String}
         */
        themeType: "",
        /**
         * result of Radio.request("Util", "isViewMobile") - sourced out for testing purpose
         */
        isViewMobile: false,
        /**
         * titles for level of schools for each possible themeType (school levels: primary, secondary)
         */
        schoolLevels: {"primary": "Primarstufe", "secondary": "Sekundarstufe I"},
        /**
         * the school level as well formed title based on schoolLevels and themeType
         */
        schoolLevelTitle: "",
        /**
         * correlation between the layer name as defined in config.json (see Themenconfig) and the themeType (school levels: primary, secondary)
         * @type {Object}
         */
        layerNameCorrelation: {"primary": "internal Layer for primary schule am wohnort", "secondary": "internal Layer for middle schule am wohnort"},
        /**
         * simple switch to avoid double calls/events if layer is or is not created
         */
        isCreated: false,
        /**
         * area code of the selected district
         * @type {Integer}
         */
        StatGeb_Nr: 0,
        /**
         * name of the selected district
         * @type {String}
         */
        ST_Name: "",
        /**
         * total number of students in primary schools living in the selected district
         * @type {Integer}
         */
        C12_SuS: 0,
        /**
         * total number of students in middle schools living in the selected district
         * @type {Integer}
         */
        C32_SuS: 0,
        /**
         * the total number of students to show in the gfi based on C12_SuS and C32_SuS choosen by themeType (total number in district)
         * @type {Integer}
         */
        numberOfStudentsInDistrict: 0,
        /**
         * total number of students to show in the gfi based on numberOfStudents formated with thousand points - for calculations use numberOfStudents instead
         * @type {String}
         */
        numberOfStudentsInDistrictFormated: ""
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
        this.listenTo(this, {
            "change:isReady": this.onIsVisibleEvent
        });
        this.listenTo(Radio.channel("GFI"), {
            "isVisible": this.onGFIIsVisibleEvent
        }, this);
    },

    /**
     * sets isCreated to true if isVisible and not yet created
     * @param   {Boolean} isVisible is gfi visible
     * @returns {Void}  -
     */
    onIsVisibleEvent: function (isVisible) {
        // make sure to check on isVisible as well as on isCreated to avoid problems mith multiple einzugsgebieten in gfi
        if (isVisible && this.get("isCreated") === false) {
            const layerStatisticAreas = this.getLayerStatisticAreas(),
                allProperties = this.get("gfiContent").allProperties,
                layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": this.get("gfiTheme"), "id": this.get("themeId")});

            let gfiBildungsatlasFormat = {};

            this.set("isCreated", true);

            if (layerList && Array.isArray(layerList) && layerList.length > 0 && layerList[0].get("gfiFormat") && layerList[0].get("gfiFormat").gfiBildungsatlasFormat) {
                gfiBildungsatlasFormat = layerList[0].get("gfiFormat").gfiBildungsatlasFormat;
            }

            if (gfiBildungsatlasFormat.themeType) {
                this.setGFIProperties(allProperties, gfiBildungsatlasFormat.themeType, Radio.request("Util", "isViewMobile"));
            }

            this.showFeaturesByIds(layerStatisticAreas, [this.get("feature").getId()]);
        }
    },

    /**
     * Fired when GFI visibility changes, resets to area layer if GFI visibility is false
     * @param   {Boolean} visible gfi visibility
     * @returns {Void}  -
     */
    onGFIIsVisibleEvent: function (visible) {
        if (visible === false) {
            this.set("isCreated", false);
            this.reset();
        }
    },

    /**
     * Sets this GFI
     * @pre default values (as defined in model.defaults) are in place
     * @post default values themeType, isViewMobile, numberOfStudentsInDistrict, StatGeb_Nr and ST_Name are set accordingly to the given arguments
     * @param   {Object} allProperties the properties of this model as simple object that may include {C32_SuS, C12_SuS, StatGeb_Nr, ST_Name}
     * @param   {String} themeType the type of this theme as defined in config.json -> gfiFormat.gfiBildungsatlasFormat.themeType
     * @param   {Boolean} isViewMobile true if this is a mobile device, false if otherwise
     * @returns {Void}  -
     */
    setGFIProperties: function (allProperties, themeType, isViewMobile) {
        const schoolLevels = this.get("schoolLevels");

        if (schoolLevels && schoolLevels.hasOwnProperty(themeType)) {
            this.set("schoolLevelTitle", schoolLevels[themeType]);
        }

        this.set("themeType", themeType);
        this.set("isViewMobile", Boolean(isViewMobile));

        if (themeType === "primary" && allProperties.hasOwnProperty("C12_SuS")) {
            this.set("numberOfStudentsInDistrict", Math.round(allProperties.C12_SuS));
            this.set("numberOfStudentsInDistrictFormated", Math.round(allProperties.C12_SuS).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }
        else if (themeType === "secondary" && allProperties.hasOwnProperty("C32_SuS")) {
            this.set("numberOfStudentsInDistrict", Math.round(allProperties.C32_SuS));
            this.set("numberOfStudentsInDistrictFormated", Math.round(allProperties.C32_SuS).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }

        if (allProperties.hasOwnProperty("StatGeb_Nr")) {
            this.set("StatGeb_Nr", allProperties.StatGeb_Nr);
        }

        if (allProperties.hasOwnProperty("ST_Name")) {
            this.set("ST_Name", allProperties.ST_Name);
        }
    },

    /**
     * shows the features of the area layer, hides school layers
     * @returns {Void}  -
     */
    reset: function () {
        const layerStatisticAreas = this.getLayerStatisticAreas(),
            layerSchools = this.getLayerSchools();

        this.showAllFeatures(layerStatisticAreas);

        if (layerSchools) {
            this.showAllFeatures(layerSchools);
            layerSchools.setIsSelected(false);
        }
    },

    /**
     * @typedef {Object} DataForMouseHoverTemplate
     * @property {String} schoolLevelTitle the well formated level of the school (e.g. "Primarstufe")
     * @property {String} schoolName the full name of the school
     * @property {Object} address the address of the school
     * @property {String} address.street the street
     * @property {String} address.houseNumber the house number
     * @property {String} address.postalCode the postal code (zip code)
     * @property {String} address.city the city
     * @property {Integer} numberOfStudents the total number of students at this school
     * @property {Integer} numberOfStudentsPrimary the total number of primary students at this school (if secondary school only this may be 0)
     * @property {String} socialIndex a number to describe the economical and social milieu of the students (see http://www.arge.schule-hamburg.de/Archiv/STISozialindex.html) - can be "nicht vergeben"
     * @property {Integer} percentageOfStudentsFromDistrict the percentage [0 .. 100] of students at this school from the selected district as defined in school.get("SG_" + StatGeb_Nr)
     * @property {Integer} numberOfStudentsFromDistrict the total number of students at this school from the district
     */

    /**
     * returns the html as hover information
     * @param   {Object} school an object type Feature with the school information
     * @param   {function(String):*} school.get a function to request information from the feature
     * @param   {String} schoolLevelTitle the school level as defined in defaults.schoolLevels and selected with themeType
     * @param   {Integer} StatGeb_Nr the area code of the selected district as defined in defaults.StatGeb_Nr
     * @param   {Integer} numberOfStudentsInDistrict total number of students in the selected district
     * @returns {DataForMouseHoverTemplate}  - the data for the mouseoverTemplate used by the view to fill its html placeholders
     */
    getDataForMouseHoverTemplate: function (school, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict) {
        const data = {
            schoolLevelTitle: schoolLevelTitle,
            schoolName: "",
            address: {
                street: "",
                houseNumber: "",
                postalCode: "",
                city: ""
            },
            numberOfStudents: "",
            numberOfStudentsPrimary: "",
            socialIndex: "",
            percentageOfStudentsFromDistrict: 0,
            numberOfStudentsFromDistrict: 0
        };

        if (school && typeof school.get === "function") {
            const percentage = this.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr) === false ? 0 : this.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr);

            data.schoolName = school.get("C_S_Name");
            data.address.street = school.get("C_S_Str");
            data.address.houseNumber = school.get("C_S_HNr");
            data.address.postalCode = school.get("C_S_PLZ");
            data.address.city = school.get("C_S_Ort");
            data.numberOfStudents = school.get("C_S_SuS");
            data.numberOfStudentsPrimary = school.get("C_S_SuS_PS");
            data.socialIndex = school.get("C_S_SI") === -1 ? "nicht vergeben" : school.get("C_S_SI");
            data.percentageOfStudentsFromDistrict = Math.round(percentage);
            data.numberOfStudentsFromDistrict = Math.round(numberOfStudentsInDistrict * percentage / 100);
        }

        return data;
    },

    /**
     * get the percentage of students as defined in school using the parameter StatGeb_Nr
     * @param   {Object} school an object type Feature with the school information
     * @param   {function(String):*} school.get a function to request information from the feature
     * @param   {Integer} StatGeb_Nr the area code of the selected district as defined in defaults.StatGeb_Nr
     * @returns {Float|Boolean}  the percentage of students defined in school.get("SG_" + StatGeb_Nr) - this should be a float [0 .. 100] - or false if the school seems to have no students from the district defined by StatGeb_Nr
     */
    getPercentageOfStudentsByStatGeb_Nr: function (school, StatGeb_Nr) {
        if (!school || typeof school.get !== "function" || school.get("SG_" + StatGeb_Nr) === undefined) {
            return false;
        }

        return school.get("SG_" + StatGeb_Nr);
    },

    /**
     * returns the areas layer
     * @returns {Object/Boolean}  - the areas layer or false if there is no such layer
     */
    getLayerStatisticAreas: function () {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {"gfiTheme": this.get("gfiTheme"), "id": this.get("themeId")});

        if (!layers.length || layers.length === 0) {
            return false;
        }

        return layers[0];
    },

    /**
     * Requests the Modellist for layer with layerNameCorrelation. If necessary this function starts its creation.
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {Layer|Boolean}  - the layer of schools or false if there aren't any
     */
    getLayerSchools: function () {
        const modelAttributes = {"name": this.get("layerNameCorrelation")[this.get("themeType")]},
            /**
             * conf as {Object} - a simple object {id, ...} with config parameters (see config.json -> Themenconfig)
             * conf is the config of the module based on config.json Themenconfig found by name (see defaults.layerNameCorrelation) choosen by themeType
             */
            conf = Radio.request("Parser", "getItemByAttributes", modelAttributes);
        let layer = Radio.request("ModelList", "getModelByAttributes", modelAttributes);

        if (!layer && conf && conf.hasOwnProperty("id")) {
            Radio.trigger("ModelList", "addModelsByAttributes", {id: conf.id});
            layer = Radio.request("ModelList", "getModelByAttributes", {id: conf.id});
            layer.setIsSelected(true);
        }

        return layer;
    },

    /**
     * Hide all features in all given layers except all features with given id
     * @param   {Object} layer the Layer filtered by gfiTheme
     * @param   {String[]} featureIds Array of feature Id to keep
     * @returns {Void}  -
     */
    showFeaturesByIds: function (layer, featureIds) {
        if (layer && layer.get("isSelected")) {
            layer.showFeaturesByIds(featureIds);
        }
    },

    /**
     * creates an array of featureIds to select by the model
     * @param {Feature[]} schools an array of features to check
     * @param {String} StatGeb_Nr the urban area number based on the customers content (equals StatGeb_Nr)
     * @returns {Integer[]}  an array of feature ids where the feature is grouped by StatGeb_Nr
     */
    getFeatureIds: function (schools, StatGeb_Nr) {
        const featureIds = [];

        if (!Array.isArray(schools)) {
            return featureIds;
        }

        schools.forEach(function (school) {
            if (this.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr) === false) {
                // continue with forEach
                return;
            }

            featureIds.push(school.getId());
        }, this);

        return featureIds;
    },

    /**
     * Show all features in all given layers
     * @param   {Object} layer Layer to show
     * @returns {Void}  -
     */
    showAllFeatures: function (layer) {
        if (layer && layer.get("isSelected")) {
            layer.showAllFeatures();
        }
    }
});

export default SchulenWohnortThemeModel;
