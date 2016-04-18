define([
    "modules/treeMobile/nodeModel",
    "backbone.radio"
], function () {

    var Node = require("modules/treeMobile/nodeModel"),
        Radio = require("backbone.radio"),
        LayerModel;

    LayerModel = Node.extend({
        defaults: {
            // welcher Node-Type - folder/layer/item
            type: "",
            // true wenn die Node sichtbar ist
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // true wenn die Node "gechecked" ist
            isChecked: false,
            // true wenn die Node in "Auswahl der Karten" gezeichnet ist
            isInSelection: false,
            // die ID der Parent-Node
            parentId: "",
            // Id vom Layer Objekt
            layerId: "",
            // Layer Titel
            title: "",
            // true wenn der Layer sichtbar ist
            isLayerVisible: false,
            // true wenn die Einstellungen (Transparenz etc.) sichtbar sind
            isSettingVisible: false,
            // die Transparenz des Layers
            transparence: "",
            // der Index der die Reihenfolge beim Zeichnen der ausgewählten Layer bestimmt
            selectionIDX: 0
        },
        initialize: function () {
            var model = Radio.request("LayerList", "getLayerFindWhere", {id: this.getLayerID()});

            // initial sichtbare layer werden "gechecked"
            if (model.getVisibility() === true) {
                this.setIsChecked(true);
                this.setIsLayerVisible(true);
            }
            // wenn initial noch kein title vorhanden ist (evt. bei Custom-Tree)
            if (this.getTitle() === "") {
                this.setTitle(model.get("name"));
            }

            this.listenTo(this, {
                "change:isChecked": function () {
                    Radio.trigger("LayerList", "setAttributionsByID", this.getLayerID(), {"selected": this.getIsChecked()});
                    this.setIsLayerVisible(this.getIsChecked());
                },
                "change:isInSelection": function () {
                    // für die aktuelle Layer den Index in der Selektion abfragen
                    var idx = Radio.request("SelectedList", "getSelectionIDXByID", this.getLayerID());

                    this.setSelectionIDX(idx);
                    this.setIsVisible(this.getIsInSelection());
                },
                "change:isLayerVisible": function () {
                    Radio.trigger("LayerList", "setAttributionsByID", this.getLayerID(), {"visibility": this.getIsLayerVisible()});
                },
                "change:transparence": function () {
                    Radio.trigger("LayerList", "setAttributionsByID", this.getLayerID(), {"transparence": this.getTransparence()});
                },
                "change:selectionIDX": function () {
                    console.log("change");
                }
            });
        },
        setIsChecked: function (value) {
            this.set("isChecked", value);
        },
        getIsChecked: function () {
            return this.get("isChecked");
        },
        toggleIsChecked: function () {
            if (this.getIsChecked() === true) {
                this.setIsChecked(false);
            }
            else {
                this.setIsChecked(true);
            }
            this.collection.everyLayerIsChecked(this);
        },
        setIsLayerVisible: function (value) {
            this.set("isLayerVisible", value);
        },
        getIsLayerVisible: function () {
            return this.get("isLayerVisible");
        },
        toggleLayerVisibility: function () {
            if (this.getIsLayerVisible() === true) {
                this.setIsLayerVisible(false);
            }
            else {
                this.setIsLayerVisible(true);
            }
        },
        setIsSettingVisible: function (value) {
            this.set("isSettingVisible", value);
        },
        getIsSettingVisible: function () {
            return this.get("isSettingVisible");
        },
        toggleIsSettingVisible: function () {
            if (this.getIsSettingVisible() === true) {
                this.setIsSettingVisible(false);
            }
            else {
                this.collection.setIsSettingVisible(false);
                this.setIsSettingVisible(true);
            }
        },
        setIsInSelection: function (value) {
            this.set("isInSelection", value);
        },
        getIsInSelection: function () {
            return this.get("isInSelection");
        },
        getLayerID: function () {
            return this.get("layerId");
        },
        setTransparence: function (value) {
            this.set("transparence", value);
        },
        getTransparence: function () {
            return this.get("transparence");
        },
        showLayerInformation: function () {
            Radio.trigger("LayerList", "showLayerInformationById", this.getLayerID());
        },
        setSelectionIDX: function (idx) {
            this.set("selectionIDX", idx);
        },
        getSelectionIDX: function () {
           return this.get("selectionIDX");
        }
    });

    return LayerModel;
});
