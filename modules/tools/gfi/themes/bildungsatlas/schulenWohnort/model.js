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
        /**
         * level of schools - keys should equal layernameAreas keys
         */
        level: {"primary": "Primarstufe", "secondary": "Sekundarstufe I"},

        themeType: "primary",
        isViewMobile: false,
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
        const layerStatisticAreas = this.getLayerStatisticAreas();

        // make sure to check on isVisible as well as on isCreated to avoid problems mith multiple einzugsgebieten in gfi
        if (isVisible && this.get("isCreated") === false) {
            this.set("isCreated", true);

            this.setGFIProperties();
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
     * @returns {Void}  -
     */
    setGFIProperties: function () {
        const allProperties = this.get("gfiContent").allProperties,
            layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": this.get("gfiTheme"), "id": this.get("themeId")}),
            gfiFormat = layerList[0].get("gfiFormat");

        this.set("themeType", gfiFormat.gfiBildungsatlasFormat.themeType);
        this.set("isViewMobile", Radio.request("Util", "isViewMobile"));

        if (this.get("themeType") === "secondary") {
            this.set("accountStudents", allProperties.C32_SuS.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }
        else {
            this.set("accountStudents", Math.round(allProperties.C12_SuS).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }

        this.set("urbanAreaNr", allProperties.StatGeb_Nr);
        this.set("urbanArea", allProperties.ST_Name);
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
     * returns the html as hover information
     * @param   {Object} school the school information
     * @param   {Float} relativeNumberOfStudents the percentage of students in this school
     * @returns {Array}  - the template data for mouseoverTemplate as requested by the view
     */
    getDataForMouseHoverTemplate: function (school, relativeNumberOfStudents) {
        return {
            schoolLevel: this.get("level")[this.get("themeType")],
            name: school.get("C_S_Name"),
            address: school.get("C_S_Str") + " " + school.get("C_S_HNr") + "<br>" + school.get("C_S_PLZ") + " " + school.get("C_S_Ort"),
            totalSum: school.get("C_S_SuS"),
            priSum: school.get("C_S_SuS_PS"),
            socialIndex: school.get("C_S_SI") === -1 ? "nicht vergeben" : school.get("C_S_SI"),
            percentage: Math.round(relativeNumberOfStudents) + "%",
            sum: Math.round(this.get("accountStudents") * relativeNumberOfStudents / 100)
        };
    },

    /**
     * returns the areas layer
     * @returns {Object/Boolean}  - the areas layer or false if there is no such layer
     */
    getLayerStatisticAreas: function () {
        const gfiTheme = this.get("layerTheme"),
            themeId = this.get("themeId"),
            layers = Radio.request("ModelList", "getModelsByAttributes", {"gfiTheme": gfiTheme, "id": themeId});

        if (!layers.length) {
            return false;
        }

        return layers[0];
    },

    /**
     * Requests the Modellist for layer with layernameAreas. If necessary this function starts its creation.
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {Layer|Boolean}  - the layer of schools or false if there aren't any
     */
    getLayerSchools: function () {
        const modelAttributes = {"name": this.get("layernameAreas")[this.get("themeType")]},
            conf = Radio.request("Parser", "getItemByAttributes", modelAttributes);
        let layer = Radio.request("ModelList", "getModelByAttributes", modelAttributes);

        if (!layer) {
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
