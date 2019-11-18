import {getLayerWhere} from "masterportalAPI/src/rawLayerList";

const ParametricURL = Backbone.Model.extend(/** @lends ParametricURL.prototype */{
    defaults: {
        layerParams: [],
        isInitOpen: [],
        zoomToGeometry: "",
        zoomToFeatureIds: [],
        brwId: undefined,
        brwLayerName: undefined
    },

    /**
     * @class ParametricURL
     * @description Processes parameters that are specified via the URL.
     * @extends Backbone.Model
     * @memberOf Core
     * @constructs
     * @property {Array} layerParams=[] todo
     * @property {Array} isInitOpen=[] todo
     * @property {String} zoomToGeometry="" todo
     * @property {Array} zoomToFeatureIds=[] todo
     * @property {*} brwId=undefined todo
     * @property {*} brwLayerName=undefined todo
     * @listens Core#RadioRequestParametricURLGetResult
     * @listens Core#RadioRequestParametricURLGetLayerParams
     * @listens Core#RadioRequestParametricURLGetIsInitOpen
     * @listens Core#RadioRequestParametricURLGetInitString
     * @listens Core#RadioRequestParametricURLGetProjectionFromUrl
     * @listens Core#RadioRequestParametricURLGetCenter
     * @listens Core#RadioRequestParametricURLGetZoomLevel
     * @listens Core#RadioRequestParametricURLGetZoomToGeometry
     * @listens Core#RadioRequestParametricURLGetZoomToExtent
     * @listens Core#RadioRequestParametricURLGetStyle
     * @listens Core#RadioRequestParametricURLGetFilter
     * @listens Core#RadioRequestParametricURLGetHighlightFeature
     * @listens Core#RadioRequestParametricURLGetZoomToFeatureIds
     * @listens Core#RadioRequestParametricURLGetBrwId
     * @listens Core#RadioRequestParametricURLGetBrwLayerName
     * @listens Core#RadioRequestParametricURLGetMarkerFromUrl
     * @listens Core#RadioTriggerParametricURLUpdateQueryStringParam
     * @listens Core#RadioTriggerParametricURLPushToIsInitOpen
     * @fires Core#RadioTriggerParametricURLReady
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByMetaID
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     */
    initialize: function () {
        const channel = Radio.channel("ParametricURL");

        channel.reply({
            "getResult": function () {
                return this.get("result");
            },
            "getLayerParams": function () {
                return this.get("layerParams");
            },
            "getIsInitOpen": function () {
                return this.get("isInitOpen")[0];
            },
            "getInitString": function () {
                return this.get("initString");
            },
            "getProjectionFromUrl": function () {
                return this.get("projectionFromUrl");
            },
            "getCenter": function () {
                return this.get("center");
            },
            "getZoomLevel": function () {
                return this.get("zoomLevel");
            },
            "getZoomToGeometry": function () {
                return this.get("zoomToGeometry");
            },
            "getZoomToExtent": function () {
                return this.get("zoomToExtent");
            },
            "getStyle": this.getStyle,
            "getFilter": function () {
                return this.get("filter");
            },
            "getHighlightFeature": function () {
                return this.get("highlightfeature");
            },
            "getZoomToFeatureIds": function () {
                return this.get("zoomToFeatureIds");
            },
            "getBrwId": function () {
                return this.get("brwId");
            },
            "getBrwLayerName": function () {
                return this.get("brwLayerName");
            },
            "getMarkerFromUrl": function () {
                return this.get("markerFromUrl");
            }
        }, this);

        channel.on({
            "updateQueryStringParam": this.updateQueryStringParam,
            "pushToIsInitOpen": this.pushToIsInitOpen
        }, this);

        this.parseURL(location.search.substr(1), this.possibleUrlParameters());
        channel.trigger("ready");
    },

    /**
     * Turn strings that can be commonly considered as booleas to real booleans.
     * Such as "true", "false", "1" and "0". This function is case insensitive.
     * @param  {number|string} value - The value to be checked
     * @returns {boolean} - Return of a Boolean
     */
    toBoolean: function (value) {
        var val = typeof value === "string" ? value.toLowerCase() : value;

        switch (val) {
            case true:
            case "true":
            case 1:
            case "1":
            case "on":
            case "yes":
                return true;
            default:
                return false;
        }
    },

    /**
     * Parse string to number. Returns NaN if string can't be parsed to number.
     * Aus underscore.string
     * @param  {string} num - todo
     * @param  {number[]} precision - The decimal places.
     * @returns {number} todo
     */
    toNumber: function (num, precision) {
        var factor;

        if (num === null) {
            return 0;
        }
        factor = Math.pow(10, isFinite(precision) ? precision : 0);
        return Math.round(num * factor) / factor;
    },

    /**
     * todo
     * @param {*} value - todo
     * @returns {void}
     */
    pushToIsInitOpen: function (value) {
        var isInitOpenArray = this.get("isInitOpen"),
            msg = "";

        isInitOpenArray.push(value);
        isInitOpenArray = _.uniq(isInitOpenArray);

        if (isInitOpenArray.length > 1) {
            msg += "Fehlerhafte Kombination von Portalkonfiguration und parametrisiertem Aufruf.<br>";
            _.each(isInitOpenArray, function (tool, index) {
                msg += tool;
                if (index < isInitOpenArray.length - 1) {
                    msg += " und ";
                }
            });
            msg += " können nicht gleichzeitig geöffnet sein";
            Radio.trigger("Alert", "alert", msg);
        }
        this.setIsInitOpenArray(isInitOpenArray);
    },

    /**
     * todo
     * @param {string} layerIdString - The layerIds.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    createLayerParams: function (layerIdString) {
        var visibilityListString = _.has(this.get("result"), "VISIBILITY") ? _.values(_.pick(this.get("result"), "VISIBILITY"))[0] : "",
            transparencyListString = _.has(this.get("result"), "TRANSPARENCY") ? _.values(_.pick(this.get("result"), "TRANSPARENCY"))[0] : "",
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
                return this.toBoolean(val);
            }, this);
        }
        else {
            visibilityList = new Array(this.toBoolean(visibilityListString));
        }

        // Tranzparenzwert auslesen. Wenn fehlend Null.
        if (transparencyListString === "") {
            transparencyList = _.map(layerIdList, function () {
                return 0;
            });
        }
        else if (transparencyListString.indexOf(",") > -1) {
            transparencyList = _.map(transparencyListString.split(","), function (val) {
                return this.toNumber(val);
            }, this);
        }
        else {
            transparencyList = [parseInt(transparencyListString, 0)];
        }

        if (layerIdList.length !== visibilityList.length || visibilityList.length !== transparencyList.length) {
            Radio.trigger("Alert", "alert", {text: "<strong>Parametrisierter Aufruf fehlerhaft!</strong> Die Angaben zu LAYERIDS passen nicht zu VISIBILITY bzw. TRANSPARENCY. Sie müssen jeweils in der gleichen Anzahl angegeben werden.", kategorie: "alert-warning"});
            return;
        }

        _.each(layerIdList, function (val, index) {
            var layerConfigured = Radio.request("Parser", "getItemByAttributes", {id: val}),
                layerExisting = getLayerWhere({id: val}),
                treeType = Radio.request("Parser", "getTreeType"),
                layerToPush;

            layerParams.push({id: val, visibility: visibilityList[index], transparency: transparencyList[index]});

            if (_.isUndefined(layerConfigured) && !_.isNull(layerExisting) && treeType === "light") {
                layerToPush = _.extend({
                    isBaseLayer: false,
                    isVisibleInTree: "true",
                    parentId: "tree",
                    type: "layer"
                }, layerExisting);
                Radio.trigger("Parser", "addItemAtTop", layerToPush);
            }
            else if (_.isUndefined(layerConfigured)) {
                Radio.trigger("Alert", "alert", {text: "<strong>Parametrisierter Aufruf fehlerhaft!</strong> Es sind LAYERIDS in der URL enthalten, die nicht existieren. Die Ids werden ignoriert.(" + val + ")", kategorie: "alert-warning"});
            }
        }, this);

        this.setLayerParams(layerParams);
    },

    /**
     * todo
     * @param {*} metaIds - todo
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByMetaID
     * @returns {void}
     */
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

    /**
     * todo
     * @param {*} result - todo
     * @returns {void}
     */
    parseMDID: function (result) {
        var values = result.split(",");

        Config.tree.metaIdsToSelected = values;
        Config.view.zoomLevel = 0;
        this.createLayerParamsUsingMetaId(values);
    },

    /**
     * todo
     * @param {*} result - todo
     * @returns {void}
     */
    parseProjection: function (result) {
        var projection = result.pop();

        if (!_.isUndefined(projection)) {
            this.setProjectionFromUrl(projection);
        }
    },

    /**
     * todo
     * @param {*} result - todo
     * @param {*} property - todo
     * @returns {void}
     */
    parseCoordinates: function (result) {
        const coordinates = result.split(",");

        return coordinates.map(coordinate => parseFloat(coordinate, 10));
    },

    /**
     * todo
     * @param {*} result - todo
     * @returns {void}
     */
    parseZOOMTOEXTENT: function (result) {
        const values = result.split(",");

        this.set("zoomToExtent", [parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3])]);
    },

    /**
     * todo
     * @param {*} result - todo
     * @returns {void}
     */
    parseBezirk: function (result) {
        const bezirke = [
            {name: "ALTONA", number: "2"},
            {name: "HARBURG", number: "7"},
            {name: "HAMBURG-NORD", number: "4"},
            {name: "BERGEDORF", number: "6"},
            {name: "EIMSBÜTTEL", number: "3"},
            {name: "HAMBURG-MITTE", number: "1"},
            {name: "WANDSBEK", number: "5"},
            {name: "ALL", number: "0"}
        ];
        let bezirk = result;

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

    /**
     * Controls which tool is to be opened initially.
     * @param {string} tool - Tool to be opened initially.
     * @param {string} property - The parameter that is in URL.
     * @returns {void}
     */
    parseIsInitOpen: function (tool, property) {
        /**
         * STARTUPMODUL
         * @deprecated in 3.0.0
         */
        if (property === "STARTUPMODUL") {
            console.warn("Para,eter 'STARTUPMODUL' is deprecated. Please use 'ISINITOPEN' instead.");
        }
        this.get("isInitOpen").push(tool);
    },

    /**
     * todo
     * @param {*} value - todo
     * @returns {void}
     */
    parseQuery: function (value) {
        let initString = "",
            split;

        // Bei " " oder "-" im Suchstring
        if (value.indexOf(" ") >= 0 || value.indexOf("-") >= 0) {

            // nach " " splitten
            split = value.split(" ");

            _.each(split, function (splitpart) {
                initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + " ";
            });
            initString = initString.substring(0, initString.length - 1);

            // nach "-" splitten
            split = "";
            split = initString.split("-");
            initString = "";
            _.each(split, function (splitpart) {
                initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + "-";
            });
            initString = initString.substring(0, initString.length - 1);
        }
        else {
            initString = value.substring(0, 1).toUpperCase() + value.substring(1);
        }
        this.setIinitString(initString);
    },

    /**
     * Triggers the uiStyle for the modes: table or simple.
     * @param {*} result - Table or simple style.
     * @fires Core#RadioTriggerUtilSetUiStyle
     * @returns {void}
     */
    parseStyle: function (result) {
        if (result && (result === "TABLE" || result === "SIMPLE")) {
            Radio.trigger("Util", "setUiStyle", result);
        }
    },

    /**
     * Possible parameters that can be specified in the URL.
     * @returns {object} The possible URL-parameters.
     */
    possibleUrlParameters: function () {
        return {
            "ALTITUDE": this.evaluateCameraParameters.bind(this),
            "BEZIRK": this.parseBezirk.bind(this),
            "BRWID": this.setBrwId.bind(this),
            "BRWLAYERNAME": this.setBrwLayerName.bind(this),
            "CENTER": this.setCenter.bind(this),
            "CLICKCOUNTER": this.setClickCounter.bind(this),
            "FEATUREID": this.setZoomToFeatureIds.bind(this),
            "FILTER": this.setFilter.bind(this),
            "HEADING": this.evaluateCameraParameters.bind(this),
            "HIGHLIGHTFEATURE": this.setHighlightfeature.bind(this),
            "LAYERIDS": this.createLayerParams.bind(this),
            "ISINITOPEN": this.parseIsInitOpen.bind(this),
            "MAP": this.adjustStartingMap3DParameter.bind(this),
            "MARKER": this.setMarkerFromUrl.bind(this),
            "MDID": this.parseMDID.bind(this),
            "PROJECTION": this.parseProjection.bind(this),
            "QUERY": this.parseQuery.bind(this),
            "STARTUPMODUL": this.parseIsInitOpen.bind(this), // @deprecated in version 3.0.0
            "STYLE": this.parseStyle.bind(this),
            "TILT": this.evaluateCameraParameters.bind(this),
            "ZOOMLEVEL": this.setZoomLevel.bind(this),
            "ZOOMTOEXTENT": this.parseZOOMTOEXTENT.bind(this)
        };
    },

    /**
     * Parse the URL parameters.
     * @param {string} query - URL --> everything after ? if available.
     * @param {object} possibleUrlParameters - The possible URL-parameters.
     * @returns {void}
     */
    parseURL: function (query, possibleUrlParameters) {
        const result = {};

        if (query.length > 0) {
            query.split("&").forEach(parameterFromUrl => {
                const parameterFromUrlAsArray = parameterFromUrl.split("="),
                    parameterNameUpperCase = parameterFromUrlAsArray[0].toUpperCase(),
                    parameterValue = decodeURIComponent(parameterFromUrlAsArray[1]);

                result[parameterNameUpperCase] = parameterValue;
                if (possibleUrlParameters.hasOwnProperty(parameterNameUpperCase)) {
                    possibleUrlParameters[parameterNameUpperCase](parameterValue, parameterNameUpperCase);
                }
                else {
                    console.error("The URL-Parameter: " + parameterNameUpperCase + " does not exist!");
                }
            });
            this.setResult(result);
        }
        else {
            this.setResult(undefined);
        }

        /**
         * MDID: This parameter is used to call GeoOnline from the transparency portal.
         * The corresponding data set is to be displayed.
         * Behind the parameter Id is the metadataId of the metadata record.
         * The metadata record ID is written to the config.
         */

        /**
         * CENTER: Returns the initial center coordinate.
         * If the parameter "center" exists its value is returned, otherwise the default value.
         * Specification of the EPSG code of the coordinate via "@".
         */

        // MARKER: Sets a marker, if present in the URL.

        /**
         * LAYERIDS: Gibt die LayerIDs für die Layer zurück, die initial sichtbar sein sollen.
         * Ist der Parameter "layerIDs" vorhanden werden dessen IDs zurückgegeben, ansonsten die konfigurierten IDs.
         */


        /**
         * ZOOMLEVEL: Gibt die initiale Resolution (Zoomlevel) zurück.
         * Ist der Parameter "zoomLevel" vorhanden wird der Wert in die Config geschrieben und in der mapView ausgewertet.
         */

        /**
        * ISINITOPEN: Initial zu startendes Modul
        *
        */

        /**
        * STYLE: blendet alle Bedienelemente aus - für MRH
        *
        */
    },

    /**
     * Evaluates and sets the camera parameters
     * @param {*} result - the value for the camera
     * @param {string} property - represents the camera element
     * @returns {void}
     */
    evaluateCameraParameters: function (result, property) {
        if (!Config.hasOwnProperty("cameraParameter")) {
            Config.cameraParameter = {};
        }

        Config.cameraParameter[property.toLowerCase()] = result;
    },

    /**
     * Sets the clickCounter staticLink to the Config.
     * @param {*} value - todo
     * @returns {void}
     */
    setClickCounter: function (value) {
        Config.clickCounter.staticLink = value;
    },

    /**
     * aAjusts the Config startingMap3D parameter.
     * @param {string} mapMode - The map Mode, 2D or 3D.
     * @returns {void}
     */
    adjustStartingMap3DParameter: function (mapMode) {
        if (mapMode === "2D") {
            Config.startingMap3D = false;
        }
        else if (mapMode === "3D") {
            Config.startingMap3D = true;
        }
    },

    /**
     * todo
     * https://gist.github.com/excalq/2961415
     * @param  {string} key - Key
     * @param  {string} value - Value
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     * @returns {void}
     */
    updateQueryStringParam: function (key, value) {
        var baseUrl = [location.protocol, "//", location.host, location.pathname].join(""),
            urlQueryString = document.location.search,
            newParam = key + "=" + value,
            params = "?" + newParam,
            keyRegex;

        // If the "search" string exists, then build params from it
        if (urlQueryString) {
            keyRegex = new RegExp("([?,&])" + key + "[^&]*");

            // If param exists already, update it
            if (urlQueryString.match(keyRegex) !== null) {
                params = urlQueryString.replace(keyRegex, "$1" + newParam);
            }
            // Otherwise, add it to end of query string
            else {
                params = urlQueryString + "&" + newParam;
            }
        }
        // iframe
        if (window !== window.top) {
            Radio.trigger("RemoteInterface", "postMessage", {"urlParams": params});
        }
        else {
            window.history.replaceState({}, "", baseUrl + params);
        }

        this.parseURL(location.search.substr(1), this.possibleUrlParameters());
    },

    /**
     * Setter for brwId.
     * @param {String} value - The Id from the groundValue (dt. Bodenrichtwert).
     * @returns {void}
     */
    setBrwId: function (value) {
        this.set("brwId", value);
    },

    /**
     * Setter for brwLayerName.
     * @param {String} value - Brw layer name
     * @returns {void}
     */
    setBrwLayerName: function (value) {
        this.set("brwLayerName", value);
    },

    /**
     * Setter for center.
     * @param {String} coordinate - The center-coordinate for the map.
     * @returns {void}
     */
    setCenter: function (coordinate) {
        this.set("center", this.parseCoordinates(coordinate, "CENTER"));
    },

    /**
     * Sets the filter.
     * @param {string} value - Filer values.
     * @returns {void}
     */
    setFilter: function (value) {
        this.set("filter", JSON.parse(value));
    },

    /**
     * Sets the highlightfeature.
     * @param {*} value - todo
     * @returns {void}
     */
    setHighlightfeature: function (value) {
        this.set("highlightfeature", value);
    },

    /**
     * Sets the highlightfeature.
     * @param {*} initString - todo
     * @returns {void}
     */
    setInitString: function (initString) {
        this.set("initString", initString);
    },

    /**
     * Setter for isInitOpen.
     * @param {*} value - todo
     * @returns {void}
     */
    setIsInitOpenArray: function (value) {
        this.set("isInitOpen", value);
    },

    /**
     * Setter for layerParams.
     * @param {*} value - todo
     * @returns {void}
     */
    setLayerParams: function (value) {
        this.set("layerParams", value);
    },

    /**
     * Setter for markerFromUrl.
     * @param {String} coordinate - Coordinate for the marker.
     * @returns {void}
     */
    setMarkerFromUrl: function (coordinate) {
        this.set("markerFromUrl", this.parseCoordinates(coordinate, "MARKER"));
    },

    /**
     * Setter for projectionFromUrl.
     * @param {String} value - todo
     * @returns {void}
     */
    setProjectionFromUrl: function (value) {
        this.set("projectionFromUrl", value);
    },


    /**
     * Setter for result.
     * @param {*} value - todo
     * @returns {void}
     */
    setResult: function (value) {
        this.set("result", value);
    },

    /**
     * Setter for zoomLevel.
     * @param {*} value - todo
     * @returns {void}
     */
    setZoomLevel: function (value) {
        this.set("zoomLevel", value);
    },

    /**
     * Setter for zoomToFeatureIds.
     * @param {*} ids - Feature IDs.
     * @returns {void}
     */
    setZoomToFeatureIds: function (ids) {
        this.set("zoomToFeatureIds", ids.split(","));
    },

    /**
     * Setter for zoomToGeometry.
     * @param {*} value - todo
     * @returns {void}
     */
    setZoomToGeometry: function (value) {
        this.set("zoomToGeometry", value);
    }
});

export default ParametricURL;
