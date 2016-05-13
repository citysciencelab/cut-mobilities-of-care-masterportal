define([
    "modules/core/parser/portalConfig"
], function () {

    var Parser = require("modules/core/parser/portalConfig"),
        CustomTreeParser;

    CustomTreeParser = Parser.extend({
        initialize: function () {
            this.parseTree(this.getBaselayer(), "Baselayer", 0);
            this.parseTree(this.getOverlayer(), "Overlayer", 0);
            this.createModelList();
        },

        /**
         * parsed response.Themenconfig
         * @param  {Object} object - Baselayer | Overlayer | Folder
         * @param  {string} parentId
         * @param  {Number} level - Rekursionsebene = Ebene im Themenbaum
         */
        parseTree: function (object, parentId, level) {
            if (_.has(object, "Layer")) {
                _.each(object.Layer, function (layer) {
                    // HVV :(
                    if (_.has(layer, "styles") && layer.styles.length > 1) {
                        _.each(layer.styles, function (style) {
                            this.addItem(_.extend({type: "layer", parentId: parentId, id: layer.id + style.toLowerCase(), level: level}, _.omit(layer, "id")));
                        }, this);
                    }
                    else {
                        this.addItem(_.extend({type: "layer", parentId: parentId, level: level}, layer));
                    }
                }, this);
            }
            if (_.has(object, "Ordner")) {
                _.each(object.Ordner, function (folder) {
                    var isLeafFolder = (!_.has(folder, "Ordner")) ? true : false;

                    folder.id = _.uniqueId(folder.Titel);
                    this.addItem({type: "folder", parentId: parentId, title: folder.Titel, id: folder.id, isLeafFolder: isLeafFolder, level: level});
                    // rekursiver Aufruf
                    this.parseTree(folder, folder.id, level + 1);
                }, this);
            }
        }
    });

    return CustomTreeParser;
});
