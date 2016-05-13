define([
    "modules/core/parser/portalConfig"
], function () {

     var Parser = require("modules/core/parser/portalConfig"),
        CustomTreeParser;

    CustomTreeParser = Parser.extend({
        initialize: function () {
            console.log(this);
            console.log("custom");
            this.parseTree(this.get("Hintergrundkarten"), "BaseLayer");
            this.parseTree(this.get("Fachdaten"), "OverLayer");
        },

        /**
         *
         */
        parseTree: function (value, parentId) {
            _.each(value, function (element) {
                if (_.has(element, "Layer")) {
                    _.each(element.Layer, function (layer) {
                        // HVV :(
                        if (_.has(layer, "styles") && layer.styles.length > 1) {
                            _.each(layer.styles, function (style) {console.log(this);
                                this.getItemList().push(_.extend({type: "layer", parentId: parentId, id: layer.id, layerId: layer.id + style.toLowerCase()}, _.omit(layer, "id")));
                            }, this);
                        }
                        else {
                            this.getItemList().push(_.extend({type: "layer", parentId: parentId, id: layer.id, layerId: layer.id}, _.omit(layer, "id")));
                        }
                    }, this);
                }
                if (_.has(element, "Ordner")) {
                    _.each(element.Ordner, function (folder) {
                        folder.id = _.uniqueId(folder.Titel);
                        this.getItemList().push({
                            type: "folder",
                            parentId: parentId,
                            title: folder.Titel,
                            id: folder.id,
                            isLeafFolder: (!_.has(folder, "Ordner")) ? true : false
                        });
                        // rekursiver Aufruf
                        this.parseTree([folder], folder.id);
                    }, this);
                }
            }, this);
        }
    });

    return CustomTreeParser;
});
