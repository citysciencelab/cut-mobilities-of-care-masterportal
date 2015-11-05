define([
    'underscore',
    'config',
    'backbone'
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
            if (_.has(result, 'CENTER')) {
                var values = _.values(_.pick(result, 'CENTER'))[0].split(',');
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
            if (_.has(result, 'LAYERIDS')) {
                var values = _.values(_.pick(result, 'LAYERIDS'))[0].split(','),
                    newLayerIDs = Config.layerIDs;
                if (_.has(Config, "layerIDs")) {
                    var layeridList = values,
                        visibilityList,
                        params = [],
                        visibilitycheck = false;
                    if (_.has(result, 'VISIBILITY')) {
                        visibilityList = _.values(_.pick(result, "VISIBILITY"))[0].split(",");
                         //für alle Layerid-parameter visible-parameter enthalten?
                        visibilitycheck = (visibilityList.length === layeridList.length);
                    }
                    //Layer-ID-Objekt aus Url-Params erstellen
                    _.each(layeridList, function (k,i){
                        //wenn für alle Layerid-parameter visible-parameter enthalten sind.
                        if (visibilitycheck === true) {
                            //cast to boolean
                            var visibleParam = (visibilityList[i] == 'TRUE');
                            params.push({
                                id: layeridList[i],
                                visible: visibleParam
                            });
                        }
                        //wenn nicht, alle defaultmäßig 'true'setzen
                        else {
                            params.push({
                                id: layeridList[i],
                                visible: true
                                });
                            }
                    });
                    //layerid-Wert in config enthalten?
                    _.each(params,function(param){
                        var checked = false,
                        actualparam = param;
                        _.some(newLayerIDs,function(newLayerID){
                            if (newLayerID.id === actualparam.id) {
                                //nur wenn in URL vorhanden, config-layer-visibles überschreiben
                                if (visibilitycheck === true){
                                    newLayerID.visible =actualparam.visible;
                                }
                                checked = true;
                            }
                            return;
                        })
                        //wenn Layerid-Wert aus URL nicht in Config, dann zur Config zufügen
                        if (!checked){
                           Config.layerIDs.push({id:param.id,visible:param.visible});
                        }
                    })
                    Config.layerIDs = newLayerIDs;
                }
                else {
                    var visibilityList = _.values(_.pick(result, "VISIBILITY"))[0].split(",");

                    Config.tree.layerIDsToSelect = [];
                    _.each(values, function (value, index) {
                        if (visibilityList[index] === "TRUE") {
                            Config.tree.layerIDsToSelect.push({id: value, visibility: true});
                        }
                        else {
                            Config.tree.layerIDsToSelect.push({id: value, visibility: false});
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
            if (_.has(result, 'ISMENUBARVISIBLE')) {
                var value = _.values(_.pick(result, 'ISMENUBARVISIBLE'))[0].toUpperCase();
                if (value ==  'TRUE') {
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
            if (_.has(result, 'STARTUPMODUL')) {
                var value = _.values(_.pick(result, 'STARTUPMODUL'))[0].toUpperCase();
                Config.startUpModul = value;
            }

            /**
            *
            */
            if (_.has(result, 'QUERY')) {
                var value = _.values(_.pick(result, 'QUERY'))[0];
                value = value.substring(0, 1) + value.substring(1).toLowerCase();
                Config.searchBar.initString = value;
            }

            /**
            * Gibt den Wert für die config-Option clickCounter.enabled zurück.
            *
            */
            if (_.has(result, 'CLICKCOUNTER')) {
                var value = _.values(_.pick(result, 'CLICKCOUNTER'))[0].toUpperCase();
                Config.clickCounter.version = value;
            }
        }
    });

    return ParametricURL;
});
