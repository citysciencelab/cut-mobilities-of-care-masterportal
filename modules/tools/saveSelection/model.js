define(function (require) {

    var Tool = require("modules/core/modelList/tool/model"),
        SaveSelection;

    SaveSelection = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            zoomLevel: "",
            centerCoords: [],
            layerIDList: [],
            layerVisibilityList: [],
            layerTransparencyList: [],
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

            this.listenTo(Radio.channel("Map"), {
                "change": this.setMapMode,
                "cameraChanged": this.setCameraParameter
            });

            this.listenTo(this, {
                "change:isActive": function (model, value) {
                    if (value) {
                        this.setZoomLevel(Radio.request("MapView", "getZoomLevel"));
                        this.setCenterCoords(Radio.request("MapView", "getCenter"));
                        this.setMapMode(Radio.request("Map", "getMapMode"));
                        this.filterExternalLayer(Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, type: "layer"}));
                    }
                },
                "change:zoomLevel change:centerCoords change:mapMode change:cameraParameter": this.setUrl,
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

        /**
         * [setMapMode description]
         * @param {[type]} mode [description]
         * @returns {void}
         */
        setMapMode: function (mode) {
            this.set("mapMode", mode);
        },
        /**
         * [setCamera description]
         * @param {[type]} cameraParameter [description]
         * @returns {void}
         */
        setCameraParameter: function (cameraParameter) {
            this.set("cameraParameter", cameraParameter);
        },


        setUrl: function () {
            var url = location.origin + location.pathname;

            url += "?layerIDs=" + this.get("layerIdList");
            url += "&visibility=" + this.get("layerVisibilityList");
            url += "&transparency=" + this.get("layerTransparencyList");
            url += "&center=" + this.get("centerCoords");
            url += "&zoomlevel=" + this.get("zoomLevel");
            url += "&map=" + this.get("mapMode");
            if (this.get("mapMode") === "3D" && this.get("cameraParameter")) {
                url += "&heading=" + this.get("cameraParameter").heading;
                url += "&tilt=" + this.get("cameraParameter").tilt;
                url += "&altitude=" + this.get("cameraParameter").altitude;
            }
            this.set("url", url);
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
            this.setMapMode(Radio.request("Map", "getMapMode"));
            this.filterExternalLayer(Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, type: "layer"}));
            return this.get("url");
        }
    });
    return SaveSelection;
});
