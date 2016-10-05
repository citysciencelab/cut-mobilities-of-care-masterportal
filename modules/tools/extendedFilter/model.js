define(function (require){
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        ExtendedFilter;

    ExtendedFilter = Backbone.Model.extend({
        defaults:{
            currentContent:{
                step: 1,
                name: "Bitte wählen Sie die Filteroption",
                layername: undefined,
                filtername: undefined,
                attribute: undefined,
                options: ["Neuen Filter erstellen"]
            },
            wfsList: [],
            currentFilterType: "Neuen Filter erstellen",
            currentFilters:[],
            ignoredKeys : Config.ignoredKeys,
            filterCounter: 0
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.checkStatus
            });
        },
        getDefaultContent: function () {
            return this.get("defaultContent");
        },
        getCurrentContent: function () {
            return this.get("currentContent");
        },
        setCurrentContent: function (val) {
            this.set("currentContent", val);
        },
        getCurrentFilterType: function () {
            return this.get("currentFilterType");
        },
        setCurrentFilterType: function (val) {
            this.set("currentFilterType", val);
        },
        getCurrentFilters: function () {
            return this.get("currentFilters");
        },
        setCurrentFilters: function (val) {
            this.set("currentFilters", val);
        },
        getFilterCounter: function () {
            return this.get("filterCounter");
        },
        setFilterCounter: function (val) {
            this.set("filterCounter", val);
        },
        getWfsList: function () {
            return this.get("wfsList");
        },
        setWfsList: function (val) {
            return this.set("wfsList", val);
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
                    layer: layer.get("layer"),
                    attributes: attributes_with_values
                });
                attributes = [];
                attributes_with_values = [];

            },this);
            this.set("wfsList", wfsList);
        }
    });
    return ExtendedFilter;
});
