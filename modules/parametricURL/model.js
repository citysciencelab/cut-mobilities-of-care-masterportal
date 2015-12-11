define([
    "underscore",
    "config",
    "backbone"
], function (_, Config, Backbone) {

    var ParametricURL = Backbone.Model.extend({

        initialize: function () {
            // Parsen des parametrisierten Aufruf --> http://wscd0096/libs/lgv/portale/master?layerIDs=453,1346&center=555874,5934140&zoomLevel=4&isMenubarVisible=false
            var query = location.search.substr(1).toUpperCase(), // URL --> alles nach ? wenn vorhanden
                result = {};

            query.split("&").forEach(function (keyValue) {
                var item = keyValue.split("=");

                result[item[0]] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
            });
            /**
             * Gibt die initiale Zentrumskoordinate zurück.
             * Ist der Parameter 'center' vorhanden wird dessen Wert zurückgegeben, ansonsten der Standardwert.
             */
            if (_.has(result, "CENTER")) {
                var values = _.values(_.pick(result, "CENTER"))[0].split(",");

                _.each(values, function (value, index, list) {
                    value = parseInt(value);
                    values[index] = value;
                });
                Config.view.center = values;
            }

            /**
             * Gibt die LayerIDs für die Layer zurück, die initial sichtbar sein sollen.
             * Ist der Parameter 'layerIDs' vorhanden werden dessen IDs zurückgegeben, ansonsten die konfigurierten IDs.
             */
            if (_.has(result, "LAYERIDS")) {
                var valuesString = _.values(_.pick(result, "LAYERIDS"))[0],
                    visibilityListString = _.values(_.pick(result, "VISIBILITY"))[0],
                    values = [],
                    visibilityList = [],
                    newLayerIDs = Config.tree.layer;

                if (valuesString.indexOf(",") !== -1) {
                    values = valuesString.split(",");
                }
                else {
                    values.push(valuesString);
                }
                if (_.has(result, "VISIBILITY")) {
                    if (visibilityListString && visibilityListString.indexOf(",") !== -1) {
                        visibilityList = visibilityListString.split(",");
                    }
                    else {
                        visibilityList.push(visibilityListString);
                    }
                }
                if (Config.tree.type === "light" || Config.tree.type === "custom") {
                    var params = [],
                        visibilitycheck = false;

                    if (visibilityListString) {
                        // für alle Layerid-parameter visible-parameter enthalten?
                        visibilitycheck = (visibilityList.length === values.length);
                    }
                    // Layer-ID-Objekt aus Url-Params erstellen
                    _.each(values, function (k, i) {
                        // wenn für alle Layerid-parameter visible-parameter enthalten sind.
                        if (visibilitycheck === true) {
                            var visibleParam = (visibilityList[i] === "TRUE");

                            params.push({
                                id: values[i],
                                visibility: visibleParam
                            });
                        }
                        // wenn nicht, alle defaultmäßig 'true'setzen
                        else {
                            params.push({
                                id: values[i],
                                visibility: true
                                });
                            }
                    });
                    // Wenn Layer nicht im tree.layer enthalten ist, diesen hinzufügen
                    _.each(params, function (param) {
                        var layer = _.find(Config.tree.layer, function (layer) {
                            var layerid = "";
                            // Gruppenlayer
                            if (_.isObject(layer.id)) {
                                _.each (layer.id, function (obj) {
                                    layerid += obj.id + "_";
                                });
                                layerid = layerid.substring(0, layerid.length - 1);
                            }
                            // Singlelayer
                            else {
                                layerid = layer.id;
                            }
                            return layerid === param.id;
                        });
                        if (!layer) {
                            Config.tree.layer = [];
                            Config.tree.layer.push({
                                id: param.id,
                                visibility: false
                            });
                        }
                    });
                    // Layersichtbarkeit schalten
                    _.each(Config.tree.layer, function (layer) {
                        var layerid = "";

                        // Gruppenlayer
                        if (_.isObject(layer.id)) {
                            _.each (layer.id, function (obj) {
                                layerid += obj.id + "_";
                            });
                            layerid = layerid.substring(0, layerid.length - 1);
                        }
                        // Singlelayer
                        else {
                            layerid = layer.id;
                        }
                        var param = _.find(params, function (par) {
                            return par.id === layerid;
                        });

                        if (param && param.visibility === true) {
                            layer.visibility = true;
                        }
                        else {
                            layer.visibility = false;
                        }
                    });
                }
                else if (Config.tree.type === "default" && visibilityListString) {
                    Config.tree.layerIDsToSelect = [];
                    _.each(values, function (value, index) {
                        if (visibilityList[index] === "TRUE") {
                            Config.tree.layerIDsToSelect.push({id: value.toLowerCase(), visibility: true});
                        }
                        else {
                            Config.tree.layerIDsToSelect.push({id: value.toLowerCase(), visibility: false});
                        }
                    });
                }
            }

            /**
             * Gibt die initiale Resolution (Zoomlevel) zurück.
             * Ist der Parameter 'zoomLevel' vorhanden wird der Wert in die Config geschrieben und in der mapView ausgewertet.
             */
            if (_.has(result, "ZOOMLEVEL")) {
                var value = _.values(_.pick(result, "ZOOMLEVEL"))[0];

                Config.view.zoomLevel = value;
            }

            /**
            * Gibt den Wert für die config-Option isMenubarVisible zurück.
            * Ist der Parameter 'isMenubarVisible' vorhanden, wird dieser zurückgegeben, ansonsten der Standardwert.
            *
            */
            if (_.has(result, "ISMENUBARVISIBLE")) {
                var value = _.values(_.pick(result, "ISMENUBARVISIBLE"))[0].toUpperCase();

                if (value === "TRUE") {
                    Config.isMenubarVisible = true;
                }
                else {
                    Config.isMenubarVisible = false;
                }
            }

            /**
            * Gibt den Wert für die config-Option isMenubarVisible zurück.
            * Ist der Parameter 'isMenubarVisible' vorhanden, wird dieser zurückgegeben, ansonsten der Standardwert.
            *
            */
            if (_.has(result, "STARTUPMODUL")) {
                var value = _.values(_.pick(result, "STARTUPMODUL"))[0].toUpperCase();

                Config.startUpModul = value;
            }

            /**
            *
            */
            if (_.has(result, "QUERY")) {
                var value = _.values(_.pick(result, "QUERY"))[0];

                value = value.substring(0, 1) + value.substring(1).toLowerCase();
                Config.searchBar.initString = value;
            }

            /**
            * Gibt den Wert für die config-Option clickCounter.enabled zurück.
            *
            */
            if (_.has(result, "CLICKCOUNTER")) {
                var value = _.values(_.pick(result, "CLICKCOUNTER"))[0].toUpperCase();

                Config.clickCounter.version = value;
            }
        }
    });

    return ParametricURL;
});
