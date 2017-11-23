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
            isInitOpenDesktop: true,
            isInitOpenMobile: false,
            // Modellist mit Attributions
            modelList: [],
            isOverviewmap: Radio.request("Parser", "getItemByAttributes", {id: "overviewmap"}) ? true : false
        },

        initialize: function () {
            var config = Radio.request("Parser", "getPortalConfig").controls.attributions;

            if (typeof (config) === "object") {
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

        // getter for isInitOpenDesktop
        getIsInitOpenDesktop: function () {
            return this.get("isInitOpenDesktop");
        },
        // setter for isInitOpenDesktop
        setIsInitOpenDesktop: function (value) {
            this.set("isInitOpenDesktop", value);
        },

        // getter for isInitOpenMobile
        getIsInitOpenMobile: function () {
            return this.get("isInitOpenMobile");
        },
        // setter for isInitOpenMobile
        setIsInitOpenMobile: function (value) {
            this.set("isInitOpenMobile", value);
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
