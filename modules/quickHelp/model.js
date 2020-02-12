const QuickHelpModel = Backbone.Model.extend(/** @lends QuickHelpModel.prototype */{
    defaults: {
        imgPath: "/",
        searchbarAllgemeines1: "allgemein.png",
        searchbarAllgemeines2: "allgemein_2.png",
        searchbarAllgemeines3: "allgemein_3.png",
        searchbarFlurstueckssuche: "allgemein_4.png",
        aufbau1: "themen.png",
        aufbau2: "themen_2.png",
        statistikFlaecheNiemeier: "Statistik_Flaeche_Niemeier.png",
        statistikStreckeUniErlangen: "Statistik_Strecke_UniErlangen.png",
        utmStreifen: "UTM_Streifen.png",
        utmVerzerrung: "UTM_Verzerrung.png",
        utmFormeln: "UTM_Formeln.png",
        currentHelpTopic: "",
        // translations
        currentLng: "",
        searchTitleText: "",
        generalInfoText: "",
        addressSearchText: "",
        houseNumberSearchText: "",
        topicsSearchText: "",
        parcelSearchText: "",
        generalInfoHelpText1: "",
        generalInfoHelpText2: "",
        addressHelpText: "",
        houseNumberHelpText: "",
        topicsHelpText: "",
        parcelHelpText: "",
        measureTitleText: "",
        statisticalApproxText: "",
        equalizationUTMText: "",
        conversionInMapText: "",
        influenceFactorsText: "",
        scaleText: "",
        resolutionText: "",
        screenResolution: "",
        inputAccuracyText: "",
        measureDistanceText: "",
        standardDeviationText: "",
        spotDefectsText: "",
        errorPropagationLawText: "",
        forDistances: "",
        forAreasText: "",
        errorReasonText: "",
        exampleText: "",
        exampleContentText: "",
        UTMHelp1Text: "",
        UTM6Text: "",
        imageDistortion1Text: "",
        imageDistortion2Text: "",
        formulasText: "",
        useInMapHelpText: "",
        topicTreeTitle: "",
        topicsText: "",
        selectionText: "",
        saveSelectionText: "",
        topicsHelp1Text: "",
        topicsHelp2Text: "",
        topicsHelp3Text: "",
        topicsHelp4Text: "",
        topicsHelp5Text: "",
        topicsHelp6Text: ""
    },
    /**
     * @class QuickHelpModel
     * @extends Backbone.Model
     * @memberof QuickHelp
     * @constructs
     * @property {String} imgPath="/" "Path to folder that contains the images for quickHelp".
     * @property {String} searchbarAllgemeines1="allgemein.png" "First image to be displayed in the Quickhelp of the Searchbar under the menu item General (dt. Allgemeines)."
     * @property {String} searchbarAllgemeines2="allgemein2.png" "Second image to be displayed in the Quickhelp of the Searchbar under the menu item General (dt. Allgemeines)."
     * @property {String} searchbarAllgemeines3="allgemein3.png" "Third image to be displayed in the Quickhelp of the Searchbar under the menu item General (dt. Allgemeines)."
     * @property {String} searchbarFlurstueckssuche="allgemein4.png" "Image to be displayed in the Quickhelp of the Searchbar under the menu item parcel search (dt. Flurstückssuche)."
     * @property {String} aufbau1="themen.png" "First image to be displayed in the Quickhelp of the layertree (CustomTree) under the menu item Structure (dt. Aufbau)."
     * @property {String} aufbau2="themen_2.png" "Second image to be displayed in the Quickhelp of the layertree (CustomTree) under the menu item Structure (dt. Aufbau)."
     * @property {String} statistikFlaecheNiemeier="Statistik_Flaeche_Niemeier.png" "First image to be displayed in the quickHelp of the MeasureTool tool under the menu item Statistical Approach (dt. Statistische Annäherung)."
     * @property {String} statistikStreckeUniErlangen="Statistik_Strecke_UniErlangen.png" "Second image to be displayed in the quickHelp of the MeasureTool tool under the menu item Statistical Approach (dt. Statistische Annäherung)."
     * @property {String} utmStreifen="UTM_Streifen.png" "First image to be displayed in the quickHelp of the MeasureTool under the menu item Equalization (dt. Entzerrung) in UTM."
     * @property {String} utmVerzerrung="UTM_Verzerrung.png" "Second image to be displayed in the quickHelp of the MeasureTool under the menu item Equalization (dt. Entzerrung) in UTM."
     * @property {String} utmFormeln="UTM_Formeln.png" "Third image to be displayed in the quickHelp of the MeasureTool under the menu item Equalization (dt. Entzerrung) in UTM."
     * @property {String} currentHelpTopic="UTM_Formeln.png" "Third image to be displayed in the quickHelp of the MeasureTool under the menu item Equalization (dt. Entzerrung) in UTM."
     * @property {String} currentLng="", contains current language - if this changes the view is rendered
     * @property {String} searchTitleText="", contains translated text
     * @property {String} generalInfoText="", contains translated text
     * @property {String} addressSearchText="", contains translated text
     * @property {String} houseNumberSearchText="", contains translated text
     * @property {String} topicsSearchText="", contains translated text
     * @property {String} parcelSearchText="", contains translated text
     * @property {String} generalInfoHelpText1="", contains translated text
     * @property {String} generalInfoHelpText2="", contains translated text
     * @property {String} addressHelpText="", contains translated text
     * @property {String} houseNumberHelpText="", contains translated text
     * @property {String} topicsHelpText="", contains translated text
     * @property {String} parcelHelpText="", contains translated text
     * @property {String} measureTitleText="", contains translated text
     * @property {String} statisticalApproxText="", contains translated text
     * @property {String} equalizationUTMText="", contains translated text
     * @property {String} conversionInMapText="", contains translated text
     * @property {String} influenceFactorsText="", contains translated text
     * @property {String} scaleText="", contains translated text
     * @property {String} resolutionText="", contains translated text
     * @property {String} screenResolution="", contains translated text
     * @property {String} inputAccuracyText="", contains translated text
     * @property {String} measureDistanceText="", contains translated text
     * @property {String} standardDeviationText="", contains translated text
     * @property {String} spotDefectsText="", contains translated text
     * @property {String} errorPropagationLawText="", contains translated text
     * @property {String} forDistances="", contains translated text
     * @property {String} forAreasText="", contains translated text
     * @property {String} errorReasonText="", contains translated text
     * @property {String} exampleText="", contains translated text
     * @property {String} exampleContentText="", contains translated text
     * @property {String} UTMHelp1Text="", contains translated text
     * @property {String} UTM6Text="", contains translated text
     * @property {String} imageDistortion1Text="", contains translated text
     * @property {String} imageDistortion2Text="", contains translated text
     * @property {String} formulasText="", contains translated text
     * @property {String} useInMapHelpText="", contains translated text
     * @property {String} topicTreeTitle="", contains translated text
     * @property {String} topicsText="", contains translated text
     * @property {String} selectionText="", contains translated text
     * @property {String} saveSelectionText="", contains translated text
     * @property {String} topicsHelp1Text="", contains translated text
     * @property {String} topicsHelp2Text="", contains translated text
     * @property {String} topicsHelp3Text="", contains translated text
     * @property {String} topicsHelp4Text="", contains translated text
     * @property {String} topicsHelp5Text="", contains translated text
     * @property {String} topicsHelp6Text="", contains translated text
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.changeLang(i18next.language);
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        this.set({
            currentLng: lng,
            searchTitleText: i18next.t("common:modules.quickHelp.search.title"),
            generalInfoText: i18next.t("common:modules.quickHelp.search.generalInfo"),
            addressSearchText: i18next.t("common:modules.quickHelp.search.addressSearch"),
            houseNumberSearchText: i18next.t("common:modules.quickHelp.search.houseNumberSearch"),
            topicsSearchText: i18next.t("common:modules.quickHelp.search.topicsSearch"),
            parcelSearchText: i18next.t("common:modules.quickHelp.search.parcelSearch"),
            generalInfoHelpText1: i18next.t("common:modules.quickHelp.search.generalInfoHelp1"),
            generalInfoHelpText2: i18next.t("common:modules.quickHelp.search.generalInfoHelp2"),
            addressHelpText: i18next.t("common:modules.quickHelp.search.addressHelp"),
            houseNumberHelpText: i18next.t("common:modules.quickHelp.search.houseNumberHelp"),
            topicsHelpText: i18next.t("common:modules.quickHelp.search.topicsHelp"),
            parcelHelpText: i18next.t("common:modules.quickHelp.search.parcelHelp"),
            measureTitleText: i18next.t("common:modules.quickHelp.measureTool.title"),
            statisticalApproxText: i18next.t("common:modules.quickHelp.measureTool.statisticalApprox"),
            equalizationUTMText: i18next.t("common:modules.quickHelp.measureTool.equalizationUTM"),
            conversionInMapText: i18next.t("common:modules.quickHelp.measureTool.conversionInMap"),
            influenceFactorsText: i18next.t("common:modules.quickHelp.measureTool.influenceFactors"),
            scaleText: i18next.t("common:modules.quickHelp.measureTool.scale"),
            resolutionText: i18next.t("common:modules.quickHelp.measureTool.resolution"),
            screenResolutionText: i18next.t("common:modules.quickHelp.measureTool.screenResolution"),
            inputAccuracyText: i18next.t("common:modules.quickHelp.measureTool.inputAccuracy"),
            measureDistanceText: i18next.t("common:modules.quickHelp.measureTool.measureDistance"),
            standardDeviationText: i18next.t("common:modules.quickHelp.measureTool.standardDeviation"),
            spotDefectsText: i18next.t("common:modules.quickHelp.measureTool.spotDefects"),
            errorPropagationLawText: i18next.t("common:modules.quickHelp.measureTool.errorPropagationLaw"),
            forDistancesText: i18next.t("common:modules.quickHelp.measureTool.forDistances"),
            forAreasText: i18next.t("common:modules.quickHelp.measureTool.forAreas"),
            errorReasonText: i18next.t("common:modules.quickHelp.measureTool.errorReason"),
            exampleText: i18next.t("common:modules.quickHelp.measureTool.example"),
            exampleContentText: i18next.t("common:modules.quickHelp.measureTool.exampleContent"),
            UTMHelp1Text: i18next.t("common:modules.quickHelp.measureTool.UTMHelp1"),
            UTM6Text: i18next.t("common:modules.quickHelp.measureTool.UTM6"),
            imageDistortion1Text: i18next.t("common:modules.quickHelp.measureTool.imageDistortion1"),
            imageDistortion2Text: i18next.t("common:modules.quickHelp.measureTool.imageDistortion2"),
            formulasText: i18next.t("common:modules.quickHelp.measureTool.formulas"),
            useInMapHelpText: i18next.t("common:modules.quickHelp.measureTool.useInMapHelp"),
            topicTreeTitle: i18next.t("common:modules.quickHelp.topicTree.title"),
            topicsText: i18next.t("common:modules.quickHelp.topicTree.topics"),
            selectionText: i18next.t("common:modules.quickHelp.topicTree.selection"),
            saveSelectionText: i18next.t("common:modules.quickHelp.topicTree.saveSelection"),
            topicsHelp1Text: i18next.t("common:modules.quickHelp.topicTree.topicsHelp1"),
            topicsHelp2Text: i18next.t("common:modules.quickHelp.topicTree.topicsHelp2"),
            topicsHelp3Text: i18next.t("common:modules.quickHelp.topicTree.topicsHelp3", {iconCls: "glyphicon glyphicon-info-sign"}),
            topicsHelp4Text: i18next.t("common:modules.quickHelp.topicTree.topicsHelp4"),
            topicsHelp5Text: i18next.t("common:modules.quickHelp.topicTree.topicsHelp5", {iconCls: "glyphicon glyphicon-cog rotate"}),
            topicsHelp6Text: i18next.t("common:modules.quickHelp.topicTree.topicsHelp6")
        });
    },

    /**
    * setter for imgPath
    * @param {string} value imgPath
    * @returns {void}
    */
    setImgPath: function (value) {
        this.set("imgPath", value);
    },
    /**
    * setter for value of the current shown help window
    * @param {string} value type of window (search | tree | measure)
    * @returns {void}
    */
    setCurrentHelpTopic: function (value) {
        this.set("currentHelpTopic", value);
    }
});

export default QuickHelpModel;
