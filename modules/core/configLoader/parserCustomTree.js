import Parser from "./parser";
import {getLayerWhere, getLayerList} from "masterportalAPI/src/rawLayerList";

const CustomTreeParser = Parser.extend(/** @lends CustomTreeParser.prototype */{
    /**
     * @class CustomTreeParser
     * @extends Parser
     * @memberof Core.ConfigLoader
     * @constructs
     * @fires Core#RadioRequestRawLayerListGetLayerAttributesWhere
     * @fires Core#RadioRequestRawLayerListGetLayerAttributesList
     * @fires Core.ConfigLoader#RadioRequestParserGetTreeType
     * @fires QuickHelp#RadioRequestQuickHelpIsSet
     */
    defaults: Object.assign({}, Parser.prototype.defaults, {}),

    /**
     * Recursive function.
     * Parses the config.json. response.Themenconfig.
     * The object from config.json and services.json are merged by id.
     *
     * @param  {Object} [object={}] - Baselayer | Overlayer | Folder
     * @param  {string} parentId Id of parent item.
     * @param  {Number} level Level of recursion. Equals to level in layertree.
     * @fires Core#RadioRequestRawLayerListGetLayerAttributesWhere
     * @fires Core#RadioRequestRawLayerListGetLayerAttributesList
     * @fires Core.ConfigLoader#RadioRequestParserGetTreeType
     * @fires QuickHelp#RadioRequestQuickHelpIsSet
     * @returns {void}
     */
    parseTree: function (object = {}, parentId, level) {
        const isBaseLayer = Boolean(parentId === "Baselayer" || parentId === "tree"),
            treeType = Radio.request("Parser", "getTreeType");

        if (object.hasOwnProperty("Layer")) {
            object.Layer.forEach(layer => {
                let objFromRawList,
                    objsFromRawList,
                    layerExtended = layer,
                    mergedObjsFromRawList,
                    item;

                // Für Single-Layer (ol.layer.Layer)
                // z.B.: {id: "5181", visible: false}

                if (!layerExtended.hasOwnProperty("children") && typeof layerExtended.id === "string") {
                    objFromRawList = getLayerWhere({id: layerExtended.id});
                    // DIPAS -> Steht ein Objekt nicht in der ServicesJSON, hat aber eine url dann wird der Layer ohne Services Eintrag trotzdemübergeben

                    // DIPAS -> wenn der Layertyp "StaticImage" übergeben wird brechen wur nicht ab sondern arbeiten mit der neuen ImageURL weiter.
                    // Wird für den Einsatz eines individuell eingestelölten Bildes benötigt.
                    if (objFromRawList === null) {
                        if (layerExtended.hasOwnProperty("url")) { // Wenn LayerID nicht definiert, dann Abbruch
                            objFromRawList = layerExtended;
                        }
                        else {
                            return;
                        }
                    }
                    layerExtended = Object.assign(objFromRawList, layerExtended, {"isChildLayer": false});
                }
                // Für Single-Layer (ol.layer.Layer) mit mehreren Layern(FNP, LAPRO, Geobasisdaten (farbig), etc.)
                // z.B.: {id: ["550,551,552,...,559"], visible: false}
                else if (Array.isArray(layerExtended.id) && typeof layerExtended.id[0] === "string") {
                    objsFromRawList = getLayerList();
                    mergedObjsFromRawList = this.mergeObjectsByIds(layerExtended.id, objsFromRawList);

                    if (mergedObjsFromRawList === null) { // Wenn Layer nicht definiert, dann Abbruch
                        return;
                    }
                    layerExtended = Object.assign(mergedObjsFromRawList, Radio.request("Util", "omit", layerExtended, ["id"]), {"isChildLayer": false});
                }
                // Für Gruppen-Layer (ol.layer.Group)
                // z.B.: {id: "xxx", children: [{ id: "1364" }, { id: "1365" }], visible: false}
                else if (layerExtended.hasOwnProperty("children") && typeof layerExtended.id === "string") {
                    layerExtended.children = layerExtended.children.map(childLayer => {
                        objFromRawList = null;
                        if (childLayer.styles && childLayer.styles[0]) {
                            objFromRawList = getLayerWhere({id: childLayer.id + childLayer.styles[0]});
                        }
                        if (objFromRawList === null || objFromRawList === undefined) {
                            objFromRawList = getLayerWhere({id: childLayer.id});
                        }
                        if (objFromRawList !== null && objFromRawList !== undefined) {
                            return Object.assign(objFromRawList, childLayer, {"isChildLayer": true});
                        }

                        return undefined;
                    });

                    layerExtended.children = layerExtended.children.filter(function (childLayer) {
                        return childLayer !== undefined;
                    });

                    if (layerExtended.children.length > 0) {
                        layerExtended = Object.assign(layerExtended, {typ: "GROUP", isChildLayer: false});
                    }
                }

                // HVV :(

                if (layerExtended.hasOwnProperty("styles") && layerExtended.styles.length >= 1) {
                    layerExtended.styles.forEach((style, index) => {
                        let subItem = Object.assign({
                            id: layerExtended.id + style,
                            isBaseLayer: isBaseLayer,
                            legendURL: layerExtended.legendURL[index],
                            level: level,
                            name: layerExtended.name[index],
                            parentId: parentId,
                            styles: layerExtended.styles[index],
                            type: "layer"
                        }, Radio.request("Util", "omit", layerExtended, ["id", "name", "styles", "legendURL"]));

                        subItem = this.controlsVisibilityInTree(subItem, treeType, level, layerExtended);

                        this.addItem(subItem);
                    });
                }
                else {
                    item = Object.assign({
                        format: "image/png",
                        isBaseLayer: isBaseLayer,
                        level: level,
                        parentId: parentId,
                        type: "layer",
                        styleId: "default"
                    }, layerExtended);

                    item = this.controlsVisibilityInTree(item, treeType, level, layerExtended);

                    this.addItem(item);
                }
            });
        }
        if (object.hasOwnProperty("Ordner")) {
            object.Ordner.forEach(folder => {
                const isLeafFolder = !folder.hasOwnProperty("Ordner");
                let isFolderSelectable;

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
                    isVisibleInTree: this.getIsVisibleInTree(level, "folder", true, treeType),
                    isInThemen: true,
                    quickHelp: Radio.request("QuickHelp", "isSet"),
                    invertLayerOrder: folder.invertLayerOrder
                });
                // rekursiver Aufruf
                this.parseTree(folder, folder.id, level + 1);
            });
        }
    },

    /**
     * checks which treeType is used and sets the correct attribute to control the visibility in the layerTree
     * @param {Object} item item for layer
     * @param {Object} treeType type of layerTree
     * @param {Number} level Level of recursion. Equals to level in layertree
     * @param {Object} layerExtended extended layer
     * @returns {Object} extended item
     */
    controlsVisibilityInTree: function (item, treeType, level, layerExtended) {
        let extendedItem = item;

        if (treeType === "light") {
            extendedItem = Object.assign({
                isVisibleInTree: this.getIsVisibleInTree(level, "layer", layerExtended.visibility, treeType)
            }, extendedItem);
        }
        else {
            extendedItem = Object.assign({
                isSelected: this.getIsVisibleInTree(level, "layer", layerExtended.visibility, treeType)
            }, extendedItem);
        }

        return extendedItem;
    },

    /**
     * Returns a flag if layer has to be displayed.
     * @param {Number} level The layers level in the layertree.
     * @param {String} type Type of Item.
     * @param {Boolean} isInThemen  Flag if layer or folder is in layertree
     * @param {Object} treeType type of layerTree
     * @returns {Boolean} - Flag if layer is visible in layertree
     */
    getIsVisibleInTree: function (level, type, isInThemen, treeType) {
        const isInThemenBool = isInThemen === undefined ? false : isInThemen;

        return (type === "layer" && (isInThemenBool || treeType === "light"))
            ||
            (level === 0 && type === "folder" && isInThemenBool);
    }
});

export default CustomTreeParser;
