const Attributions = Backbone.Model.extend({
    defaults: {
        // true wenn der Inhalt (Attributions) angezeigt wird
        isContentVisible: true,
        // true wenn das Control auf der Karte angezeigt wird
        isVisibleInMap: false,
        isInitOpenDesktop: true,
        isInitOpenMobile: false,
        // Modellist mit Attributions
        attributionList: [],
        isOverviewmap: Boolean(Radio.request("Parser", "getItemByAttributes", {id: "overviewmap"}))
    },

    initialize: function () {
        var channel = Radio.channel("Attributions"),
            config = Radio.request("Parser", "getPortalConfig").controls.attributions;

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
        channel.on({
            "createAttribution": this.createAttribution,
            "removeAttribution": this.removeAttribution
        }, this);
    },
    createAttribution: function (name, text) {
        this.get("attributionList").push({
            name: name,
            text: text
        });
        this.setIsVisibleInMap(true);
        this.setIsContentVisible(true);
    },
    removeAttribution: function (name, text) {
        var filteredAttributions = _.filter(this.get("attributionList"), function (attribution) {
            return attribution.name !== name && attribution.text !== text;
        });

        this.setIsVisibleInMap(false);
        this.setIsContentVisible(false);
        this.setAttributionList(filteredAttributions);
    },
    /**
     * Es wird geprüft, ob Attributions bei den aktuell in der Karten sichtbaren Layern vorliegen
     * Wenn ja, wird die Funktion generateAttributions aufgerufen
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
            this.generateAttributions(modelList);
        }
    },

    /**
     * Holt sich aus der ModelList die aktuellen in der Karte sichtbaren Layern,
     * filter die ohne Attributions raus und schreibt sie in "modelList"
     * @param {Model} modelList ModelList
     * @returns {void}
     */
    generateAttributions: function (modelList) {
        var filteredModelList = _.filter(modelList, function (model) {
                return model.has("layerAttribution") && model.get("layerAttribution") !== "nicht vorhanden";
            }),
            attributions = [];

        _.each(filteredModelList, function (model) {
            var attribution = {};

            attribution.name = model.get("name");
            if (_.isObject(model.get("layerAttribution"))) {
                attribution.text = model.get("layerAttribution").text;
            }
            else {
                attribution.text = model.get("layerAttribution");
            }
            attributions.push(attribution);
        });

        this.setAttributionList(attributions);
    },

    setIsContentVisible: function (value) {
        this.set("isContentVisible", value);
    },

    setIsVisibleInMap: function (value) {
        this.set("isVisibleInMap", value);
    },

    setAttributionList: function (value) {
        this.set("attributionList", value);
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
