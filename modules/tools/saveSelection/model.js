define([
    "backbone",
    "backbone.radio",
    "eventbus",
    "config"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        EventBus = require("eventbus"),
        Config = require("config"),
        SaveSelection;

    SaveSelection = Backbone.Model.extend({
        defaults: {
            zoomLevel: "",
            centerCoords: [],
            layerIDList: [],
            layerVisibilityList: [],
            url: "",
            simpleMap: false
        },
        initialize: function () {
            this.listenTo(Radio.channel("SelectedList"), {
                 "changedList": this.setLayerOptions
            });

            this.listenTo(Radio.channel("MapView"), {
                 "changedZoomLevel": this.setZoomLevel,
                 "changedCenter": this.setCenterCoords
            });

            this.listenTo(EventBus, {
                "winParams": this.setStatus
            });

            this.listenTo(this, {
                "change:layerVisibilityList": this.setUrl,
                "change:zoomLevel": this.setUrl,
                "change:centerCoords": this.setUrl,
                "change:url": this.setSimpleMapUrl
            });

            this.setZoomLevel(Radio.request("MapView", "getZoomLevel"));
            this.setCenterCoords(Radio.request("MapView", "getCenter"));
            if (_.has(Config, "simpleMap")) {
                this.setSimpleMap(Config.simpleMap);
            }
        },
        setStatus: function (args) {
            if (args[2] === "saveSelection") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },

        setZoomLevel: function (zoomLevel) {
            this.set("zoomLevel", zoomLevel);
        },
        getZoomLevel: function () {
            return this.get("zoomLevel");
        },
        setCenterCoords: function (coords) {
            this.set("centerCoords", coords);
        },
        getCenterCoords: function () {
            return this.get("centerCoords");
        },
        setLayerIdList: function (list) {
            this.set("layerIdList", list);
        },
        getLayerIdList: function () {
            return this.get("layerIdList");
        },
        setLayerVisibilityList: function (list) {
            this.set("layerVisibilityList", list);
        },
        getLayerVisibilityList: function () {
            return this.get("layerVisibilityList");
        },
        setUrl: function () {
            this.set("url", location.origin + location.pathname + "?layerIDs=" + this.getLayerIdList() + "&visibility=" + this.getLayerVisibilityList() + "&center=" + this.getCenterCoords() + "&zoomlevel=" + this.getZoomLevel());
        },
        setSimpleMapUrl: function (model, value) {
            this.set("simpleMapUrl", value + "&style=simple");
        },
        setLayerOptions: function (layerList) {
            var layerVisibilities = [];

            // externe Layer werden rausgefiltert
            layerList = _.filter(layerList, function (model) {
                return !model.get("isExternal");
            });

            this.setLayerIdList(_.pluck(layerList, "id"));

            _.each(layerList, function (model) {
                layerVisibilities.push(model.get("visibility"));
            });
            this.setLayerVisibilityList(layerVisibilities);
        },
        setSimpleMap: function (value) {
            return this.set("simpleMap", value);
        },
        getSimpleMap: function () {
            return this.get("simpleMap");
        }
    });

    return SaveSelection;
});
