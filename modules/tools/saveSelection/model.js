define([
    "backbone",
    "backbone.radio",
    "config"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        SaveSelection;

    SaveSelection = Backbone.Model.extend({
        defaults: {
            zoomLevel: "",
            centerCoords: [],
            layerIDList: [],
            layerVisibilityList: [],
            layerTranseparenceList: [],
            url: "",
            simpleMap: false
        },
        initialize: function () {
            var channel = Radio.channel("SaveSelection");
            channel.reply({
                "getMapState": this.getMapState
            }, this);
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.checkStatus
            });

            this.listenTo(Radio.channel("ModelList"), {
                 "updatedSelectedLayerList": this.filterExternalLayer
            });

            this.listenTo(Radio.channel("MapView"), {
                 "changedZoomLevel": this.setZoomLevel,
                 "changedCenter": this.setCenterCoords
            });

            this.listenTo(this, {
                "change:isCurrentWin": function () {
                    this.setZoomLevel(Radio.request("MapView", "getZoomLevel"));
                    this.setCenterCoords(Radio.request("MapView", "getCenter"));
                    this.filterExternalLayer(Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, type: "layer"}));
                },
                "change:zoomLevel change:centerCoords": this.setUrl,
                "change:url": this.setSimpleMapUrl
            });

            if (_.has(Config, "simpleMap")) {
                this.setSimpleMap(Config.simpleMap);
            }
        },

        /**
         * [checkStatus description]
         * @param  {[type]} args [description]
         * @return {[type]}      [description]
         */
        checkStatus: function (args) {
            if (args[2].getId() === "saveSelection") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },

        /**
         * externe Layer werden rausgefiltert
         * @param  {[type]} layerList [description]
         */
        filterExternalLayer: function (layerList) {
            var filteredLayerList = _.filter(layerList, function (model) {
                return !model.get("isExternal");
            });

            filteredLayerList = _.sortBy(filteredLayerList, function (model) {
                return model.getSelectionIDX();
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

            _.each(this.getLayerList(), function (model) {
                layerVisibilities.push(model.getIsVisibleInMap());
                layerTrancparence.push(model.getTransparency());
            });
            this.setLayerIdList(_.pluck(this.getLayerList(), "id"));
            this.setLayerTransparencyList(layerTrancparence);
            this.setLayerVisibilityList(layerVisibilities);
            this.setUrl();
        },

        /**
         * [setLayerList description]
         * @param {[type]} value [description]
         */
        setLayerList: function (value) {
            this.set("layerList", value);
        },

        /**
         * [setZoomLevel description]
         * @param {[type]} zoomLevel [description]
         */
        setZoomLevel: function (zoomLevel) {
            this.set("zoomLevel", zoomLevel);
        },

        /**
         * [setCenterCoords description]
         * @param {[type]} coords [description]
         */
        setCenterCoords: function (coords) {
            this.set("centerCoords", coords);
        },

        /**
         * [setLayerIdList description]
         * @param {[type]} list [description]
         */
        setLayerIdList: function (list) {
            this.set("layerIdList", list);
        },

        /**
         * [setLayerVisibilityList description]
         * @param {[type]} list [description]
         */
        setLayerVisibilityList: function (list) {
            this.set("layerVisibilityList", list);
        },

        /**
         * [setLayerTransparencyList description]
         * @param {[type]} list [description]
         */
        setLayerTransparencyList: function (list) {
            this.set("layerTransparencyList", list);
        },

        /**
         * [setUrl description]
         */
        setUrl: function () {
            this.set("url", location.origin + location.pathname + "?layerIDs=" + this.getLayerIdList() + "&visibility=" + this.getLayerVisibilityList() + "&transparency=" + this.getLayertransparencyList() + "&center=" + this.getCenterCoords() + "&zoomlevel=" + this.getZoomLevel());
        },

        /**
         * [setSimpleMapUrl description]
         * @param {[type]} model [description]
         * @param {[type]} value [description]
         */
        setSimpleMapUrl: function (model, value) {
            this.set("simpleMapUrl", value + "&style=simple");
        },

        /**
         * [getLayerList description]
         * @return {[type]} [description]
         */
        getLayerList: function () {
            return this.get("layerList");
        },

        /**
         * [getZoomLevel description]
         * @return {[type]} [description]
         */
        getZoomLevel: function () {
            return this.get("zoomLevel");
        },

        /**
         * [getCenterCoords description]
         * @return {[type]} [description]
         */
        getCenterCoords: function () {
            return this.get("centerCoords");
        },

        /**
         * [getLayerIdList description]
         * @return {[type]} [description]
         */
        getLayerIdList: function () {
            return this.get("layerIdList");
        },

        /**
         * [getLayerVisibilityList description]
         * @return {[type]} [description]
         */
        getLayerVisibilityList: function () {
            return this.get("layerVisibilityList");
        },

        /**
         * [getLayertransparencyList description]
         * @return {[type]} [description]
         */
        getLayertransparencyList: function () {
            return this.get("layerTransparencyList");
        },

        setSimpleMap: function (value) {
            this.set("simpleMap", value);
        },
        getSimpleMap: function () {
            return this.get("simpleMap");
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
