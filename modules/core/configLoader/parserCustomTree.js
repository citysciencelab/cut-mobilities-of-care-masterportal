define(function (require) {

    var Radio = require("backbone.radio"),
        Parser = require("modules/core/configLoader/parser"),
        CustomTreeParser;

    CustomTreeParser = Parser.extend({

        /**
         * Parsed response.Themenconfig
         * Die Objekte aus der config.json und services.json werden über die Id zusammengeführt
         * @param  {Object} object - Baselayer | Overlayer | Folder
         * @param  {string} parentId
         * @param  {Number} level - Rekursionsebene = Ebene im Themenbaum
         */
        parseTree: function (object, parentId, level) {
            if (_.has(object, "Layer")) {
                _.each(object.Layer, function (layer) {
                    // Für Singel-Layer (ol.layer.Layer)
                    // z.B.: {id: "5181", visible: false}
                    if (_.isString(layer.id)) {
                        var objFromRawList = Radio.request("RawLayerList", "getLayerAttributesWhere", {id: layer.id});

                        if (_.isNull(objFromRawList)) { // Wenn LayerID nicht definiert, dann Abbruch
                            return;
                        }
                        layer = _.extend(objFromRawList, layer);
                    }
                    // Für Single-Layer (ol.layer.Layer) mit mehreren Layern(FNP, LAPRO, Geobasisdaten (farbig), etc.)
                    // z.B.: {id: ["550,551,552,...,559"], visible: false}
                    else if (_.isArray(layer.id) && _.isString(layer.id[0])) {
                        var objsFromRawList = Radio.request("RawLayerList", "getLayerAttributesList"),
                            mergedObjsFromRawList = this.mergeObjectsByIds(layer.id, objsFromRawList);

                        if (layer.id.length !== mergedObjsFromRawList.layers.split(",").length) { // Wenn nicht alle LayerIDs des Arrays definiert, dann Abbruch
                            return;
                        }
                        layer = _.extend(mergedObjsFromRawList, _.omit(layer, "id"));
                    }
                    // Für Gruppen-Layer (ol.layer.Group)
                    // z.B.: {id: [{ id: "1364" }, { id: "1365" }], visible: false }
                    else if (_.isArray(layer.id) && _.isObject(layer.id[0])) {
                        var layerdefinitions = [];

                        _.each(layer.id, function (childLayer) {
                            var objFromRawList = Radio.request("RawLayerList", "getLayerAttributesWhere", {id: childLayer.id});

                            if (!_.isNull(objFromRawList)) {
                                objFromRawList = _.extend(objFromRawList, childLayer);
                                layerdefinitions.push(objFromRawList);
                            }
                        });
                        if (layer.id.length !== layerdefinitions.length) { // Wenn nicht alle LayerIDs des Arrays definiert, dann Abbruch
                            return;
                        }
                        layer = _.extend(layer, {typ: "GROUP", id: layerdefinitions[0].id + "_groupLayer", layerdefinitions: layerdefinitions});
                        Radio.trigger("RawLayerList", "addGroupLayer", layer);
                    }

                    // HVV :(
                    if (_.has(layer, "styles") && layer.styles.length >= 1) {
                        _.each(layer.styles, function (style, index) {
                            this.addItem(_.extend({
                                type: "layer",
                                parentId: parentId,
                                name: layer.name[index],
                                id: layer.id + style,
                                styles: layer.styles[index],
                                legendURL: layer.legendURL[index],
                                level: level,
                                isVisibleInTree: this.getIsVisibleInTree(level, "folder", true)
                            }, _.omit(layer, "id", "name", "styles", "legendURL")));
                        }, this);
                    }
                    else {
                        this.addItem(_.extend({
                            type: "layer",
                            parentId: parentId,
                            level: level,
                            format: "image/png",
                            isVisibleInTree: this.getIsVisibleInTree(level, "folder", true)
                        }, layer));
                    }
                }, this);
            }
            if (_.has(object, "Ordner")) {
                _.each(object.Ordner, function (folder) {
                    var isLeafFolder = !_.has(folder, "Ordner"),
                        isFolderSelectable;

                    // Visiblity of SelectAll-Box. Use item property first, if not defined use global setting.
                    if (folder.isFolderSelectable === true) {
                        isFolderSelectable = true;
                    }
                    else if (folder.isFolderSelectable === false) {
                        isFolderSelectable = false;
                    }
                    else {
                        isFolderSelectable = this.getIsFolderSelectable();
                    }

                    folder.id = this.createUniqId(folder.Titel);
                    this.addItem({
                        type: "folder",
                        parentId: parentId,
                        name: folder.Titel,
                        id: folder.id,
                        isLeafFolder: isLeafFolder,
                        isFolderSelectable: isFolderSelectable,
                        level: level,
                        glyphicon: "glyphicon-plus-sign",
                        isVisibleInTree: this.getIsVisibleInTree(level, "folder", true),
                        isInThemen: true
                    });
                    // rekursiver Aufruf
                    this.parseTree(folder, folder.id, level + 1);
                }, this);
            }
        },

        getIsVisibleInTree: function (level, type, isInThemen) {
            isInThemen = _.isUndefined(isInThemen) ? false : isInThemen;
            return level === 0 && ((type === "layer") || (type === "folder" && isInThemen));
        }
    });

    return CustomTreeParser;
});
