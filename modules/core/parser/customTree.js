define([
    "modules/core/parser/portalConfig",
    "backbone.radio"
], function () {

    var Parser = require("modules/core/parser/portalConfig"),
        Radio = require("backbone.radio"),
        CustomTreeParser;

    CustomTreeParser = Parser.extend({
        initialize: function () {
            var treeType = Radio.request("Parser", "getPortalConfig").Baumtyp;

            if (treeType === "light") {
                this.parseTree(this.getOverlayer(), "tree", 0);
                this.parseTree(this.getBaselayer(), "tree", 0);
            }
            else {
                this.parseTree(this.getBaselayer(), "Baselayer", 0);
                this.parseTree(this.getOverlayer(), "Overlayer", 0);
            }
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
                    // Layer eines Metadatensatzes (nicht alle) die gruppiert werden sollen --> z.B. Geobasisdaten (farbig)
                    // Da alle Layer demselben Metadtaensatz zugordnet sind, werden sie über die Id gruppiert
                    // merge services.json und config.json
                    if (_.isArray(layer.id)) {
                        layer = _.extend(this.mergeLayersByIds(layer.id, Radio.request("RawLayerList", "getLayerAttributesList")), _.omit(layer, "id"));
                    }
                    else {
                        layer = _.extend(layer, Radio.request("RawLayerList", "getLayerAttributesWhere", {id: layer.id}), layer);
                    }
                    // hier layer mergen wenn mehere layers z.b. Hintergrundkarten
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
                    this.addItem({type: "folder", parentId: parentId, name: folder.Titel, id: folder.id, isLeafFolder: isLeafFolder, level: level, isInThemen: true});
                    // rekursiver Aufruf
                    this.parseTree(folder, folder.id, level + 1);
                }, this);
            }
        }
    });

    return CustomTreeParser;
});
