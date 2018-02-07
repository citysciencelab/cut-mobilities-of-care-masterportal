define([
    "backbone",
    "backbone.radio",
    "underscore.string",
    "config"
], function (Backbone, Radio, _String, Config) {

    var ParametricURL = Backbone.Model.extend({
        defaults: {
            layerParams: [],
            isInitOpen: "",
            zoomToGeometry: ""
        },
        initialize: function () {
            var channel = Radio.channel("ParametricURL");

            channel.reply({
                "getResult": this.getResult,
                "getLayerParams": this.getLayerParams,
                "getIsInitOpen": this.getIsInitOpen,
                "getInitString": this.getInitString,
                "getCenter": this.getCenter,
                "getZoomLevel": this.getZoomLevel,
                "getZoomToGeometry": this.getZoomToGeometry,
                "getZoomToExtent": this.getZoomToExtent
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

        getIsInitOpen: function () {
            return this.get("isInitOpen");
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
                visibilityList,
                transparencyList,
                layerParams = [];

            // Sichtbarkeit auslesen. Wenn fehlend true
            if (visibilityListString === "") {
                visibilityList = _.map(layerIdList, function () {
                   return true;
               });
            }
            else if (visibilityListString.indexOf(",") > -1) {
                visibilityList = _.map(visibilityListString.split(","), function (val) {
                     return _String.toBoolean(val);
                 });
            }
            else {
                visibilityList = new Array(_String.toBoolean(visibilityListString));
            }

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
                transparencyList = [parseInt(transparencyListString, 0)];
            }

            if (layerIdList.length !== visibilityList.length || visibilityList.length !== transparencyList.length) {
                Radio.trigger("Alert", "alert", {text: "<strong>Parametrisierter Aufruf fehlerhaft!</strong> Die Angaben zu LAYERIDS passen nicht zu VISIBILITY bzw. TRANSPARENCY. Sie müssen jeweils in der gleichen Anzahl angegeben werden.", kategorie: "alert-warning"});
                return;
            }

            _.each(layerIdList, function (val, index) {
                 var layerConfigured = Radio.request("Parser", "getItemByAttributes", { id: val }),
                 layerExisting = Radio.request("RawLayerList", "getLayerAttributesWhere", { id: val}),
                 treeType = Radio.request("Parser", "getTreeType");

                 layerParams.push({ id: val, visibility: visibilityList[index], transparency: transparencyList[index] });

                 if (_.isUndefined(layerConfigured) && !_.isNull(layerExisting) && treeType === "light") {
                     var layerToPush = _.extend({type: "layer", parentId: "tree", isVisibleInTree: "true"}, layerExisting);

                     Radio.trigger("Parser", "addItemAtTop", layerToPush);
                 }
                 else if (_.isUndefined(layerConfigured)) {
                     Radio.trigger("Alert", "alert", { text: "<strong>Parametrisierter Aufruf fehlerhaft!</strong> Es sind LAYERIDS in der URL enthalten, die nicht existieren. Die Ids werden ignoriert.(" + val + ")", kategorie: "alert-warning" });
                 }
            }, this);

            this.setLayerParams(layerParams);
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
        parseMDID: function (result) {
            var values = _.values(_.pick(result, "MDID"))[0].split(",");

            Config.tree.metaIdsToSelected = values;
            Config.view.zoomLevel = 0;
            this.createLayerParamsUsingMetaId(values);
        },
        parseCenter: function (result) {
            var values = _.values(_.pick(result, "CENTER"))[0].split("@")[1] ? _.values(_.pick(result, "CENTER"))[0].split("@")[0].split(",") : _.values(_.pick(result, "CENTER"))[0].split(",");

            // parse Strings to numbers
            values = _.map(values, Number);
            this.set("center", values);

        },

        parseZOOMTOEXTENT: function (result) {
            var values = _.values(_.pick(result, "ZOOMTOEXTENT"))[0].split(",");

            this.set("zoomToExtent", [parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3])]);
        },
        parseBezirk: function (result) {
            var bezirk = _.values(_.pick(result, "BEZIRK"))[0],
                bezirke = [
                    {name: "ALTONA", number: "2"},
                    {name: "HARBURG", number: "7"},
                    {name: "HAMBURG-NORD", number: "4"},
                    {name: "BERGEDORF", number: "6"},
                    {name: "EIMSBÜTTEL", number: "3"},
                    {name: "HAMBURG-MITTE", number: "1"},
                    {name: "WANDSBEK", number: "5"},
                    {name: "ALL", number: "0"}
                ];

            if (bezirk.length === 1) {
                bezirk = _.findWhere(bezirke, {number: bezirk});
            }
            else {
                bezirk = _.findWhere(bezirke, {name: bezirk.trim().toUpperCase()});
            }
            if (_.isUndefined(bezirk)) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Der Parametrisierte Aufruf des Portals ist leider schief gelaufen!</strong> <br> <small>Details: Konnte den Parameter Bezirk = " + _.values(_.pick(result, "BEZIRK"))[0] + " nicht auflösen.</small>",
                    kategorie: "alert-warning"
                });
                return;
            }
            this.setZoomToGeometry(bezirk.name);
        },

        parseFeatureId: function (result) {
            var ids = _.values(_.pick(result, "FEATUREID"))[0];

            Config.zoomtofeature.ids = ids.split(",");
        },
        parseZoomLevel: function (result) {
            var value = _.values(_.pick(result, "ZOOMLEVEL"))[0];

            this.set("zoomLevel", value);
        },
       parseIsInitOpen: function (result) {
            this.set("isInitOpen", _.values(_.pick(result, "ISINITOPEN"))[0].toUpperCase());
        },
        parseStartupModul: function (result) {
            this.set("isInitOpen", _.values(_.pick(result, "STARTUPMODUL"))[0].toUpperCase());
        },
        parseQuery: function (result) {
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
        },
        parseStyle: function (result) {
            var value = _.values(_.pick(result, "STYLE"))[0].toUpperCase();

            if (value === "SIMPLE") {
                $("#main-nav").hide();
                $("#map").css("height", "100%");
            }
        },
        parseURL: function (result) {
            // Parsen des parametrisierten Aufruf --> http://wscd0096/libs/lgv/portale/master?layerIDs=453,1346&center=555874,5934140&zoomLevel=4
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
                this.parseMDID(result);
            }

            /**
             * Gibt die initiale Zentrumskoordinate zurück.
             * Ist der Parameter "center" vorhanden wird dessen Wert zurückgegeben, ansonsten der Standardwert.
             * Angabe des EPSG-Codes der Koordinate über "@"
             */
            if (_.has(result, "CENTER")) {
                this.parseCenter(result);
            }

            if (_.has(result, "ZOOMTOEXTENT")) {
                this.parseZOOMTOEXTENT(result);
            }

            if (_.has(result, "BEZIRK")) {
                this.parseBezirk(result);
            }

            /**
             * Gibt die LayerIDs für die Layer zurück, die initial sichtbar sein sollen.
             * Ist der Parameter "layerIDs" vorhanden werden dessen IDs zurückgegeben, ansonsten die konfigurierten IDs.
             */
            if (_.has(result, "LAYERIDS") && result.LAYERIDS.length > 0) {
                this.createLayerParams();
            }

            if (_.has(result, "FEATUREID")) {
                this.parseFeatureId(result);
            }

            /**
             * Gibt die initiale Resolution (Zoomlevel) zurück.
             * Ist der Parameter "zoomLevel" vorhanden wird der Wert in die Config geschrieben und in der mapView ausgewertet.
             */
            if (_.has(result, "ZOOMLEVEL")) {
                this.parseZoomLevel(result);
            }

            /**
            * Initial zu startendes Modul
            *
            */
            if (_.has(result, "ISINITOPEN")) {
                this.parseIsInitOpen(result);
            }

            /**
            * Rückwärtskompatibel: entspricht isinitopen
            */
            if (_.has(result, "STARTUPMODUL")) {
                this.parseStartupModul(result);
            }

            /**
            *
            */
            if (_.has(result, "QUERY")) {
                this.parseQuery(result);
            }

            /**
            * blendet alle Bedienelemente aus - für MRH
            *
            */
            if (_.has(result, "STYLE")) {
                this.parseStyle(result);
            }
        },
        // getter for zoomToGeometry
        getZoomToGeometry: function () {
            return this.get("zoomToGeometry");
        },
        // setter for zoomToGeometry
        setZoomToGeometry: function (value) {
            this.set("zoomToGeometry", value);
        },
        // getter for zoomToLevel
        getZoomLevel: function () {
            return this.get("zoomLevel");
        },
        // setter for zoomLevel
        setZoomLevel: function (value) {
            this.set("zoomLevel", value);
        },

        getZoomToExtent: function () {
            return this.get("zoomToExtent");
        }
    });

    return ParametricURL;
});
