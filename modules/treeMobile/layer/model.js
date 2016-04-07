define([
    "modules/treeMobile/nodeModel",
    "backbone.radio"
], function () {

    var Node = require("modules/treeMobile/nodeModel"),
        Radio = require("backbone.radio"),
        LayerModel;

    LayerModel = Node.extend({
        defaults: {
            // true wenn die Node sichtbar
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // Id vom Layer Objekt
            layerId: "",
            // true wenn der Layer ausgewählt ist
            isChecked: false,
            // Layer Titel
            title: ""
        },
        initialize: function () {
            var model = Radio.request("LayerList", "getLayerFindWhere", {id: this.getLayerID()});

            // initial sichtbare layer werden "gechecked"
            if (model.getVisibility() === true) {
                this.setIsChecked(true);
            }
            // wenn initial noch kein title vorhanden ist (evt. bei Custom-Tree)
            if (this.getTitle() === "") {
                this.setTitle(model.get("name"));
            }
        },
        setIsChecked: function (value) {
            this.set("isChecked", value);
        },
        getIsChecked: function () {
            return this.get("isChecked");
        },
        getLayerID: function () {
            return this.get("layerId");
        },
        toggleIsChecked: function () {
            if (this.getIsChecked() === true) {
                this.setIsChecked(false);
            }
            else {
                this.setIsChecked(true);
            }
            Radio.trigger("LayerList", "setAttributionsByID", this.getLayerID(), {"selected": this.getIsChecked()});
        },
        showLayerInformation: function () {
            Radio.trigger("LayerList", "showLayerInformationById", this.getLayerID());
        }
    });

    return LayerModel;
});
