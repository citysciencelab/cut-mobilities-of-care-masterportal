import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
import store from "../../src/app-store/index";

const ParametricURL = Backbone.Model.extend(/** @lends ParametricURL.prototype */{
    defaults: {
        layerParams: [],
        isInitOpen: [],
        zoomToGeometry: "",
        zoomToFeatureIds: [],
        featureViaURL: []
    },

    /**
     * @class ParametricURL
     * @description Processes parameters that are specified via the URL.
     * @extends Backbone.Model
     * @memberOf Core
     * @constructs
     * @property {String[]} layerParamas=[] Parameters to show layers.
     * @property {String[]} isInitOpen="" Tool to be opened initially.
     * @property {string} zoomToGeometry=[] Geoemtry to be zoomed on.
     * @property {String[]} zoomToFeatureIds=[] Features to be zoomed in on.
     * @property {Object[]} featureViaURL=[] The features given by the user via the URL.
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
     * @listens Core#RadioRequestParametricURLGetFeatureViaURL
     * @listens Core#RadioRequestParametricURLGetHighlightFeature
     * @listens Core#RadioRequestParametricURLGetZoomToFeatureIds
     * @listens Core#RadioRequestParametricURLGetBrwId
     * @listens Core#RadioRequestParametricURLGetBrwLayerName
     * @listens Core#RadioTriggerParametricURLUpdateQueryStringParam
     * @fires Core#RadioTriggerParametricURLReady
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByMetaID
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     */
    initialize: function () {
        const channel = Radio.channel("ParametricURL"),
            query = location.search.substr(1);

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
            "getFeatureViaURL": function () {
                return this.get("featureViaURL");
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
            }
        }, this);

        channel.on({
            "updateQueryStringParam": this.updateQueryStringParam
        }, this);

        if (this.checkisURLQueryValid(query)) {
            this.parseURL(query, this.possibleUrlParameters());
        }
        else {
            console.warn("The URL-parameters contain illegal information!");
        }
        channel.trigger("ready");
    },

    /**
     * Checks if the query contains html content, if so it is not valid.
     * @param {string} query - The URL-Parameters
     * @return {boolean} Is the query valid.
     */
    checkisURLQueryValid: function (query) {
        return !(/(<([^>]+)>)/g).test(decodeURIComponent(query));
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
                if (!possibleUrlParameters.hasOwnProperty(parameterNameUpperCase)
                    && parameterNameUpperCase !== "VISIBILITY"
                    && parameterNameUpperCase !== "TRANSPARENCY"
                    && parameterNameUpperCase !== "CONFIG") {
                    console.warn("The URL-Parameter: " + parameterNameUpperCase + " is not supported in The Masterportal!");
                }
            });

            this.setResult(result);
            Object.keys(result).forEach(param => {
                if (possibleUrlParameters.hasOwnProperty(param)) {
                    possibleUrlParameters[param](result[param], param);
                }
            });
        }
        else {
            this.setResult(undefined);
        }
    },

    /**
     * Delivers the possible parameters that can be specified in the URL.
     * @returns {object} The possible URL-parameters.
     */
    possibleUrlParameters: function () {
        return {
            "ALTITUDE": this.evaluateCameraParameters.bind(this),
            "BEZIRK": this.parseZoomToGeometry.bind(this), // @deprecated in version 3.0.0
            "BRWID": this.setBrwId.bind(this),
            "BRWLAYERNAME": this.setBrwLayerName.bind(this),
            "CENTER": this.setCenter.bind(this),
            "CLICKCOUNTER": this.setClickCounter.bind(this),
            "FEATUREID": this.setZoomToFeatureIds.bind(this),
            "FEATUREVIAURL": this.setFeatureViaURL.bind(this),
            "FILTER": this.setFilter.bind(this),
            "HEADING": this.evaluateCameraParameters.bind(this),
            "HIGHLIGHTFEATURE": this.setHighlightfeature.bind(this),
            "ISINITOPEN": this.parseIsInitOpen.bind(this),
            "LAYERIDS": this.createLayerParams.bind(this),
            "MAP": this.adjustStartingMap3DParameter.bind(this),
            "MDID": this.parseMDID.bind(this),
            "PROJECTION": this.parseProjection.bind(this),
            "QUERY": this.parseQuery.bind(this),
            "STARTUPMODUL": this.parseIsInitOpen.bind(this), // @deprecated in version 3.0.0
            "STYLE": this.parseStyle.bind(this),
            "TILT": this.evaluateCameraParameters.bind(this),
            "ZOOMLEVEL": this.setZoomLevel.bind(this),
            "ZOOMTOEXTENT": this.parseZOOMTOEXTENT.bind(this),
            "ZOOMTOGEOMETRY": this.parseZoomToGeometry.bind(this),
            "LNG": this.checkIfLanguageEnabled.bind(this)
        };
    },

    /**
     * Turn strings that can be commonly considered as booleas to real booleans.
     * Such as "true", "false", "1" and "0". This function is case insensitive.
     * @param  {number|string} value - The value to be checked
     * @returns {boolean} - Return of a Boolean
     */
    toBoolean: function (value) {
        const val = typeof value === "string" ? value.toLowerCase() : value;

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
        if (num === null) {
            return 0;
        }
        const factor = Math.pow(10, isFinite(precision) ? precision : 0);

        return Math.round(num * factor) / factor;
    },

    /**
     * todo
     * @param {string} layerIdString - The layerIds.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    createLayerParams: function (layerIdString) {
        const result = this.get("result"),
            visibilityListString = result.hasOwnProperty("VISIBILITY") ? result.VISIBILITY : "",
            transparencyListString = result.hasOwnProperty("TRANSPARENCY") ? result.TRANSPARENCY : "",
            layerIdList = layerIdString.indexOf(",") !== -1 ? layerIdString.split(",") : new Array(layerIdString),
            layerParams = [],
            wrongIdsPositions = [];
        let visibilityList,
            transparencyList;

        // Read out visibility. If missing true
        if (visibilityListString === "") {
            visibilityList = layerIdList.map(() => true);
        }
        else if (visibilityListString.indexOf(",") > -1) {
            visibilityList = visibilityListString.split(",").map(val => {
                return this.toBoolean(val);
            });
        }
        else {
            visibilityList = new Array(this.toBoolean(visibilityListString));
        }

        // Read out transparency value. If missing null.
        if (transparencyListString === "") {
            transparencyList = layerIdList.map(() => 0);
        }
        else if (transparencyListString.indexOf(",") > -1) {
            transparencyList = transparencyListString.split(",").map(val => {
                return this.toNumber(val);
            });
        }
        else {
            transparencyList = [parseInt(transparencyListString, 0)];
        }

        if (layerIdList.length !== visibilityList.length || visibilityList.length !== transparencyList.length) {
            Radio.trigger("Alert", "alert", {text: "<strong>Parametrisierter Aufruf fehlerhaft!</strong> Die Angaben zu LAYERIDS passen nicht zu VISIBILITY bzw. TRANSPARENCY. Sie müssen jeweils in der gleichen Anzahl angegeben werden.", kategorie: "alert-warning"});
            return;
        }

        layerIdList.forEach((val, index) => {
            const layerConfigured = Radio.request("Parser", "getItemByAttributes", {id: val}),
                layerExisting = getLayerWhere({id: val}),
                treeType = Radio.request("Parser", "getTreeType"),
                optionsOfLayer = {
                    id: val,
                    visibility: visibilityList[index]
                };

            let layerToPush;

            if (transparencyList[index] !== null) {
                optionsOfLayer.transparency = transparencyList[index];
            }
            layerParams.push(optionsOfLayer);

            if (layerConfigured === undefined && layerExisting !== null && treeType === "light") {
                layerToPush = Object.assign({
                    isBaseLayer: false,
                    isVisibleInTree: "true",
                    parentId: "tree",
                    type: "layer"
                }, layerExisting);
                Radio.trigger("Parser", "addItemAtTop", layerToPush);
            }
            else if (layerConfigured === undefined) {
                wrongIdsPositions.push(index + 1);
            }
        });

        this.alertWrongLayerIds(wrongIdsPositions);
        this.setLayerParams(layerParams);
    },

    /**
     * Build alert for wrong layerids
     * @param {string[]} wrongIdsPositions - The positions from wrong layerids.
     * @returns {void}
     */
    alertWrongLayerIds: function (wrongIdsPositions) {
        if (wrongIdsPositions.length > 0) {
            let wrongIdsPositionsConcat = wrongIdsPositions.shift();

            wrongIdsPositions.forEach(position => {
                wrongIdsPositionsConcat = wrongIdsPositionsConcat + ", " + String(position);
            });
            store.dispatch("Alerting/addSingleAlert", i18next.t("modules.core.parametricURL.alertWrongLayerIds", {wrongIdsPositionsConcat: wrongIdsPositionsConcat}));
        }
    },

    /**
     * Parses a metadataid.
     * @param {String[]} result - The metadataid.
     * @returns {void}
     */
    parseMDID: function (result) {
        const values = result.split(",");

        Config.tree.metaIdsToSelected = values;
        Config.view.zoomLevel = 0;
        this.createLayerParamsUsingMetaId(values);
    },

    /**
     * Starts the layer with the given metadataid and the lasz configured basemap.
     * @param {string[]} metaIds - layer to be drawn.
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByMetaID
     * @returns {void}
     */
    createLayerParamsUsingMetaId: function (metaIds) {
        const layers = [],
            layerParams = [],
            baseMaps = Radio.request("Parser", "getItemsByAttributes", {isBaseLayer: true});

        layers.push(baseMaps[baseMaps.length - 1]);

        metaIds.forEach(metaId => {
            const metaIDlayers = Radio.request("Parser", "getItemsByMetaID", metaId);

            metaIDlayers.forEach(layer => {
                layers.push(layer);
            });
        });

        layers.forEach(layer => {
            layerParams.push({id: layer.id, visibility: true, transparency: 0});
        });

        this.setLayerParams(layerParams);
    },

    /**
     * todo
     * @param {*} result - todo
     * @returns {void}
     */
    parseProjection: function (result) {
        const projection = result;

        if (projection !== undefined) {
            this.setProjectionFromUrl(projection);
        }
    },

    /**
     * Parse the coorinates from string to floats.
     * @param {string} coordinatesFromUrl - Coordinates from URL.
     * @returns {void}
     */
    parseCoordinates: function (coordinatesFromUrl) {
        const coordinates = coordinatesFromUrl.split(",");

        return coordinates.map(coordinate => parseFloat(coordinate, 10));
    },

    /**
     * todo
     * @param {*} result - todo
     * @returns {void}
     */
    parseZOOMTOEXTENT: function (result) {
        const values = result.split(",");

        this.setZoomToExtent([parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3])]);
    },

    /**
     * Parse a Gemometry to be zoomed on.
     * Only configured geometries are zoomed in.
     * @param {*} gemometryFromUrl - Geometry to be zoomed on.
     * @param {string} property - The parameter that is in URL.
     * @returns {void}
     */
    parseZoomToGeometry: function (gemometryFromUrl, property) {
        let geometries,
            gemometryToZoom = "";

        /**
         * BEZIRK
         * @deprecated in 3.0.0
         */
        if (property === "BEZIRK") {
            console.warn("Parameter 'BEZIRK' is deprecated. Please use 'ZOOMTOGEOMETRY' instead.");
        }

        if (Config.hasOwnProperty("zoomToGeometry") && Config.zoomToGeometry.hasOwnProperty("geometries")) {
            geometries = Config.zoomToGeometry.geometries;

            if (geometries.includes(gemometryFromUrl.toUpperCase())) {
                gemometryToZoom = gemometryFromUrl.toUpperCase();
            }
            else if (Number.isInteger(parseInt(gemometryFromUrl, 10))) {
                gemometryToZoom = geometries[parseInt(gemometryFromUrl, 10) - 1];
            }
            else {
                store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.core.parametricURL.alertZoomToGeometry"));
            }
        }

        this.setZoomToGeometry(gemometryToZoom);
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
            console.warn("Parameter 'STARTUPMODUL' is deprecated. Please use 'ISINITOPEN' instead.");
        }
        this.get("isInitOpen").push(tool);
    },

    /**
     * Parse parameter to search in searchbar.
     * @param {string} query - The Searchquery.
     * @returns {void}
     */
    parseQuery: function (query) {
        let initString = "";

        if (query.indexOf(" ") >= 0 || query.indexOf("-") >= 0) {
            initString = this.convertInitialLettersToUppercase(query, " ");
            initString = this.convertInitialLettersToUppercase(initString, "-");
        }
        else {
            initString = query.substring(0, 1).toUpperCase() + query.substring(1);
        }

        this.setInitString(initString);
    },

    /**
     * convert all initial letters to uppercase letters
     * @param {string} [words=""] - Words with lettes.
     * @param {string} [separator=" "] - Separator for split words.
     * @returns {string} convertet Letters.
     */
    convertInitialLettersToUppercase: function (words = "", separator = " ") {
        const split = words.split(separator);
        let initString = "";

        split.forEach(splitpart => {
            initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + separator;
        });

        return initString.substring(0, initString.length - 1);
    },

    /**
     * Triggers the uiStyle for the modes: table or simple.
     * @param {string} [result=""] - Table or simple style.
     * @fires Core#RadioTriggerUtilSetUiStyle
     * @returns {void}
     */
    parseStyle: function (result = "") {
        const resultUpperCase = result.toUpperCase();

        if (resultUpperCase === "TABLE" || resultUpperCase === "SIMPLE") {
            Radio.trigger("Util", "setUiStyle", resultUpperCase);
        }
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
        const baseUrl = [location.protocol, "//", location.host, location.pathname].join(""),
            urlQueryString = document.location.search,
            newParam = key + "=" + value;

        let keyRegex,
            params = "?" + newParam;

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
     * Checks, if the language is dis- or enabled in the config.js
     * @returns {void}
     */
    checkIfLanguageEnabled: function () {
        if (Config.portalLanguage !== undefined && !Config.portalLanguage.enabled) {
            console.warn("You specified the URL-parameter lng, but disabled the language in the config.js.");
        }
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
    },

    /**
     * Setter for zoomToExtent.
     * @param {*} value - todo
     * @returns {void}
     */
    setZoomToExtent: function (value) {
        this.set("zoomToExtent", value);
    },

    /**
     * Sets the array for the features via the URL.
     * @param {String} value The given features from the URL which is parsed to JSON.
     * @returns {void}
     */
    setFeatureViaURL: function (value) {
        this.set("featureViaURL", JSON.parse(value));
    }
});

export default ParametricURL;
