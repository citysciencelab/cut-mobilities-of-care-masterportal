define([
    "backbone.radio",
    "modules/core/modelList/item"
], function () {

    var Item = require("modules/core/modelList/item"),
        StaticLink;

    StaticLink = Item.extend({
        defaults: {
            // welcher Node-Type - folder/layer/item/staticLink
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // Bootstrap Glyphicon Class
            glyphicon: "",
            // Name (Überschrift) der Funktion
            name: "",
            // URL des Links
            url: ""
        },

        initialize: function () {
        }
    });

    return StaticLink;
});
