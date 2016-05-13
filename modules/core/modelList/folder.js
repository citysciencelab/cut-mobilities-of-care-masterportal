define([
    "modules/core/modelList/item"
], function () {

    var Item = require("modules/core/modelList/item"),
        Folder;

    Folder = Item.extend({
        initialize: function () {
            // console.log(this.attributes);
        }
    });

    return Folder;
});
