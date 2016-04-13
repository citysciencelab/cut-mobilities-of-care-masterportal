define([
    "modules/treeMobile/nodeModel",
    "backbone.radio"
], function () {

    var Node = require("modules/treeMobile/nodeModel"),
        Radio = require("backbone.radio"),
        LayerModel;

    LayerModel = Node.extend({
        defaults: {
            // true wenn die Node sichtbar ist
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // Id vom Layer Objekt
            layerId: "",
            // true wenn die Node ausgewählt ist
            isChecked: false,
            // Layer Titel
            title: "",
            // true wenn das Model in "Auswahl der Karten" gezeichnet ist
            isInSelection: false,
            // true wenn der Layer sichtbar ist
            isLayerVisible: false,
            // true wenn die Einstellungen (Transparenz etc.) sichtbar sind
            isSettingVisible: false,
            // die Transparenz des Layers
            transparence: ""
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
                    // transparenz holen ???
                    this.setIsVisible(this.getIsInSelection());
                },
                "change:isLayerVisible": function () {
                    Radio.trigger("LayerList", "setAttributionsByID", this.getLayerID(), {"visibility": this.getIsLayerVisible()});
                },
                "change:transparence": function () {
                    Radio.trigger("LayerList", "setAttributionsByID", this.getLayerID(), {"transparence": this.getTransparence()});
                },
                "change:isSettingVisible": function () {
                    var model = Radio.request("LayerList", "getLayerFindWhere", {id: this.getLayerID()});

                    this.setTransparence(model.getTransparence());
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
        showLayerInformation: function () {
            Radio.trigger("LayerList", "showLayerInformationById", this.getLayerID());
        },
        setTransparence: function (value) {
            this.set("transparence", value);
        },
        getTransparence: function () {
            return this.get("transparence");
        }
    });

    return LayerModel;
});
