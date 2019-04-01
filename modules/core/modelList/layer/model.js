import Item from ".././item";

const Layer = Item.extend(
    /** @lends Layer.prototype */
    {
        defaults: {
            channel: Radio.channel("Layer"),
            isVisibleInMap: false,
            isSelected: false,
            isSettingVisible: false,
            transparency: 0,
            selectionIDX: 0,
            layerInfoClicked: false,
            minScale: "0",
            maxScale: "1000000",
            legendURL: "",
            supported: ["2D"],
            showSettings: true,
            hitTolerance: 0,
            styleable: false,
            isNeverVisibleInTree: false,
            isRemovable: false
        },
        /**
         * @class Layer
         * @abstract
         * @description Module to represent any layer
         * @extends Item
         * @memberOf Core.ModelList.Layer
         * @constructs
         * @property {Radio.channel} channel=Radio.channel("Layer") Radio channel of layer
         * @property {Boolean} isVisibleInMap=false Flag if layer is visible in map
         * @property {Boolean} isSelected=false Flag if model is selected in layer tree
         * @property {Boolean} isSettingVisible=false Flag if settings (transparency,...) are visible in tree
         * @property {Number} transparency=0 Transparency in percent
         * @property {Number} selectionIDX=0 Index of rendering order in layer selection
         * @property {Boolean} layerInfoClicked=false Flag if layerInfo was clicked
         * @property {String} minScale="0" Minimum scale for layer to be displayed
         * @property {String} maxScale="1000000" Maximum scale for layer to be displayed
         * @property {String} legendURL="" LegendURL to request legend from
         * @property {String[]} supported=["2D"] Array of Strings to show supported modes "2D" and "3D"
         * @property {Boolean} showSettings=true Flag if layer settings have to be shown
         * @property {Number} hitTolerance=0 Hit tolerance used by layer for map interaction
         * @property {Boolean} styleable=false Flag if wms layer can be styleable via stylewms tool
         * @property {Boolean} isNeverVisibleInTree=false Flag if layer is never visible in layertree
         * @fires Map#RadioTriggerMapAddLayerToIndex
         * @fires Layer#RadioTriggerLayerFeaturesLoaded
         * @fires MapView#RadioRequestMapViewGetResoByScale
         * @fires LayerInformation#RadioTriggerLayerInformationAdd
         * @listens Layer#changeIsSelected
         * @listens Layer#changeIsVisibleInMap
         * @listens Layer#changeTransparency
         * @listens Layer#RadioTriggerLayerUpdateLayerInfo
         * @listens Layer#RadioTriggerLayerSetLayerInfoChecked
         * @listens Map#RadioTriggerMapChange
         * @listens MapView#RadioTriggerMapViewChangedOptions
         */
        initialize: function () {
            this.registerInteractionTreeListeners(this.get("channel"));
            this.registerInteractionMapViewListeners();

            //  add layer, when it should be initially visible
            //  in lighttree add also non selected, because all Layer need to have an selectionIDX. Needed for changing layer orders
            if (this.get("isSelected") === true || Radio.request("Parser", "getTreeType") === "light") {
                if (_.isUndefined(Radio.request("ParametricURL", "getLayerParams")) === false) {
                    this.collection.appendToSelectionIDX(this);
                }
                else {
                    this.collection.insertIntoSelectionIDX(this);
                }
                this.prepareLayerObject();
                Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), this.get("selectionIDX")]);
                this.setIsVisibleInMap(this.get("isSelected"));
                this.setIsRemovable(Radio.request("Parser", "getPortalConfig").layersRemovable);
                this.toggleWindowsInterval();
            }
        },

        /**
         * Triggers event if vector features are loaded
         * @param {ol.Feature[]} features Loaded vector features
         * @fires Layer#event:RadioTriggerLayerFeaturesLoaded
         * @return {void}
         */
        featuresLoaded: function (features) {
            this.get("channel").trigger("featuresLoaded", this.get("id"), features);
        },

        /**
         * Process function. Calls smaller function to prepare and create layer object
         * @returns {void}
         */
        prepareLayerObject: function () {
            this.createLayerSource();
            this.createLayer();
            this.updateLayerTransparency();
            this.getResolutions();
            this.createLegendURL();
            this.checkForScale(Radio.request("MapView", "getOptions"));
        },

        /**
         * Register interaction with layer tree.<br>
         * @listens Layer#event:changeIsSelected
         * @listens Layer#event:changeIsVisibleInMap
         * @listens Layer#event:changeTransparency
         * @listens Layer#event:RadioTriggerLayerUpdateLayerInfo
         * @listens Layer#event:RadioTriggerLayerSetLayerInfoChecked
         * @listens Map#event:RadioTriggerMapChange
         * @param {Radio.channel} channel Radio channel of this module
         * @return {void}
         */
        registerInteractionTreeListeners: function (channel) {
            // on treetype: "light" all layers are loaded initially
            if (Radio.request("Parser", "getTreeType") !== "light") {
                this.listenToOnce(this, {
                    // LayerSource is created on first select
                    "change:isSelected": function () {
                        if (_.isUndefined(this.get("layerSource"))) {
                            this.prepareLayerObject();
                        }
                    }
                });
            }

            this.listenTo(channel, {
                "updateLayerInfo": function (name) {
                    if (this.get("name") === name && this.get("layerInfoChecked") === true) {
                        this.showLayerInformation();
                    }
                },
                "setLayerInfoChecked": function (layerInfoChecked) {
                    this.setLayerInfoChecked(layerInfoChecked);
                }
            });
            this.listenTo(Radio.channel("Map"), {
                "change": function (mode) {
                    if (this.get("supported").indexOf(mode) >= 0) {
                        if (this.get("isVisibleInMap")) {
                            this.get("layer").setVisible(true);
                        }
                    }
                    else if (this.get("layer") !== undefined) {
                        this.get("layer").setVisible(false);
                    }
                }
            });
            this.listenTo(this, {
                "change:isVisibleInMap": function () {
                    // triggert das Ein- und Ausschalten von Layern
                    Radio.trigger("ClickCounter", "layerVisibleChanged");
                    Radio.trigger("Layer", "layerVisibleChanged", this.get("id"), this.get("isVisibleInMap"));
                    this.toggleLayerOnMap();
                    this.toggleWindowsInterval();
                    this.toggleAttributionsInterval();
                },
                "change:transparency": this.updateLayerTransparency
            });
        },

        /**
         * Register interaction with map view.
         * @listens MapView#event:RadioTriggerMapViewChangedOptions
         * @returns {void}
         */
        registerInteractionMapViewListeners: function () {
            // Dieser Listener um eine Veränderung des angezeigten Maßstabs
            this.listenTo(Radio.channel("MapView"), {
                "changedOptions": function (options) {
                    this.checkForScale(options);
                }
            });
        },

        /**
         * Setter of window interval. Binds this to func.
         * @param {function} func Function, to be executed in this
         * @param {integer} autorefreshInterval Intervall in ms
         * @returns {void}
         */
        setWindowsInterval: function (func, autorefreshInterval) {
            this.set("windowsInterval", setInterval(func.bind(this), autorefreshInterval));
        },

        /**
         * Callback for layer interval
         * @returns {void}
         */
        intervalHandler: function () {
            this.updateSource();
        },


        /**
         * Sets visible min and max resolution on layer.
         * @fires MapView#event:RadioRequestMapViewGetResoByScale
         * @returns {void}
         */
        getResolutions: function () {
            var resoByMaxScale = Radio.request("MapView", "getResoByScale", this.get("maxScale"), "max"),
                resoByMinScale = Radio.request("MapView", "getResoByScale", this.get("minScale"), "min");

            this.setMaxResolution(resoByMaxScale + (resoByMaxScale / 100));
            this.setMinResolution(resoByMinScale);
        },

        /**
         * Increases layer transparency by 10 percent
         * @return {void}
         */
        incTransparency: function () {
            if (this.get("transparency") <= 90) {
                this.setTransparency(this.get("transparency") + 10);
            }
        },

        /**
         * Decreases layer transparency by 10 percent
         * @return {void}
         */
        decTransparency: function () {
            if (this.get("transparency") >= 10) {
                this.setTransparency(this.get("transparency") - 10);
            }
        },

        /**
         * Toggles the attribute isSelected
         * @return {void}
         */
        toggleIsSelected: function () {
            if (this.get("isSelected") === true) {
                this.setIsSelected(false);
            }
            else {
                this.setIsSelected(true);
            }
        },

        /**
         * Toggles the attribute isVisibleInMap
         * @return {void}
         */
        toggleIsVisibleInMap: function () {
            if (this.get("isVisibleInMap") === true) {
                this.setIsVisibleInMap(false);
            }
            else {
                this.setIsVisibleInMap(true);
            }
        },

        /**
         * Toggles the layer interval based on attribute isVisibleInMap
         * The autoRefresh interval has to be >500 , because of performance issues
         * @returns {void}
         */
        toggleWindowsInterval: function () {
            var isVisible = this.get("isVisibleInMap"),
                autoRefresh = this.get("autoRefresh");

            if (isVisible === true) {
                if (autoRefresh > 500) {
                    this.setWindowsInterval(this.intervalHandler, autoRefresh);
                }
            }
            else if (!_.isUndefined(this.get("windowsInterval"))) {
                clearInterval(this.get("windowsInterval"));
            }
        },
        /**
         * Toggles the attribute isSettingVisible
         * @return {void}
         */
        toggleIsSettingVisible: function () {
            if (this.get("isSettingVisible") === true) {
                this.setIsSettingVisible(false);
            }
            else {
                // setzt vorher alle Models auf false, damit immer nur eins angezeigt wird
                this.collection.setIsSettingVisible(false);
                this.setIsSettingVisible(true);
            }
        },
        /**
         * Adds or removes layer from map, depending on attribte isSelected
         * @returns {void}
         */
        toggleLayerOnMap: function () {
            if (Radio.request("Parser", "getTreeType") !== "light") {
                if (this.get("isSelected") === true) {
                    Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), this.get("selectionIDX")]);
                }
                else {
                    // model.collection besser?!
                    Radio.trigger("Map", "removeLayer", this.get("layer"));
                }
            }
        },

        /**
         * If attribution is defined as an object, then the attribution are requested in given intervals, as long as "isVisibleInMap" is true
         * Is used for Verkehrslage auf den Autobahnen
         * @returns {void}
         */
        toggleAttributionsInterval: function () {
            var channelName, eventName, timeout;
            if (this.has("layerAttribution") && _.isObject(this.get("layerAttribution"))) {
                channelName = this.get("layerAttribution").channel;
                eventName = this.get("layerAttribution").eventname;
                timeout = this.get("layerAttribution").timeout;

                if (this.get("isVisibleInMap") === true) {

                    Radio.trigger(channelName, eventName, this);
                    this.get("layerAttribution").interval = setInterval(function (model) {
                        Radio.trigger(channelName, eventName, model);
                    }, timeout, this);
                }
                else {
                    clearInterval(this.get("layerAttribution").interval);
                }
            }
        },

        /**
         * Transforms transparency into opacity and sets opacity on layer
         * @return {void}
         */
        updateLayerTransparency: function () {
            var opacity = (100 - this.get("transparency")) / 100;

            // Auch wenn die Layer im simple Tree noch nicht selected wurde können
            // die Settings angezeigt werden. Das Layer objekt wurden dann jedoch noch nicht erzeugt und ist undefined
            if (!_.isUndefined(this.get("layer"))) {
                this.get("layer").setOpacity(opacity);
            }
        },
        /**
         * Initiates the presentation of layer information.
         * @fires LayerInformation#event:RadioTriggerLayerInformationAdd
         * @returns {void}
         */
        showLayerInformation: function () {
            var metaID = [],
                legend = Radio.request("Legend", "getLegend", this),
                name = this.get("name"),
                layerMetaId = this.get("datasets") && this.get("datasets")[0] ? this.get("datasets")[0].md_id : null;

            metaID.push(layerMetaId);

            Radio.trigger("LayerInformation", "add", {
                "id": this.get("id"),
                "legend": legend,
                "metaID": metaID,
                "layername": name,
                "url": this.get("url"),
                "typ": this.get("typ")
            });

            this.setLayerInfoChecked(true);
        },

        /**
         * Calls Collection function moveModelDown
         * @return {void}
         */
        moveDown: function () {
            this.collection.moveModelDown(this);
        },

        /**
         * Calls Collection function moveModelUp
         * @return {void}
         */
        moveUp: function () {
            this.collection.moveModelUp(this);
        },

        /**
         * Setter for selectionIDX
         * @param {String} value SelectionIDX
         * @returns {void}
         */
        setSelectionIDX: function (value) {
            this.set("selectionIDX", value);
        },

        /**
         * Setter for layerInfoChecked
         * @param {Boolean} value Flag if layerInfo was checked
         * @returns {void}
         */
        setLayerInfoChecked: function (value) {
            this.set("layerInfoChecked", value);
        },

        /**
         * Setter for layerSource
         * @param {ol/source} value LayerSource
         * @returns {void}
         */
        setLayerSource: function (value) {
            this.set("layerSource", value);
        },

        /**
         * Setter for layer
         * @param {ol/layer} value Layer
         * @returns {void}
         */
        setLayer: function (value) {
            this.set("layer", value);
        },

        /**
         * Setter for isVisibleInMap and setter for layer.setVisible
         * @param {Boolean} value Flag if layer is visible in map
         * @returns {void}
         */
        setIsVisibleInMap: function (value) {
            this.set("isVisibleInMap", value);
            this.get("layer").setVisible(value);
        },

        /**
         * Setter for isSelected
         * @param {Boolean} value Flag if layer is selected
         * @returns {void}
         */
        setIsSelected: function (value) {
            this.set("isSelected", value);
        },

        /**
         * Setter for isSettingVisible
         * @param {Boolean} value Flag if layer settings are visible
         * @returns {void}
         */
        setIsSettingVisible: function (value) {
            this.set("isSettingVisible", value);
        },

        /**
         * Setter for transparency
         * @param {Number} value Tranparency in percent
         * @returns {void}
         */
        setTransparency: function (value) {
            this.set("transparency", value);
        },

        /**
         * Setter for isOutOfRange
         * @param {Boolean} value Flag if map Scale is out of defined layer minScale and maxScale
         * @returns {void}
         */
        setIsOutOfRange: function (value) {
            this.set("isOutOfRange", value);
        },

        /**
         * Setter for ol/layer.setMaxResolution
         * @param {Number} value Maximum resolution of layer
         * @returns {void}
         */
        setMaxResolution: function (value) {
            this.get("layer").setMaxResolution(value);
        },

        /**
         * Setter for ol/layer.setMinResolution
         * @param {Number} value Minimum resolution of layer
         * @returns {void}
         */
        setMinResolution: function (value) {
            this.get("layer").setMinResolution(value);
        },

        /**
         * Setter for name
         * @param {String} value Name of layer
         * @returns {void}
         */
        setName: function (value) {
            this.set("name", value);
        },

        /**
         * Setter for legendURL
         * @param {String} value legendURL
         * @returns {void}
         */
        setLegendURL: function (value) {
            this.set("legendURL", value);
        },

        /**
         * Setter for isVisibleInTree
         * @param {Boolean} value Flag if layer is visible in tree
         * @returns {void}
         */
        setIsVisibleInTree: function (value) {
            this.set("isVisibleInTree", value);
        },

        /**
         * Setter for isRemovable
         * @param {Boolean} value Flag if layer is removable from the tree
         * @returns {void}
         */
        setIsRemovable: function (value) {
            if (value !== undefined && value !== null && value !== "string") {
                this.set("isRemovable", value);
            }
        },

        /**
         * Setter for isJustAdded (currently only used in uiStyle = table)
         * @param {Boolean} value Flag if layer has just been added to the tree
         * @returns {void}
         */
        setIsJustAdded: function (value) {
            this.set("isJustAdded", value);
        },

        /**
         * Removes the layer from the map and the collection
         * @returns {void}
         */
        removeLayer: function () {
            var layer = this.get("id");

            this.setIsVisibleInMap(false);
            this.collection.removeLayerById(layer);
        }
    });

export default Layer;
