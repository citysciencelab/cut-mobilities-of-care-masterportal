/**
 * @namespace ModelList/Item/Layer
 * @description Module to represent any layer
 */
/**
 * @memberof ModelList/Item/Layer
 * @event RadioChannel("Layer")#"updateLayerInfo"
 */
/**
 * @memberof ModelList/Item/Layer
 * @event RadioChannel("Layer")#"setLayerInfoChecked"
 */
import Item from ".././item";

const Layer = Item.extend({
    defaults: {
        /**
         * @memberof ModelList/Item/Layer
         * @default Radio.channel("Layer")
         * @type {Radio.channel}
         */
        channel: Radio.channel("Layer"),
        /**
         * Flag if layer is visible in map
         * @memberof ModelList/Item/Layer
         * @default false
         * @type {Boolean}
         */
        isVisibleInMap: false,
        /**
         * Flag if Model in selected in layer tree
         * @memberof ModelList/Item/Layer
         * @default false
         * @type {Boolean}
         */
        isSelected: false,
        /**
         * Flag if settings (transparency,...) are visible in tree
         * @memberof ModelList/Item/Layer
         * @default false
         * @type {Boolean}
         */
        isSettingVisible: false,
        /**
         * Transparency in percent
         * @memberof ModelList/Item/Layer
         * @default 0
         * @type {Number}
         */
        transparency: 0,
        /**
         * Index of rendering order in layer selection
         * @memberof ModelList/Item/Layer
         * @default 0
         * @type {Number}
         */
        selectionIDX: 0,
        /**
         * Flag if layerInfo was clicked
         * @memberof ModelList/Item/Layer
         * @default false
         * @type {Boolean}
         */
        layerInfoClicked: false,
        /**
         * Minimum scale for layer to be displayed
         * @memberof ModelList/Item/Layer
         * @default "0"
         * @type {String}
         */
        minScale: "0",
        /**
         * Maximum scale for layer to be displayed
         * @memberof ModelList/Item/Layer
         * @default "1000000"
         * @type {String}
         */
        maxScale: "1000000",
        /**
         * LegendURL to request legend from
         * @memberof ModelList/Item/Layer
         * @default ""
         * @type {String}
         */
        legendURL: "",
        /**
         * Array of Strings to show supported modes "2D" and "3D"
         * @memberof ModelList/Item/Layer
         * @default ["2D"]
         * @type {Array}
         */
        supported: ["2D"],
        /**
         * Flag if layer settings have to be shown
         * @memberof ModelList/Item/Layer
         * @default true
         * @type {Boolean}
         */
        showSettings: true,
        /**
         * Hit tolerance used by layer for map interaction
         * @memberof ModelList/Item/Layer
         * @default 0
         * @type {Number}
         */
        hitTolerance: 0,
        /**
         * Flag if wms layer can be styleable via stylewms tool
         * @memberof ModelList/Item/Layer
         * @default false
         * @type {Boolean}
         */
        styleable: false,
        /**
         * Flag if layer is never visible in layertree
         * @memberof ModelList/Item/Layer
         * @default false
         * @type {Boolean}
         */
        isNeverVisibleInTree: false
    },
    /**
     * Initialize function for Layer
     * @memberof ModelList/Item/Layer
     * @fires Radio.trigger("Map","addLayerToIndex")
     * @return {void}
     */
    initialize: function () {
        this.registerInteractionTreeListeners(this.get("channel"));
        this.registerInteractionMapViewListeners();

        //  Ol Layer anhängen, wenn die Layer initial Sichtbar sein soll
        //  Im Lighttree auch nicht selektierte, da dort alle Layer von anfang an einen
        //  selectionIDX benötigen, um verschoben werden zu können
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
            this.toggleWindowsInterval();
        }
    },

    /**
     * Triggers event if vector features are loaded
     * @memberof ModelList/Item/Layer
     * @fires Radio.trigger("Layer","featuresLoaded")
     * @param  {ol.Feature[]} features Loaded vector features
     * @return {void}
     */
    featuresLoaded: function (features) {
        this.get("channel").trigger("featuresLoaded", this.get("id"), features);
    },

    /**
     * Process function. Calls smaller function to prepare and create layer object
     * @memberof ModelList/Item/Layer
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
     * Register interaction with layer tree
     * @memberof ModelList/Item/Layer
     * @param {Radio.channel} channel Kanal dieses Moduls
     * @listens this, "change:isSelected"
     * @listens this, "change:isVisibleInMap"
     * @listens this, "change:transparency"
     * @listens Radio.channel("Layer", "updateLayerInfo")
     * @listens Radio.channel("Layer", "setLayerInfoChecked")
     * @listens Radio.channel("Map", "change")
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
     * Register interaction with map view
     * @memberof ModelList/Item/Layer
     * @listens Radio.channel("MapView", "changedOptions")
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
     * @memberof ModelList/Item/Layer
     * @param {function} func Function, to be executed in this
     * @param {integer}  autorefreshInterval Intervall in ms
     * @returns {void}
     */
    setWindowsInterval: function (func, autorefreshInterval) {
        this.set("windowsInterval", setInterval(func.bind(this), autorefreshInterval));
    },

    /**
     * Callback for layer interval
     * @memberof ModelList/Item/Layer
     * @returns {void}
     */
    intervalHandler: function () {
        this.updateSource();
    },


    /**
     * Sets visible min and max resolution on layer
     * @memberof ModelList/Item/Layer
     * @fires Radio.request("MapView", "getResoByScale")
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
     * @memberof ModelList/Item/Layer
     * @return {void}
     */
    incTransparency: function () {
        if (this.get("transparency") <= 90) {
            this.setTransparency(this.get("transparency") + 10);
        }
    },

    /**
     * Decreases layer transparency by 10 percent
     * @memberof ModelList/Item/Layer
     * @return {void}
     */
    decTransparency: function () {
        if (this.get("transparency") >= 10) {
            this.setTransparency(this.get("transparency") - 10);
        }
    },

    /**
     * Toggles the attribute isSelected
     * @memberof ModelList/Item/Layer
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
     * @memberof ModelList/Item/Layer
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
     * @memberof ModelList/Item/Layer
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
     * @memberof ModelList/Item/Layer
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
     * @memberof ModelList/Item/Layer
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
     * @memberof ModelList/Item/Layer
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
     * @memberof ModelList/Item/Layer
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
     * Initiates the presentation of layer information
     * @memberof ModelList/Item/Layer
     * @fires Radio.trigger("LayerInformation", "add")
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
    setSelectionIDX: function (idx) {
        this.set("selectionIDX", idx);
    },

    moveDown: function () {
        this.collection.moveModelDown(this);
    },
    moveUp: function () {
        this.collection.moveModelUp(this);
    },
    setLayerInfoChecked: function (value) {
        this.set("layerInfoChecked", value);
    },
    setLayerSource: function (value) {
        this.set("layerSource", value);
    },

    setLayer: function (value) {
        this.set("layer", value);
    },

    setIsVisibleInMap: function (value) {
        this.set("isVisibleInMap", value);
        this.get("layer").setVisible(value);
    },

    setIsSelected: function (value) {
        this.set("isSelected", value);
    },

    setIsSettingVisible: function (value) {
        this.set("isSettingVisible", value);
    },

    setTransparency: function (value) {
        this.set("transparency", value);
    },

    setIsOutOfRange: function (value) {
        this.set("isOutOfRange", value);
    },

    setMaxResolution: function (value) {
        this.get("layer").setMaxResolution(value);
    },

    setMinResolution: function (value) {
        this.get("layer").setMinResolution(value);
    },

    setName: function (value) {
        this.set("name", value);
    },

    setLegendURL: function (value) {
        this.set("legendURL", value);
    },

    setIsVisibleInTree: function (value) {
        this.set("isVisibleInTree", value);
    }

});

export default Layer;
