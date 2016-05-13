define([
    "modules/core/parser/portalConfig"
], function () {

     var Parser = require("modules/core/parser/portalConfig"),
        CustomTreeParser;

    CustomTreeParser = Parser.extend({
        initialize: function () {
            this.parseTree(this.getBaselayer(), "Baselayer");
            this.parseTree(this.getOverlayer(), "Overlayer");
        },

        /**
         * parsed response.Themenconfig
         * @param  {Object} object - Baselayer | Overlayer | Folder
         * @param  {string} parentId
         */
        parseTree: function (object, parentId) {
            if (_.has(object, "Layer")) {
                _.each(object.Layer, function (layer, index) {
                    // HVV :(
                    if (_.has(layer, "styles") && layer.styles.length > 1) {
                        _.each(layer.styles, function (style) {
                            this.addItem(_.extend({type: "layer", parentId: parentId, layerId: layer.id + style.toLowerCase(), level: index}, layer));
                        }, this);
                    }
                    else {
                        this.addItem(_.extend({type: "layer", parentId: parentId, layerId: layer.id, level: index}, layer));
                    }
                }, this);
            }
            if (_.has(object, "Ordner")) {
                _.each(object.Ordner, function (folder, index) {
                    var isLeafFolder = (!_.has(folder, "Ordner")) ? true : false;

                    folder.id = _.uniqueId(folder.Titel);
                    this.addItem({type: "folder", parentId: parentId, title: folder.Titel, id: folder.id, isLeafFolder: isLeafFolder, level: index});
                    // rekursiver Aufruf
                    this.parseTree(folder, folder.id);
                }, this);
            }
        }
    });

    return CustomTreeParser;
});
