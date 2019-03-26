const AttributionsModel = Backbone.Model.extend({
    defaults: {
        // true wenn der Inhalt (Attributions) angezeigt wird
        isContentVisible: true,
        // true wenn das Control auf der Karte angezeigt wird
        isVisibleInMap: false,
        isInitOpenDesktop: true,
        isInitOpenMobile: false,
        // Modellist mit Attributions
        attributionList: [],
        // @todo: Shouldnt values of defaults be hard coded?
        isOverviewmap: Boolean(Radio.request("Parser", "getItemByAttributes", {id: "overviewmap"}))
    },
    /**
     * @class AttributionsModel
     * @extends Backbone.Model
     * @memberof Attributions
     * @constructs
     * @property {Radio.channel} channel=Radio.channel("Attributions") Radio channel for communication
     * @property {Boolean} isContentVisible=true Flag if attributions copy is visible
     * @property {Boolean} isVisibleInMap=false Flag if whole module is visible
     * @property {Boolean} isInitOpenDesktop=true Flag if module is initially activated upon load in desktop environment
     * @property {Boolean} isInitOpenMobile=false Flag if module is initially activated upon load in mobile environment
     * @property {Array} attributionList=[] todo
     * @property {Boolean} isOverviewmap=? todo
     * @listens AttributionsModel#RadioTriggerModelListUpdateVisibleInMapList
     * @listens AlertingModel#RadioTriggerAttributionsCreateAttribution
     * @listens AlertingModel#RadioTriggerAttributionsRemoveAttribution
     */
    initialize: function () {
        if (Radio.request("Util", "isViewMobile")) {
            this.setIsContentVisible(this.get("isInitOpenMobile"));
        }
        else {
            this.setIsContentVisible(this.get("isInitOpenDesktop"));
        }

        this.listenTo(Radio.channel("ModelList"), {
            "updateVisibleInMapList": this.checkModelsByAttributions
        });
        this.listenTo(Radio.channel("Attributions"), {
            //"createAttribution": this.test,
            "createAttribution": this.createAttribution,
            "removeAttribution": this.removeAttribution
        });

        console.log(this.get("isVisibleInMap"));

        this.setIsVisibleInMap(this.get("isVisibleInMap"));

        console.log(this.get("isContentVisible"));

        //this.setIsContentVisible(this.get("isContentVisible"));
        this.setIsContentVisible(false );



    },

    /**
     * Creates a single attribution and pushes it into attributions array.
     * Sets module visibility to true and renders it.
     * @todo Should this method do 3 different things?
     * @param {String} name Attribution name
     * @param {String} text Attribution copy
     * @param {String} type Attribution type
     * @fires  AttributionsModel#event:renderAttributions
     * @returns {void}
     */
    createAttribution: function (name, text, type) {
        this.get("attributionList").push({
            type: type,
            name: name,
            text: text
        });
        //this.setIsVisibleInMap(true);
        this.setIsContentVisible(true);
        this.trigger("renderAttributions");
    },
    /**
     * Removes a single attribution from attributions array.
     * Renders module.
     * @param {String} name Attribution name
     * @param {String} text Attribution copy
     * @param {String} type Attribution type
     * @fires  AttributionsModel#event:renderAttributions
     * @returns {void}
     */
    removeAttribution: function (name, text, type) {
        console.log("removeAttribution");
        var filteredAttributions = this.get("attributionList").filter(function (attribution) {
            return attribution.name !== name && attribution.text !== text && attribution.type !== type;
        });
        this.setAttributionList(filteredAttributions);
        this.trigger("renderAttributions");
    },
    /**
     * Es wird geprüft, ob Attributions bei den aktuell in der Karten sichtbaren Layern vorliegen
     * Wenn ja, wird die Funktion generateAttributions aufgerufen
     * @returns {void}
     */
    checkModelsByAttributions: function () {
        var modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true}),
            filteredModelList = modelList.filter(function (model) {
                return model.has("layerAttribution") && model.get("layerAttribution") !== "nicht vorhanden";
            });

        this.removeAllLayerAttributions();
        if (filteredModelList.length > 0) {
            this.generateAttributions(filteredModelList);
        }
    },
    /**
     * Removes all attributions of type "layer" from attributions array.
     * Renders module.
     * @fires  AttributionsModel#event:renderAttributions
     * @returns {void}
     */
    removeAllLayerAttributions: function () {
        var attributions = this.get("attributionList"),
            filteredAttributions = attributions.filter(function (attribution) {
                return attribution.type !== "layer";
            });
        this.setAttributionList(filteredAttributions);
        this.trigger("renderAttributions");
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
        console.log(value);

        this.set("isVisibleInMap", value);
    },

    setAttributionList: function (value) {
        this.set("attributionList", value);
        if (value.length === 0) {
            this.setIsContentVisible(false);
        }
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

export default AttributionsModel;
