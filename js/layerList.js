import {initializeLayerList} from "masterportalAPI/src/rawLayerList";
import {loadApp} from "./app";

/**
 * Holt sich die Layer Konfigurationen (layer list)
 * @param {string} layerConfUrl - services.json url
 * @returns {void}
 */
export function fetch (layerConfUrl) {
    initializeLayerList(layerConfUrl,
        (layerList, error) => {
            if (error) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Die Datei '" + layerConfUrl + "' konnte nicht geladen werden!</strong>",
                    kategorie: "alert-warning"
                });
            }
            else {
                modifyLayerList(layerList);
            }
        });
}

/**
 * Bearbeitet die Objekte aus der services.json entsprechend der config.js
 * @param  {Object[]} layerList - Objekte aus der services.json
 * @return {void}
 */
function modifyLayerList (layerList) {
    var rawLayerArray = layerList;

    // Es gibt Layer in einem Dienst, die für unterschiedliche Portale unterschiedliche Daten/GFIs liefern --> z.B. Hochwasserrisikomanagement
    // Da alle Layer demselben Metadatensatz zugordnet sind, werden sie über die Id gelöscht
    if (_.has(Config.tree, "layerIDsToIgnore")) {
        rawLayerArray = deleteLayersByIds(rawLayerArray, Config.tree.layerIDsToIgnore);
    }
    // Alle Layer eines Metadatensatzes die nicht dargestellt werden sollen --> z.B. MRH Fachdaten im FHH-Atlas
    if (_.has(Config.tree, "metaIDsToIgnore")) {
        rawLayerArray = deleteLayersByMetaIds(rawLayerArray, Config.tree.metaIDsToIgnore);
    }
    // Alle Layer eines Metadatensatzes die gruppiert dargestellt werden sollen --> z.B. Bauschutzbereich § 12 LuftVG Hamburg im FHH-Atlas
    if (_.has(Config.tree, "metaIDsToMerge")) {
        rawLayerArray = mergeLayersByMetaIds(rawLayerArray, Config.tree.metaIDsToMerge);
    }
    // Die HVV Layer bekommen Ihre Styles zugeordnet
    // Pro Style wird eine neuer Layer erzeugt
    if (_.has(Config.tree, "layerIDsToStyle")) {
        setStyleForHVVLayer(rawLayerArray);
        rawLayerArray = cloneByStyle(rawLayerArray);
    }

    // Update layer list
    initializeLayerList(rawLayerArray,
        () => {
            // Abwarten bis die layer list geladen ist, dann die app laden
            loadApp();
        });
}

/**
 * Entfernt Objekte aus der response, die mit einer der übergebenen Ids übereinstimmen
 * @param  {Object[]} response - Objekte aus der services.json
 * @param  {string[]} ids - Ids von Objekten die entfernt werden
 * @return {Object[]} response - Objekte aus der services.json
 */
export function deleteLayersByIds (response, ids) {
    return _.reject(response, function (element) {
        return _.contains(ids, element.id);
    });
}

/**
 * Entfernt Objekte aus der response, die mit einer der übergebenen Metadaten-Ids übereinstimmen
 * @param  {Object[]} response - Objekte aus der services.json
 * @param  {string[]} metaIds - Metadaten-Ids von Objekten die entfernt werden
 * @return {Object[]} response - Objekte aus der services.json
 */
export function deleteLayersByMetaIds (response, metaIds) {
    return response.filter(function (element) {
        return element.datasets.length === 0 || _.contains(metaIds, element.datasets[0].md_id) === false;
    });
}

/**
 * Gruppiert Objekte aus der response, die mit einer der übergebenen Metadaten-Ids übereinstimmen
 * @param {Object[]} response - Objekte aus der services.json
 * @param  {string[]} metaIds - Metadaten-Ids von Objekten die gruppiert werden
 * @return {Object[]} response - Objekte aus der services.json
 */
export function mergeLayersByMetaIds (response, metaIds) {
    var rawLayerArray = response,
        objectsById,
        newObject;

    _.each(metaIds, function (metaID) {
        // Objekte mit derselben Metadaten-Id
        objectsById = rawLayerArray.filter(function (layer) {
            return layer.typ === "WMS" && layer.datasets.length > 0 && layer.datasets[0].md_id === metaID;
        });
        // Das erste Objekt wird kopiert
        if (_.isEmpty(objectsById) === false) {
            newObject = _.clone(objectsById[0]);
            // Das kopierte Objekt bekommt den gleichen Namen wie der Metadatensatz
            newObject.name = objectsById[0].datasets[0].md_name;
            // Das Attribut layers wird gruppiert und am kopierten Objekt gesetzt
            newObject.layers = _.pluck(objectsById, "layers").toString();
            // Das Attribut maxScale wird gruppiert und der höchste Wert am kopierten Objekt gesetzt
            newObject.maxScale = _.max(_.pluck(objectsById, "maxScale"), function (scale) {
                return parseInt(scale, 10);
            });
            // Das Attribut minScale wird gruppiert und der niedrigste Wert am kopierten Objekt gesetzt
            newObject.minScale = _.min(_.pluck(objectsById, "minScale"), function (scale) {
                return parseInt(scale, 10);
            });
            // Entfernt alle zu "gruppierenden" Objekte aus der response
            rawLayerArray = _.difference(rawLayerArray, objectsById);
            // Fügt das kopierte (gruppierte) Objekt der response hinzu
            rawLayerArray.push(newObject);
        }
    });

    return rawLayerArray;
}

/**
 * Holt sich die HVV-Objekte aus der services.json
 * Fügt den Objekten konfigurierte Attribute aus der config.js über die Id hinzu
 * @param {Object[]} response - Objekte aus der services.json
 * @return {undefined}
 */
function setStyleForHVVLayer (response) {
    var styleLayerIDs = _.pluck(Config.tree.layerIDsToStyle, "id"),
        layersByID;

    layersByID = response.filter(function (layer) {
        return _.contains(styleLayerIDs, layer.id);
    });
    _.each(layersByID, function (layer) {
        var styleLayer = _.findWhere(Config.tree.layerIDsToStyle, {"id": layer.id}),
            layerExtended = _.extend(layer, styleLayer);

        return layerExtended;
    });
}

/**
 * Aus Objekten mit mehreren Styles, wird pro Style ein neues Objekt erzeugt
 * Das "alte" Objekt wird aus der respnse entfernt
 * @param {Object[]} response - Objekte aus der services.json
 * @return {Object[]} response - Objekte aus der services.json
 */
export function cloneByStyle (response) {
    var rawLayerArray = response,
        objectsByStyle = response.filter(function (model) { // Layer die mehrere Styles haben
            return typeof model.styles === "object" && model.typ === "WMS";
        });

    // Iteriert über die Objekte
    _.each(objectsByStyle, function (obj) {
        // Iteriert über die Styles
        _.each(obj.styles, function (style, index) {
            // Objekt wird kopiert
            var cloneObj = _.clone(obj);

            // Die Attribute name, Id, etc. werden für das kopierte Objekt gesetzt
            cloneObj.style = style;
            cloneObj.legendURL = obj.legendURL[index];
            cloneObj.name = obj.name[index];
            cloneObj.id = obj.id + obj.styles[index];
            cloneObj.styles = obj.styles[index];
            // Objekt wird der Response hinzugefügt
            response.splice(_.indexOf(response, obj), 0, cloneObj);
        }, this);
        // Das ursprüngliche Objekt wird gelöscht
        rawLayerArray = _.without(response, obj);
    }, this);

    return rawLayerArray;
}
