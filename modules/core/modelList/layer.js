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
            isChecked: false
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
        }
    });

    return Layer;
});
