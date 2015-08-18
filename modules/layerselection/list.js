define([
    "underscore",
    "backbone",
    "eventbus"
], function (_, Backbone, EventBus) {

    var list = Backbone.Collection.extend({
        initialize: function () {
            // EventBus Listener
            EventBus.on("addModelToSelectionList", this.addModelToList, this);
            EventBus.on("removeModelFromSelectionList", this.removeModelFromList, this);
            EventBus.on("getSelectedVisibleWMSLayer", this.sendVisibleWMSLayer, this);
            // Eigene Listener
            this.listenTo(this, "add", this.addLayerToMap);
            this.listenTo(this, "remove", this.removeLayerFromMap);
        },
        /**
         * Fügt der Collection ein Model hinzu.
         * @param {Backbone.Model} model - Layer-Model
         */
        addModelToList: function (model) {
            if (model.get("isbaselayer") === false) {
                this.add(model);
            }
            else {
                this.add(model, {at: 0});
            }
        },
        /**
         * Löscht ein Model aus der Collection.
         * @param {Backbone.Model} model - Layer-Model
         */
        removeModelFromList: function (model) {
            this.remove(model);
        },
        /**
         * Triggert das Event "addLayerToIndex". Übergibt das "layer"-Attribut und den Index vom Model (ol.layer).
         * @param {Backbone.Model} model - Layer-Model
         */
         addLayerToMap: function (model) {
            EventBus.trigger("addLayerToIndex", [model.get("layer"), this.indexOf(model)]);
        },
        /**
         * Triggert das Event "removeLayer". Übergibt das "layer"-Attribut vom Model (ol.layer).
         * @param {Backbone.Model} model - Layer-Model
         */
        removeLayerFromMap: function (model) {
           EventBus.trigger("removeLayer", model.get("layer"));
       },
        /**
         * Schiebt das Model in der Collection eine Position nach oben.
         * @param {Backbone.Model} model - Layer-Model
         */
         moveModelUp: function (model) {
            var fromIndex = this.indexOf(model),
                toIndex = fromIndex + 1;

            if (fromIndex < this.length - 1) {
                this.remove(model);
                this.add(model, {at: toIndex});
            }
        },
        /**
         * Schiebt das Model in der Collection eine Position nach unten.
         * @param {Backbone.Model} model - Layer-Model
         */
         moveModelDown: function (model) {
            var fromIndex = this.indexOf(model),
                toIndex = fromIndex - 1;

            if (fromIndex > 0) {
                this.remove(model);
                this.add(model, {at: toIndex});
            }
        },
        /**
         * Verschiebt das Model innerhalb der Collection nach oben oder unten.
         * @param {Backbone.Model} model - Layer-Model
         * @param {Number} index - Wert um den das Model verschoben werden soll
         */
        moveModelDelta: function (model, index) {
            var fromIndex = this.indexOf(model),
                toIndex = fromIndex + index;

                this.remove(model);
                this.add(model, {at: toIndex});
        },
        /**
         * Triggert das Event "layerForPrint". Übergibt alle Models die ausgewählt und sichtbar sind.
         */
        sendVisibleWMSLayer: function () {
            EventBus.trigger("layerlist:sendVisibleWMSlayerList", this.where({typ: "WMS", selected: true, visibility: true}));
        }
    });

    return list;
});
