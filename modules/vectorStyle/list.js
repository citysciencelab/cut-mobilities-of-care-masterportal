import WFSStyle from "./model";

const StyleList = Backbone.Collection.extend({
    model: WFSStyle,
    url: function () {
        if (!_.has(Config, "styleConf") || Config.styleConf === "") {
            return "keine Style JSON";
        }
        return Config.styleConf;
    },
    initialize: function () {
        var channel = Radio.channel("StyleList");

        channel.reply({
            "returnModelById": this.returnModelById
        }, this);

        if (this.url() !== "keine Style JSON") {
            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    Radio.trigger("Alert", "alert", {
                        text: "Fehler beim Laden von: " + Config.styleConf,
                        kategorie: "alert-warning"
                    });
                }
            });
        }
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
     */
    parse: function (data) {
        var layers = Radio.request("Parser", "getItemsByAttributes", {type: "layer"}),
            styleIds = [],
            filteredData = [];

        _.each(layers, function (layer) {
            if (layer.typ === "WFS" || layer.typ === "GeoJSON" || layer.typ === "SensorThings") {
                if (_.has(layer, "styleId")) {
                    styleIds.push(layer.styleId);
                }
            }
            else if (layer.typ === "GROUP") {
                _.each(layer.children, function (child) {
                    if (_.has(child, "styleId")) {
                        styleIds.push(child.styleId);
                    }
                });
            }
        });
        filteredData = _.filter(data, function (styleModel) {
            return _.contains(styleIds, styleModel.layerId);
        });

        return filteredData;
    }
});

export default StyleList;
