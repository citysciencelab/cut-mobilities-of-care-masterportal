import Parser from "./parser";

const CustomTreeParser = Parser.extend(/**@lends CustomTreeParser.prototype */{
    /**
     * @class CustomTreeParser
     * @extends Parser
     * @memberof Core.ConfigLoader
     * @constructs
     * @fires RawLayerList#RadioRequestRawLayerListGetLayerAttributesWhere
     * @fires RawLayerList#RadioRequestRawLayerListGetLayerAttributesList
     */
    defaults: _.extend({}, Layer.prototype.defaults, {}),
    /**
     * Recursive function.
     * Parses the config.json. response.Themenconfig.
     * The object from config.json and services.json are merged by id.
     *
     * @param  {Object} object - Baselayer | Overlayer | Folder
     * @param  {string} parentId Id of parent item.
     * @param  {Number} level Level of recursion. Equals to level in layertree.
     * @fires RawLayerList#RadioRequestRawLayerListGetLayerAttributesWhere
     * @fires RawLayerList#RadioRequestRawLayerListGetLayerAttributesList
     * @returns {void}
     */
    parseTree: function (object, parentId, level) {
        if (_.has(object, "Layer")) {
            _.each(object.Layer, function (layer) {
                var objFromRawList,
                    objsFromRawList,
                    layerExtended = layer,
                    mergedObjsFromRawList;

                // Für Singel-Layer (ol.layer.Layer)
                // z.B.: {id: "5181", visible: false}

                if (!_.has(layerExtended, "children") && _.isString(layerExtended.id)) {
                    objFromRawList = Radio.request("RawLayerList", "getLayerAttributesWhere", {id: layerExtended.id});
                    // DIPAS -> Steht ein Objekt nicht in der ServicesJSON, hat aber eine url dann wird der Layer ohne Services Eintrag trotzdemübergeben

                    // DIPAS -> wenn der Layertyp "StaticImage" übergeben wird brechen wur nicht ab sondern arbeiten mit der neuen ImageURL weiter.
                    // Wird für den Einsatz eines individuell eingestelölten Bildes benötigt.
                    if (_.isNull(objFromRawList)) {
                        if (_.has(layerExtended, "url")) { // Wenn LayerID nicht definiert, dann Abbruch
                            objFromRawList = layerExtended;
                        }
                        else {
                            return;
                        }
                    }
                    layerExtended = _.extend(objFromRawList, layerExtended, {"isChildLayer": false});
                }
                // Für Single-Layer (ol.layer.Layer) mit mehreren Layern(FNP, LAPRO, Geobasisdaten (farbig), etc.)
                // z.B.: {id: ["550,551,552,...,559"], visible: false}
                else if (_.isArray(layerExtended.id) && _.isString(layerExtended.id[0])) {
                    objsFromRawList = Radio.request("RawLayerList", "getLayerAttributesList");
                    mergedObjsFromRawList = this.mergeObjectsByIds(layerExtended.id, objsFromRawList);

                    if (_.isNull(mergedObjsFromRawList)) { // Wenn Layer nicht definiert, dann Abbruch
                        return;
                    }
                    layerExtended = _.extend(mergedObjsFromRawList, _.omit(layerExtended, "id"), {"isChildLayer": false});
                }
                // Für Gruppen-Layer (ol.layer.Group)
                // z.B.: {id: "xxx", children: [{ id: "1364" }, { id: "1365" }], visible: false}
                else if (_.has(layerExtended, "children") && _.isString(layerExtended.id)) {
                    layerExtended.children = _.map(layerExtended.children, function (childLayer) {
                        objFromRawList = Radio.request("RawLayerList", "getLayerAttributesWhere", {id: childLayer.id});

                        if (!_.isNull(objFromRawList)) {
                            return _.extend(objFromRawList, childLayer, {"isChildLayer": true});
                        }

                        return undefined;
                    }, this);

                    layerExtended.children = layerExtended.children.filter(function (childLayer) {
                        return !_.isUndefined(childLayer);
                    });

                    if (layerExtended.children.length > 0) {
                        layerExtended = _.extend(layerExtended, {typ: "GROUP", isChildLayer: false});
                    }
                }

                // HVV :(
                if (_.has(layerExtended, "styles") && layerExtended.styles.length >= 1) {
                    _.each(layerExtended.styles, function (style, index) {
                        this.addItem(_.extend({
                            type: "layer",
                            parentId: parentId,
                            name: layerExtended.name[index],
                            id: layerExtended.id + style,
                            styles: layerExtended.styles[index],
                            legendURL: layerExtended.legendURL[index],
                            level: level,
                            isVisibleInTree: this.getIsVisibleInTree(level, "folder", true)
                        }, _.omit(layerExtended, "id", "name", "styles", "legendURL")));
                    }, this);
                }
                else {
                    this.addItem(_.extend({
                        type: "layer",
                        parentId: parentId,
                        level: level,
                        format: "image/png",
                        isVisibleInTree: this.getIsVisibleInTree(level, "folder", true)
                    }, layerExtended));
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
                    isFolderSelectable = this.get("isFolderSelectable");
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

    /**
     * Returns a flag if layer has to be displayed.
     * @param {Number} level The layers level in the layertree.
     * @param {String} type Type of Item.
     * @param {Boolean} isInThemen  Flag if layer or folder is in layertree
     * @returns {Boolean} - Flag if layer is visible in layertree
     */
    getIsVisibleInTree: function (level, type, isInThemen) {
        var isInThemenBool = _.isUndefined(isInThemen) ? false : isInThemen;

        return level === 0 && ((type === "layer") || (type === "folder" && isInThemenBool));
    }
});

export default CustomTreeParser;
