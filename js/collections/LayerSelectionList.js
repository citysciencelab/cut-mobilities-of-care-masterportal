define([
    "underscore",
    "backbone",
    "eventbus"
], function (_, Backbone, EventBus) {

    var LayerSelectionList = Backbone.Collection.extend({
        initialize: function () {
            EventBus.on("addModelToSelectionList", this.addModel, this);
            EventBus.on("removeModelFromSelectionList", this.removeModel, this);
            EventBus.on("sendAllSelectedLayer", this.addModels, this);
            EventBus.trigger("getAllSelectedLayer");
            EventBus.on("moveLayerUpInList", this.moveNodeUp, this);
            EventBus.on("moveLayerDownInList", this.moveNodeDown, this);
        },
        addModel: function (model) {
            this.add(model);
            EventBus.trigger("addLayer", model.get("layer"));
        },
        removeModel: function (model) {
            EventBus.trigger("removeLayer", model.get("layer"));
            model.set("visibility", false);
            this.remove(model);
        },
        addModels: function (models) {
            _.each(models, function (model) {
                this.addModel(model);
            }, this);
        },




        /**
         * Die Node(Model) wird im Layerbaum eine Ebene nach oben verschoben.
         */
        "moveNodeUp": function (model) {
            // Der aktuelle Index des Models innerhalb der Collection
            var fromIndex = this.indexOf(model);
            // Der neue Index für dieses Model
            var toIndex = fromIndex + 1;
            // Wenn die Node noch nicht ganz oben ist = An Position 0 in der Collection
            if (fromIndex < this.length - 1) {
            //     // Die Anzahl der Layer dieser Node und der oberhalb liegenden Node in sortierter Reihenfolge
            //     // var countLayer = this.at(fromIndex).get("sortedLayerList").length + this.at(toIndex).get("sortedLayerList").length - 1;
            //     // bewegt die Layer auf der Karte nach oben --> Map.js
            //     // _.each(this.at(fromIndex).get("sortedLayerList"), function (element) {
                    EventBus.trigger("moveLayer", [1, model.get("layer")]);
            //     // });
            //     // Entfernt das Model aus der Collection
                this.remove(model);
            //     // Fügt das Model an neuer Position der Collection wieder hinzu
                this.add(model, {at: toIndex});
            }
        },

        /**
         * Die Node(Model) wird im Layerbaum eine Ebene nach unten verschoben.
         */
        "moveNodeDown": function (model) {
            // Der aktuelle Index des Models innerhalb der Collection
            var fromIndex = this.indexOf(model);
            // Der neue Index für dieses Model
            var toIndex = fromIndex - 1;
            // Wenn die Node noch nicht ganz unten ist = An letzter Position in der Collection
            if (fromIndex > 0) {
            //     // Die Anzahl der layer der unterhalb liegenden Node in sortierter Reihenfolge
            //     // var countLayer = this.at(toIndex).get("sortedLayerList").length;
            //     // bewegt die Layer auf der Karte nach unten --> Map.js
            //     // _.each(this.at(fromIndex).get("sortedLayerList"), function (element) {
                    EventBus.trigger("moveLayer", [-1, model.get("layer")]);
            //     // });
            //     // Entfernt das Model aus der Collection
                this.remove(model);


            //     // Fügt das Model an neuer Position der Collection wieder hinzu
                this.add(model, {at: toIndex});
            }
        }
    });

    return LayerSelectionList;
});
