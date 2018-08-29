define(function (require) {

    var Tool = require("modules/core/modelList/tool/model"),
        SaveSelection;

    SaveSelection = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            zoomLevel: "",
            centerCoords: [],
            layerIDList: [],
            layerVisibilityList: [],
            layerTranseparenceList: [],
            url: "",
            simpleMap: false,
            renderToWindow: true
        }),
        initialize: function () {
            var channel = Radio.channel("SaveSelection");

            this.superInitialize();
            channel.reply({
                "getMapState": this.getMapState
            }, this);

            this.listenTo(Radio.channel("ModelList"), {
                "updatedSelectedLayerList": this.filterExternalLayer
            });

            this.listenTo(Radio.channel("MapView"), {
                "changedZoomLevel": this.setZoomLevel,
                "changedCenter": this.setCenterCoords
            });

            this.listenTo(this, {
                "change:isActive": function (model, value) {
                    if (value) {
                        this.setZoomLevel(Radio.request("MapView", "getZoomLevel"));
                        this.setCenterCoords(Radio.request("MapView", "getCenter"));
                        this.filterExternalLayer(Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, type: "layer"}));
                    }
                },
                "change:zoomLevel change:centerCoords": this.setUrl,
                "change:url": this.setSimpleMapUrl
            });
        },

        /**
         * externe Layer werden rausgefiltert
         * @param  {[type]} layerList [description]
         * @returns {void}
         */
        filterExternalLayer: function (layerList) {
            var filteredLayerList = _.filter(layerList, function (model) {
                return !model.get("isExternal");
            });

            filteredLayerList = _.sortBy(filteredLayerList, function (model) {
                return model.get("selectionIDX");
            });
            this.setLayerList(filteredLayerList);
            this.createParamsValues();
        },

        /**
         * [createParamsValues description]
         * @return {[type]} [description]
         */
        createParamsValues: function () {
            var layerVisibilities = [],
                layerTrancparence = [];

            _.each(this.get("layerList"), function (model) {
                layerVisibilities.push(model.get("isVisibleInMap"));
                layerTrancparence.push(model.get("transparency"));
            });
            this.setLayerIdList(_.pluck(this.get("layerList"), "id"));
            this.setLayerTransparencyList(layerTrancparence);
            this.setLayerVisibilityList(layerVisibilities);
            this.setUrl();
        },

        setLayerList: function (value) {
            this.set("layerList", value);
        },

        setZoomLevel: function (zoomLevel) {
            this.set("zoomLevel", Math.round(zoomLevel));
        },

        setCenterCoords: function (coords) {
            this.set("centerCoords", coords);
        },

        setLayerIdList: function (list) {
            this.set("layerIdList", list);
        },

        setLayerVisibilityList: function (list) {
            this.set("layerVisibilityList", list);
        },

        setLayerTransparencyList: function (list) {
            this.set("layerTransparencyList", list);
        },

        setUrl: function () {
            this.set("url", location.origin + location.pathname + "?layerIDs=" + this.get("layerIdList") + "&visibility=" + this.get("layerVisibilityList") + "&transparency=" + this.get("layerTransparencyList") + "&center=" + this.get("centerCoords") + "&zoomlevel=" + this.get("zoomLevel"));
        },

        setSimpleMapUrl: function (model, value) {
            this.set("simpleMapUrl", value + "&style=simple");
        },

        setSimpleMap: function (value) {
            this.set("simpleMap", value);
        },
        getMapState: function () {
            this.setZoomLevel(Radio.request("MapView", "getZoomLevel"));
            this.setCenterCoords(Radio.request("MapView", "getCenter"));
            this.filterExternalLayer(Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, type: "layer"}));
            return this.get("url");
        }
    });
    return SaveSelection;
});
