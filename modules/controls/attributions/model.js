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
        channel.on({
            "createAttribution": this.createAttribution,
            "removeAttribution": this.removeAttribution
        }, this);
    },
    createAttribution: function (name, text, type) {
        this.get("attributionList").push({
            type: type,
            name: name,
            text: text
        });
        this.setIsVisibleInMap(true);
        this.setIsContentVisible(true);
        this.trigger("renderAttributions");
    },
    removeAttribution: function (name, text, type) {
        var filteredAttributions = _.filter(this.get("attributionList"), function (attribution) {
            return attribution.name !== name && attribution.text !== text && attribution.type !== type;
        });

        this.setAttributionList(filteredAttributions);
        if (filteredAttributions.length === 0) {
            this.setIsContentVisible(false);
        }
        this.trigger("renderAttributions");
    },
    /**
     * Es wird geprüft, ob Attributions bei den aktuell in der Karten sichtbaren Layern vorliegen
     * Wenn ja, wird die Funktion generateAttributions aufgerufen
     * @returns {void}
     */
    checkModelsByAttributions: function () {
        var modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true}),
            filteredModelList = _.filter(modelList, function (model) {
                return model.has("layerAttribution") && model.get("layerAttribution") !== "nicht vorhanden";
            });

        this.removeAllLayerAttributions();
        if (filteredModelList.length > 0) {
            this.generateAttributions(filteredModelList);
        }
    },
    removeAllLayerAttributions: function () {
        var attributions = this.get("attributionList"),
            filteredAttributions = _.filter(attributions, function (attribution) {
                return attribution.type !== "layer";
            });

        this.setAttributionList(filteredAttributions);
    },
    /**
     * Holt sich aus der ModelList die aktuellen in der Karte sichtbaren Layern,
     * filter die ohne Attributions raus und schreibt sie in "modelList"
     * @param {Model} filteredModelList ModelList
     * @returns {void}
     */
    generateAttributions: function (filteredModelList) {
        _.each(filteredModelList, function (model) {
            var name = model.get("name"),
                text = "",
                type = "layer";

            if (_.isObject(model.get("layerAttribution"))) {
                text = model.get("layerAttribution").text;
            }
            else {
                text = model.get("layerAttribution");
            }
            this.createAttribution(name, text, type);
        }, this);
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
