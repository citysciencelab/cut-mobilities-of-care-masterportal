define(function (require) {

    var Item = require("modules/core/modelList/item"),
        Radio = require("backbone.radio"),
        Viewpoint;

    Viewpoint = Item.extend({
        defaults: {
            // true wenn die Node sichtbar
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // Bootstrap Glyphicon Class
            glyphicon: "",
            // Email Adresse
            email: undefined,
            // Name (Überschrift) der Funktion
            name: "",
            // true wenn das Tool aktiviert ist
            isActive: false
        },

        activateViewpoint: function () {
            if (Radio.request("Map", "isMap3d")) {
                Radio.trigger("MapView", "setCenter", this.get("center"), this.get("zoomLevel"));
                Radio.trigger("Map", "setCameraParameter", {tilt: this.get("tilt"), heading: this.get("heading"), altitude: this.get("altitude")});
            }
            else {
                Radio.trigger("MapView", "setCenter", this.get("center"), this.get("zoomLevel"));
            }

        }
    });

    return Viewpoint;
});
