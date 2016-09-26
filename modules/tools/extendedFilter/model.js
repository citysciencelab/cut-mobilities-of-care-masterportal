define([
    "backbone",
    "backbone.radio",
    "config"
], function (Backbone, Radio, Config) {
    "use strict";
    var extendedFilter = Backbone.Model.extend({
        defaults: {
            wfsList: [],
            attrToFilter: [],
            attrCounter: [],
            orCounter: [],
            ignoredKeys: Config.ignoredKeys
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.checkStatus
            });
        },
        checkStatus: function (args) {   // Fenstermanagement
            if (args[2].getId() === "extendedFilter") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        getLayers: function () {
            var layers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
                featureLayers = _.filter(layers, function (layer) {
                    return layer.get("layer").getSource().getFeatures().length > 0;
                }),
                filterLayers = _.filter(featureLayers, function (layer) {
                    return layer.get("extendedFilter");
                }),
                wfsList = [],
                attributes = [],
                attributes_with_values = [],
                values = [];
            
            _.each (filterLayers, function (layer) {
                _.each(layer.get("layer").getSource().getFeatures() [0].getKeys(), function(key){
                    if (!_.contains(this.get("ignoredKeys"),key.toUpperCase())) {
                        attributes.push(key);
                    }
                },this);
                _.each(attributes, function (attr) {
                    _.each(layer.get("layer").getSource().getFeatures(), function(feature){
                        values.push(feature.get(attr));
                    });
                    attributes_with_values.push({
                        attr : attr,
                        values : _.uniq(values)
                    });
                    values=[];
                });
                wfsList.push({
                    id: layer.id,
                    name: layer.get("name"),
                    extendedFilter: layer.get("extendedFilter"),
                    layer: layer.get("layer"),
                    attributes: attributes_with_values
                });
                attributes = [];
                attributes_with_values = [];  

            },this);
            this.set("wfsList", wfsList);
        }
    });
    return new extendedFilter();
});
