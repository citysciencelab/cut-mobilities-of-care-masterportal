define([
    "modules/core/modelList/item"
], function () {

    var Item = require("modules/core/modelList/item"),
        Layer;

    Layer = Item.extend({
        defaults: {
            // true wenn der Layer sichtbar ist
            isVisibleInMap: false,
            // true wenn das Item in den Fachdaten "gechecked" ist
            isChecked: false,
            isVisibleInTree: false
        },
        initialize: function () {
            this.listenToOnce(this, {
                "change:isVisibleInMap": this.createLayerAttr
            });
            console.log(this.id);
            // console.log(this.get("isVisibleInMap"));
            // console.log(this.attributes);
        },
        createLayerAttr: function (model) {
            // console.log(this);
            // console.log(1224);
        },
        setIsVisibleInMap: function (isVisibleInMap) {
            this.set("isVisibleInMap", isVisibleInMap);
        },
        getIsVisibleInMap: function () {
            this.get("isVisibleInMap");
        },
        setIsChecked: function (isChecked) {
            this.set("isChecked", isChecked);
        },
        getIsChecked: function () {
            this.get("isChecked");
        },
        setIsVisibleInTree: function (isVisibleInTree) {
            this.set("isVisibleInTree", isVisibleInTree);
        },
        getIsVisibleInTree: function () {
            this.get("isVisibleInTree");
        }
    });

    return Layer;
});
