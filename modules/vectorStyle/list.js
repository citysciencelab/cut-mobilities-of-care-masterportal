import WFSStyle from "./model";

const StyleList = Backbone.Collection.extend(/** @lends StyleList.prototype */{
    model: WFSStyle,
    /**
     * @class StyleList
     * @extends Backbone.Collection
     * @memberof VectorStyle
     * @constructs
     * @description Collection that stores all the vector styles contained in style.json.
     * Only the styles of the configured layers are kept.
     * If a tool has an attribute "styleId", then also this style is kept.
     * The styleId can be a string or an array of strings or an array of objects that need to have the attribute "id".
     * example "myStyleId", ["myStyleId2", "myStyleId3"], [{"id": "myStyleId4", "name": "I am not relevant for the style"}]
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens VectorStyle#RadioRequestStyleListReturnModelById
     */
    initialize: function () {
        var channel = Radio.channel("StyleList");

        channel.reply({
            "returnModelById": this.returnModelById
        }, this);

        if (Config.hasOwnProperty("styleConf") && Config.styleConf !== "") {
            this.fetchStyles(Config.styleConf);
        }
    },

    /**
     * Fetches the style.json
     * @param {String} url Url to style.json
     * @returns {void}
     */
    fetchStyles: function (url) {
        const xhr = new XMLHttpRequest(),
            that = this;

        xhr.open("GET", url, false);
        xhr.onreadystatechange = function (event) {
            const target = event.target,
                status = target.status;
            let data;

            // ok
            if (status === 200) {
                try {
                    data = JSON.parse(target.response);
                }
                catch (e) {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Die Datei '" + target.responseURL + "' konnte leider nicht geladen werden!</strong> <br> " +
                        "<small>Details: " + e.message + ".</small><br>",
                        kategorie: "alert-warning"
                    });
                }
                that.parseStyles(data);
            }
            // not found
            else if (status === 404) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Die Datei '" + target.responseURL + "' ist nicht vorhanden!</strong>",
                    kategorie: "alert-warning"
                });
            }


        };
        xhr.send();
    },
    returnModelById: function (layerId) {
        return this.find(function (slmodel) {
            return slmodel.attributes.layerId === layerId;
        });
    },
    /**
     * overwrite parse function so that only the style-models are saved
     * whose layers are configured in the config.json
     * After that these models are automatically added to the collection
     * @param  {object[]} data parsed style.json
     * @return {object[]} filtered style.json objects
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     */
    parseStyles: function (data) {
        const layers = Radio.request("Parser", "getItemsByAttributes", {type: "layer"}),
            tools = Radio.request("Parser", "getItemsByAttributes", {type: "tool"});
        let styleIds = [],
            filteredData = [];

        styleIds.push(this.getStyleIdsFromLayers(layers));
        styleIds.push(this.getStyleIdForZoomToFeature());
        styleIds.push(this.getStyleIdForMapMarkerPoint());
        styleIds.push(this.getStyleIdsFromTools(tools));

        styleIds = Array.isArray(styleIds) ? styleIds.reduce((acc, val) => acc.concat(val), []) : styleIds;
        filteredData = data.filter(function (styleModel) {
            return styleIds.includes(styleModel.layerId);
        });

        this.add(filteredData);
        return filteredData;
    },

    /**
     * Gathers the styleIds of the layers.
     * @param {Object[]} layers The configured layers.
     * @returns {Sting[]} - StyleIds from layers.
     */
    getStyleIdsFromLayers: function (layers) {
        const styleIds = [];

        if (layers) {
            layers.forEach(layer => {
                if (layer.typ === "WFS" || layer.typ === "GeoJSON" || layer.typ === "SensorThings") {
                    if (layer.hasOwnProperty("styleId")) {
                        styleIds.push(layer.styleId);
                    }
                }
                else if (layer.typ === "GROUP") {
                    layer.children.forEach(child => {
                        if (child.hasOwnProperty("styleId")) {
                            styleIds.push(child.styleId);
                        }
                    });
                }
            });
        }
        return styleIds;
    },

    /**
     * Gathers the styleIds of the configured tools.
     * @param {Object[]} tools The configured tools.
     * @returns {String[]} - StyleIds of Tools
     */
    getStyleIdsFromTools: function (tools) {
        const styleIds = [];

        if (tools) {
            tools.forEach(tool => {
                if (tool.hasOwnProperty("styleId")) {
                    if (Array.isArray(tool.styleId)) {
                        tool.styleId.forEach(styleIdInArray => {
                            if (styleIdInArray instanceof Object) {
                                styleIds.push(styleIdInArray.id);
                            }
                            else {
                                styleIds.push(styleIdInArray);
                            }
                        });
                    }
                    else {
                        styleIds.push(tool.styleId);
                    }
                }
            });
        }
        return styleIds;
    },

    /**
     * Gets styleId from config for zoomToFeature
     * @returns {String} - Style id
     */
    getStyleIdForZoomToFeature: function () {
        var styleId;

        if (Config && Config.hasOwnProperty("zoomToFeature") && Config.zoomToFeature.hasOwnProperty("styleId")) {
            styleId = Config.zoomToFeature.styleId;
        }
        return styleId;
    },

    /**
     * gets style id from MapMarker
     * @returns {String} - Style id of mapMarker.
     */
    getStyleIdForMapMarkerPoint: function () {
        let styleId;

        if (Config && Config.hasOwnProperty("mapMarker") && Config.mapMarker.hasOwnProperty("mapMarkerStyleId")) {
            styleId = Config.mapMarker.mapMarkerStyleId;
        }
        return styleId;
    }
});

export default StyleList;
