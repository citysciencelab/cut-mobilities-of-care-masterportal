const Attributions = Backbone.Model.extend({
    defaults: {
        // true wenn der Inhalt (Attributions) angezeigt wird
        isContentVisible: true,
        // true wenn das Control auf der Karte angezeigt wird
        isVisibleInMap: false,
        isInitOpenDesktop: true,
        isInitOpenMobile: false,
        // Modellist mit Attributions
        modelList: [],
        isOverviewmap: Boolean(Radio.request("Parser", "getItemByAttributes", {id: "overviewmap"}))
    },

    initialize: function () {
        var config = Radio.request("Parser", "getPortalConfig").controls.attributions;

        if (typeof config === "object") {
            if (_.has(config, "isInitOpenDesktop") === true) {
                this.setIsInitOpenDesktop(config.isInitOpenDesktop);
            }
            if (_.has(config, "isInitOpenMobile") === true) {
                this.setIsInitOpenMobile(config.isInitOpenMobile);
            }
        }
        this.listenTo(Radio.channel("ModelList"), {
            "updateVisibleInMapList": this.checkModelsByAttributions
        });

        this.checkModelsByAttributions();
    },

    /**
     * Es wird geprüft, ob Attributions bei den aktuell in der Karten sichtbaren Layern vorliegen
     * Wenn ja, wird die Funktion addAttributions aufgerufen
     * @returns {void}
     */
    checkModelsByAttributions: function () {
        var modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true}),
            haveModelsAttributions = _.some(modelList, function (model) {
                return model.get("layerAttribution");
            });

        this.setIsVisibleInMap(haveModelsAttributions);
        this.setIsContentVisible(haveModelsAttributions);
        if (haveModelsAttributions === true) {
            this.addAttributions();
        }
    },

    /**
     * Holt sich aus der ModelList die aktuellen in der Karte sichtbaren Layern,
     * filter die ohne Attributions raus und schreibt sie in "modelList"
     * @returns {void}
     */
    addAttributions: function () {
        var modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true});

        modelList = _.filter(modelList, function (model) {
            return model.has("layerAttribution") && model.get("layerAttribution") !== "nicht vorhanden";
        });

        this.setModelList(modelList);
    },

    setIsContentVisible: function (value) {
        this.set("isContentVisible", value);
    },

    setIsVisibleInMap: function (value) {
        this.set("isVisibleInMap", value);
    },

    setModelList: function (value) {
        this.set("modelList", value);
    },

    // setter for isInitOpenDesktop
    setIsInitOpenDesktop: function (value) {
        this.set("isInitOpenDesktop", value);
    },

    // setter for isInitOpenMobile
    setIsInitOpenMobile: function (value) {
        this.set("isInitOpenMobile", value);
    },

    /**
     * Toggle für Attribut "isContentVisible"
     * @returns {void}
     */
    toggleIsContentVisible: function () {
        if (this.get("isContentVisible") === true) {
            this.setIsContentVisible(false);
        }
        else {
            this.setIsContentVisible(true);
        }
    }

});

export default Attributions;
