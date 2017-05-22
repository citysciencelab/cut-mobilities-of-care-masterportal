define([
    "backbone",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Attributions;

    Attributions = Backbone.Model.extend({
        defaults: {
            // true wenn der Inhalt (Attributions) angezeigt wird
            isContentVisible: true,
            // true wenn das Control auf der Karte angezeigt wird
            isVisibleInMap: false,
            // Modellist mit Attributions
            modelList: []
        },

        initialize: function () {
            this.listenTo(Radio.channel("ModelList"), {
                "updateVisibleInMapList": this.checkModelsByAttributions
            });

            this.checkModelsByAttributions();
        },

        /**
         * Es wird geprüft, ob Attributions bei den aktuell in der Karten sichtbaren Layern vorliegen
         * Wenn ja, wird die Funktion addAttributions aufgerufen
         * @param  {Backbone.Model[]} modelList
         */
        checkModelsByAttributions: function () {
            var modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true}),
                haveModelsAttributions = _.some(modelList, function (model) {
                    return model.getAttributions();
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
         */
        addAttributions: function () {
            var modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true});

            modelList = _.filter(modelList, function (model) {
                return model.has("layerAttribution") && model.get("layerAttribution") !== "nicht vorhanden";
            });

            this.setModelList(modelList);
        },

        /**
         * Setter für Attribut "isContentVisible"
         * @param {boolean} value
         */
        setIsContentVisible: function (value) {
            this.set("isContentVisible", value);
        },

        /**
         * Setter für Attribut "isVisibleInMap"
         * @param {boolean} value
         */
        setIsVisibleInMap: function (value) {
            this.set("isVisibleInMap", value);
        },

        /**
         * Setter für Attribut "modelList"
         * @param {Array} value
         */
        setModelList: function (value) {
            this.set("modelList", value);
        },

        /**
         * Getter für Attribut "isContentVisible"
         * @return {boolean}
         */
        getIsContentVisible: function () {
            return this.get("isContentVisible");
        },

        /**
         * Getter für Attribut "isVisibleInMap"
         * @return {boolean}
         */
        getIsVisibleInMap: function () {
            return this.get("isVisibleInMap");
        },

        /**
         * Toggle für Attribut "isContentVisible"
         */
        toggleIsContentVisible: function () {
            if (this.getIsContentVisible() === true) {
                this.setIsContentVisible(false);
            }
            else {
                this.setIsContentVisible(true);
            }
        }

    });

    return Attributions;
});
