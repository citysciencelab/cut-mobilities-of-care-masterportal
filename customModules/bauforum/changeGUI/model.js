const BauforumGUIModeler = Backbone.Model.extend(/** @lends BauforumGUIModeler.prototype */{
    defaults: {
        mainStreet: {},
        overviewURL: "",
        conceptId: null
    },

    /**
     * Initialize Model
     * @returns {void}
     */
    initialize: function () {
        const magistrale = this.getMagistraleFromParametricURL(),
            overviewURL = this.getOverviewURL();

        if (!magistrale) {
            console.error("Missing or invalid parameter for MAGISTRALE. Aborting bauforum.");
            return;
        }
        this.setMainStreet(_.values(magistrale)[0]);
        this.setOverviewURL(overviewURL);
        this.triggerMapView(this.get("mainStreet"));
    },

    /**
     * Triggers center coordinates and zoomLevel to mapView with values from config.json
     * @param   {Object} mainStreetSettings Settings of Magistrale
     * @returns {void}
     */
    triggerMapView: function (mainStreetSettings) {
        Radio.trigger("MapView", "setCenter", mainStreetSettings.center, mainStreetSettings.zoomLevel);
    },

    /**
     * Investigates parametricURL for MAGISTRALE and returns it's value in config.json.
     * @returns {Object | null} Data for main street from config.json
     */
    getMagistraleFromParametricURL: function () {
        const parameters = Radio.request("ParametricURL", "getResult"),
            knownMainStreets = Radio.request("Parser", "getPortalConfig").bauforumHackathon;


        if (_.has(parameters, "MAGISTRALE") && _.has(knownMainStreets, parameters.MAGISTRALE)) {
            return _.pick(knownMainStreets, parameters.MAGISTRALE);
        }

        return null;
    },

    /**
     * Returns bauforumOverviewPage from config.json
     * @fires Parser#RadioRequestParserGetPortalConfig
     * @returns {string} url URL configured in config.json as overview page
     */
    getOverviewURL: function () {
        return Radio.request("Parser", "getPortalConfig").bauforumOverviewPage;
    },

    /**
     * Handler to activate Planing
     * @param   {integer} conceptId conceptId of config.json
     * @fires VirtualCity#RadioRequestVirtualCityActivatePlanning
     * @returns {void}
     */
    triggerShowConcept: function (conceptId) {
        this.triggerStopFlight();
        this.triggerHideConcept();

        if (conceptId) {
            this.setConceptId(conceptId);
            Radio.request("VirtualCity", "activatePlanning", conceptId);
        }
    },

    /**
     * Handler to deactivate Planing
     * @fires VirtualCity#RadioRequestVirtualCityDeactivatePlanning
     * @returns {void}
     */
    triggerHideConcept: function () {
        const id = this.get("conceptId");

        if (id) {
            Radio.request("VirtualCity", "deactivatePlanning", id);
            this.setConceptId(null);
        }
    },

    /**
     * Handler to start flight
     * @param   {integer} conceptId conceptId of config.json
     * @fires VirtualCity#RadioRequestVirtualCityGetFlightsForPlanning
     * @fires FlightPlayer#RadioRequestFlightPlayerPlay
     * @returns {void}
     */
    triggerStartFlight: function (conceptId) {
        Radio.request("VirtualCity", "getFlightsForPlanning", conceptId).then((flights) => {
            if (flights[0]) {
                Radio.request("FlightPlayer", "play", flights[0]);
            }
            else {
                console.warn("No flight for " + conceptId + " available.");
            }
        });
    },

    /**
     * Handler to stop flight
     * @fires FlightPlayer#RadioRequestFlightPlayerStop
     * @returns {void}
     */
    triggerStopFlight: function () {
        Radio.request("FlightPlayer", "stop");
    },

    /**
     * Toggles the Stadtmodell according to value
     * @param   {boolean} value layer visibility to set
     * @returns {void}
     */
    toggleStadtmodell: function (value) {
        const layer = Radio.request("ModelList", "getModelByAttributes", {name: "Gebäude LoD2"});

        layer.setIsVisibleInMap(value);
    },

    /**
     * Setter for mainStreet
     * @param {string} mainStreet mainStreet
     * @returns {void}
     */
    setMainStreet: function (mainStreet) {
        this.set("mainStreet", mainStreet);
    },

    /**
     * Setter for overviewURL
     * @param {string} url URL
     * @returns {void}
     */
    setOverviewURL: function (url) {
        this.set("overviewURL", url);
    },

    /**
     * Setter for conceptId
     * @param {string} value conceptId
     * @returns {void}
     */
    setConceptId: function (value) {
        this.set("conceptId", value);
    }
});

export default new BauforumGUIModeler();
