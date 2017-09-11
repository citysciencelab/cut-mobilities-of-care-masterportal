define([
    "backbone",
    "backbone.radio",
    "underscore.string",
    "config"
], function (Backbone, Radio, _String, Config) {

    var ParametricURL = Backbone.Model.extend({
        defaults: {
            layerParams: []
        },
        initialize: function () {
            var channel = Radio.channel("ParametricURL");

            channel.reply({
                "getResult": this.getResult,
                "getLayerParams": this.getLayerParams,
                "getStartUpModul": this.getStartUpModul,
                "getInitString": this.getInitString,
                "getCenter": this.getCenter
            }, this);

            this.parseURL();
            channel.trigger("ready");
        },

        setResult: function (value) {
            this.set("result", value);
        },

        setLayerParams: function (value) {
            this.set("layerParams", value);
        },

        getResult: function () {
            return this.get("result");
        },

        getLayerParams: function () {
            return this.get("layerParams");
        },

        getStartUpModul: function () {
            return this.get("startUpModul");
        },

        getCenter: function () {
            return this.get("center");
        },

        getInitString: function () {
            return this.get("initString");
        },
        createLayerParams: function () {
            var layerIdString = _.values(_.pick(this.getResult(), "LAYERIDS"))[0],
                visibilityListString = _.has(this.getResult(), "VISIBILITY") ? _.values(_.pick(this.getResult(), "VISIBILITY"))[0] : "",
                transparencyListString = _.has(this.getResult(), "TRANSPARENCY") ? _.values(_.pick(this.getResult(), "TRANSPARENCY"))[0] : "",
                layerIdList = layerIdString.indexOf(",") !== -1 ? layerIdString.split(",") : new Array(layerIdString),
                visibilityList = visibilityListString === "" ? _.map(layerIdList, function () {
                    return true;
                }) : visibilityListString.indexOf(",") > -1 ? _.map(visibilityListString.split(","), function (val) {
                    return _String.toBoolean(val);
                }) : new Array(_String.toBoolean(visibilityListString)),
                transparencyList,
                layerParams = [];

            // Tranzparenzwert auslesen. Wenn fehlend Null.
            if (transparencyListString === "") {
                transparencyList = _.map(layerIdList, function () {
                   return 0;
               });
            }
            else if (transparencyListString.indexOf(",") > -1) {
                transparencyList = _.map(transparencyListString.split(","), function (val) {
                     return _String.toNumber(val);
                 });
            }
            else {
                transparencyList = [parseInt(transparencyListString, 10)];
            }

            if (layerIdList.length !== visibilityList.length || visibilityList.length !== transparencyList.length) {
                Radio.trigger("Alert", "alert", {text: "<strong>Parametrisierter Aufruf fehlerhaft!</strong> Die Angaben zu LAYERIDS passen nicht zu VISIBILITY bzw. TRANSPARENCY. Sie müssen jeweils in der gleichen Anzahl angegeben werden.", kategorie: "alert-warning"});
            }
            else {
                _.each(layerIdList, function (val, index) {
                     var layerConfigured = Radio.request("Parser", "getItemByAttributes", { id: val }),
                     layerExisting = Radio.request("RawLayerList", "getLayerAttributesWhere", { id: val}),
                     treeType = Radio.request("Parser", "getTreeType");

                     layerParams.push({ id: val, visibility: visibilityList[index], transparency: transparencyList[index] });

                     if (_.isUndefined(layerConfigured) && !_.isNull(layerExisting) && treeType === "light") {
                         var layerToPush = _.extend({type: "layer", parentId: "Themen", isVisibleInTree: "true"}, layerExisting);

                         Radio.trigger("Parser", "addItemAtTop", layerToPush);
                     }
                     else if (_.isUndefined(layerConfigured)) {
                         Radio.trigger("Alert", "alert", { text: "<strong>Parametrisierter Aufruf fehlerhaft!</strong> Es sind LAYERIDS in der URL enthalten, die nicht existieren. Die Ids werden ignoriert.", kategorie: "alert-warning" });
                     }
                });
                this.setLayerParams(layerParams);
            }
        },
        createLayerParamsUsingMetaId: function (metaIds) {
            var layers = [],
                layerParams = [],
                hintergrundKarte = Radio.request("Parser", "getItemByAttributes", {id: "453"});

            layers.push(hintergrundKarte);

            _.each(metaIds, function (metaId) {
                var metaIDlayers = Radio.request("Parser", "getItemsByMetaID", metaId);

                _.each(metaIDlayers, function (layer) {
                    layers.push(layer);
                });
            });
            _.each(layers, function (layer) {
                layerParams.push({id: layer.id, visibility: true, transparency: 0});
            });
            this.setLayerParams(layerParams);
        },

        parseURL: function (result) {
            // Parsen des parametrisierten Aufruf --> http://wscd0096/libs/lgv/portale/master?layerIDs=453,1346&center=555874,5934140&zoomLevel=4&isMenubarVisible=false
            var query = location.search.substr(1), // URL --> alles nach ? wenn vorhanden
                result = {};

            query.split("&").forEach(function (keyValue) {
                var item = keyValue.split("=");

                result[item[0].toUpperCase()] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
            });

            this.setResult(result);
            /**
             * Über diesen Parameter wird GeoOnline aus dem Transparenzporal aufgerufen
             * Der entsprechende Datensatz soll angezeigt werden
             * Hinter dem Parameter Id steckt die MetadatenId des Metadatensatzes
             * Die Metadatensatz-Id wird in die config geschrieben
             */
            if (_.has(result, "MDID")) {
                var values = _.values(_.pick(result, "MDID"))[0].split(",");

                Config.tree.metaIdsToSelected = values;
                Config.view.zoomLevel = 0;
                this.createLayerParamsUsingMetaId(values);
            }

            /**
             * Gibt die initiale Zentrumskoordinate zurück.
             * Ist der Parameter "center" vorhanden wird dessen Wert zurückgegeben, ansonsten der Standardwert.
             * Angabe des EPSG-Codes der Koordinate über "@"
             */
            if (_.has(result, "CENTER")) {
                var crs = _.values(_.pick(result, "CENTER"))[0].split("@")[1] ? _.values(_.pick(result, "CENTER"))[0].split("@")[1] : "",
                    values = _.values(_.pick(result, "CENTER"))[0].split("@")[1] ? _.values(_.pick(result, "CENTER"))[0].split("@")[0].split(",") : _.values(_.pick(result, "CENTER"))[0].split(",");

                this.set("center", {
                    crs: crs,
                    x: parseFloat(values[0]),
                    y: parseFloat(values[1]),
                    z: values[2] ? parseFloat(values[2]) : 0
                });
            }

            if (_.has(result, "BEZIRK")) {
                var bezirk = _.values(_.pick(result, "BEZIRK"))[0],
                    bezirke = [
                        {name: "ALTONA", number: "2", position: [556681, 5937664]},
                        {name: "HAMBURG-HARBURG", number: "7", position: [560291, 5925817]},
                        {name: "HAMBURG-NORD", number: "4", position: [567677, 5941650]},
                        {name: "BERGEDORF", number: "6", position: [578779, 5924255]},
                        {name: "EIMSBÜTTEL", number: "3", position: [561618, 5940019]},
                        {name: "HAMBURG-MITTE", number: "1", position: [566380, 5932134]},
                        {name: "WANDSBEK", number: "5", position: [574344, 5943750]}
                    ];

                    if (bezirk.length === 1) {
                        this.set("center", {
                            crs: "",
                            x: _.findWhere(bezirke, {number: bezirk}).position[0],
                            y: _.findWhere(bezirke, {number: bezirk}).position[1],
                            z: 0
                        });
                    }
                    else {
                        this.set("center", {
                            crs: "",
                            x: _.findWhere(bezirke, {name: bezirk.trim().toUpperCase()}).position[0],
                            y: _.findWhere(bezirke, {name: bezirk.trim().toUpperCase()}).position[1],
                            z: 0
                        });
                    }
            }

            /**
             * Gibt die LayerIDs für die Layer zurück, die initial sichtbar sein sollen.
             * Ist der Parameter "layerIDs" vorhanden werden dessen IDs zurückgegeben, ansonsten die konfigurierten IDs.
             */
            if (_.has(result, "LAYERIDS") && result.LAYERIDS.length > 0) {
                this.createLayerParams();
            }

            if (_.has(result, "FEATUREID")) {
                var ids = _.values(_.pick(result, "FEATUREID"))[0];

                Config.zoomtofeature.ids = ids.split(",");
            }

            /**
             * Gibt die initiale Resolution (Zoomlevel) zurück.
             * Ist der Parameter "zoomLevel" vorhanden wird der Wert in die Config geschrieben und in der mapView ausgewertet.
             */
            if (_.has(result, "ZOOMLEVEL")) {
                var value = _.values(_.pick(result, "ZOOMLEVEL"))[0];

                Config.view.zoomLevel = value;
            }

            /**
            * Gibt den Wert für die config-Option isMenubarVisible zurück.
            * Ist der Parameter "isMenubarVisible" vorhanden, wird dieser zurückgegeben, ansonsten der Standardwert.
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
            * Ist der Parameter "isMenubarVisible" vorhanden, wird dieser zurückgegeben, ansonsten der Standardwert.
            *
            */
            if (_.has(result, "STARTUPMODUL")) {
                this.set("startUpModul", _.values(_.pick(result, "STARTUPMODUL"))[0].toUpperCase());
            }
            else {
                this.set("startUpModul", "");
            }

            /**
            *
            */
            if (_.has(result, "QUERY")) {
                var value = _.values(_.pick(result, "QUERY"))[0].toLowerCase(),
                    initString = "";

                // Bei " " oder "-" im Suchstring
                if (value.indexOf(" ") >= 0 || value.indexOf("-") >= 0) {

                    // nach " " splitten
                    var split = value.split(" ");

                    _.each (split, function (splitpart) {
                        initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + " ";
                    });
                    initString = initString.substring(0, initString.length - 1);

                    // nach "-" splitten
                    split = "";
                    split = initString.split("-");
                    initString = "";
                    _.each (split, function (splitpart) {
                        initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + "-";
                    });
                    initString = initString.substring(0, initString.length - 1);
                }
                else {
                    initString = value.substring(0, 1).toUpperCase() + value.substring(1);
                }
                this.set("initString", initString);
            }

            /**
            * blendet alle Bedienelemente aus - für MRH
            *
            */
            if (_.has(result, "STYLE")) {
                var value = _.values(_.pick(result, "STYLE"))[0].toUpperCase();

                if (value === "SIMPLE") {
                    $("#main-nav").hide();
                }
            }
        }
    });

    return ParametricURL;
});
