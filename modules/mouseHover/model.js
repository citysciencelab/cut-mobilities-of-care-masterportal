import Overlay from "ol/Overlay.js";

const MouseHoverPopup = Backbone.Model.extend(/** @lends MouseHoverPopup.prototype */{
    defaults: {
        overlay: new Overlay({
            id: "mousehover-overlay"
        }),
        textPosition: null,
        textArray: null,
        minShift: 5,
        numFeaturesToShow: 2,
        infoText: "(weitere Objekte. Bitte zoomen.)"
    },

    /**
     * @class MouseHoverPopup
     * @extends Backbone.Model
     * @memberof mouseHover
     * @constructs
     * @property {Radio.channel} channel=Radio.channel("MouseHover") Radio channel for communication
     * @property {Object} overlay="new Overlay" New OpenLayers Overlay instance
     * @property {String} textPosition=null
     * @property {Array} textArray=null
     * @property {Number} minShift=5
     * @property {Number} numFeaturesToShow=2
     * @property {String} infoText="(weitere Objekte. Bitte zoomen.)"
     * @fires MouseHover#render
     * @fires Map#AddOverlay
     * @fires Map#RegisterListenerPointermove
     * @fires Parser#GetItemsByAttributes
     * @listens MouseHover#RadioTriggerMouseHover
     */

    initialize: function () {
        var channel = Radio.channel("MouseHover");

        this.listenTo(channel, {
            "hide": this.destroyPopup
        });
        Radio.trigger("Map", "addOverlay", this.get("overlay"));
        Radio.trigger("Map", "registerListener", "pointermove", this.checkDragging.bind(this), this);
        this.getMouseHoverInfosFromConfig();
    },
    /**
    * Gets MouseHoverInfos from config.
    * @fires  Parser#GetItemsByAttributes
    * @returns {void}
    */
    getMouseHoverInfosFromConfig: function () {
        var wfsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS"}),
            geoJsonLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON"}),
            sensorThingsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "SensorThings"}),
            vectorLayers = _.union(wfsLayers, geoJsonLayers, sensorThingsLayers),
            mouseHoverLayers = vectorLayers.filter(function (layer) {
                return _.has(layer, "mouseHoverField") && layer.mouseHoverField !== "";
            }),
            mouseHoverInfos = _.map(mouseHoverLayers, function (layer) {
                return _.pick(layer, "id", "mouseHoverField");
            });

        this.setMouseHoverInfos(mouseHoverInfos);
    },

    /**
     * Destroy the Popup.
     * @returns {void}
     */
    destroyPopup: function () {
        this.setTextArray(null);
        this.setTextPosition(null);
        this.setOverlayPosition(undefined);
    },
    /**
     * Shows the Popup.
     * @fires MouseHover#render
     * @returns {void}
     */
    showPopup: function () {
        this.trigger("render", this.get("textArray"));
    },

    /**
     * Sets the position of the overlay
     * @param {ol.Coordinate | undefined} value - if the value is undefined the overlay is hidden
     * @returns {void}
     */
    setOverlayPosition: function (value) {
        this.get("overlay").setPosition(value);
    },

    /**
     * Gets the features at the pixel
     * @param {evt} evt PointerMoveEvent
     * @param {Array} mouseHoverInfos Array of mouseHoverInfos
     * @returns {Array} features Array of features at the pixel
     */
    getFeaturesAtPixel: function (evt, mouseHoverInfos) {
        var features = [],
            layerIds = _.pluck(mouseHoverInfos, "id");

        evt.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            if (layer !== null && _.contains(layerIds, layer.get("id"))) {
                features.push({
                    feature: feature,
                    layer: layer
                });
            }

        });
        return features;
    },
    /**
     * Checks if the feature is a cluster feature
     * @param {Object} feature at pixel
     * @returns {Boolean} result of feature check
     */
    isClusterFeature: function (feature) {
        if (feature.getProperties().features) {
            return true;
        }
        return false;
    },
    /**
     * Create feature array
     * @param {Object} featureAtPixel feature at pixel
     * @returns {Array} pFeatureArray Array of features at pixel
     */
    fillFeatureArray: function (featureAtPixel) {
        var pFeatureArray = [],
            selFeature,
            list;

        // featuresAtPixel.layer !== null --> quick little hack to avoid showing the popup while drawing SD 01.09.2015
        if (!_.isUndefined(featureAtPixel) && featureAtPixel.layer !== null) {
            selFeature = featureAtPixel.feature;

            if (this.isClusterFeature(selFeature)) {
                list = selFeature.getProperties().features;

                _.each(list, function (element) {
                    pFeatureArray.push({
                        feature: element,
                        layerId: featureAtPixel.layer.get("id")
                    });
                });
            }
            else {
                pFeatureArray.push({
                    feature: selFeature,
                    layerId: featureAtPixel.layer.get("id")
                });
            }
        }
        return pFeatureArray;
    },

    /**
     * Checks Drag-Modus
     * @param  {evt} evt Event-Object
     * @listens "Map:pointermove"
     * @returns {void}
     */
    checkDragging: function (evt) {
        if (evt.dragging) {
            return;
        }
        this.checkTextPosition(evt);
    },

    /**
     * Checks the features at the mouse position
     * @param  {evt} evt PointerMoveEvent
     * @returns {void}
     */
    checkForFeaturesAtPixel: function (evt) {
        var featuresArray = [],
            featureArray = [],
            featuresAtPixel = this.getFeaturesAtPixel(evt, this.get("mouseHoverInfos"));

        _.each(featuresAtPixel, function (featureAtPixel) {
            featureArray = this.fillFeatureArray(featureAtPixel);
            featuresArray = _.union(featuresArray, featureArray);
        }, this);

        this.checkAction(featuresArray, evt);
    },

    /**
     * Checks which MouseHover action needs to happen depending on the features to show
     * @param  {Array} featuresArray Array of the features to show
     * @param {evt} evt Event-Object
     * @returns {void}
     */
    checkAction: function (featuresArray, evt) {
        var textArray;

        // no Features at MousePosition
        if (featuresArray.length === 0) {
            this.destroyPopup();
            return;
        }
        textArray = this.checkTextArray(featuresArray);

        // no text at MousePosition
        if (textArray.length === 0) {
            this.destroyPopup();
            return;
        }

        // New positioning
        this.setOverlayPosition(evt.coordinate);
        // changing the text
        if (!this.isTextEqual(textArray, this.get("textArray"))) {
            this.setTextArray(textArray);
            this.showPopup();
        }
    },

    /**
     * Checks if both arrays are identical
     * @param  {Array}  array1 new text
     * @param  {Array}  array2 old text
     * @return {Boolean}       result of the check
     */
    isTextEqual: function (array1, array2) {
        var diff1 = _.difference(array1, array2),
            diff2 = _.difference(array2, array1);

        if (diff1.length > 0 || diff2.length > 0) {
            return false;
        }
        return true;
    },

    /**
     * Checks if the mouse position significantly changed from Config value
     * @param  {evt} evt MouseHover
     * @returns {void}
     */
    checkTextPosition: function (evt) {
        var lastPixel = this.get("textPosition"),
            newPixel = evt.pixel,
            minShift = this.get("minShift");

        if (!lastPixel || newPixel[0] < lastPixel[0] - minShift || newPixel[0] > lastPixel[0] + minShift || newPixel[1] < lastPixel[1] - minShift || newPixel[1] > lastPixel[1] + minShift) {
            this.setTextPosition(evt.pixel);
            this.checkForFeaturesAtPixel(evt);
        }
    },

    /**
     * Return the string for the popup
     * @param  {String | Array} mouseHoverField Content for popup
     * @param  {Object} featureProperties       Properties of features
     * @returns {String}                        string of popup content
     */
    pickValue: function (mouseHoverField, featureProperties) {
        var value = "";

        if (mouseHoverField && _.isString(mouseHoverField)) {
            if (_.has(featureProperties, mouseHoverField)) {
                value = value + _.values(_.pick(featureProperties, mouseHoverField))[0];
            }
        }
        else if (mouseHoverField && _.isArray(mouseHoverField)) {
            _.each(mouseHoverField, function (element, index) {
                var cssClass = "";

                if (index === 0) {
                    cssClass = "title";
                }
                value = value + "<span class='" + cssClass + "'>" + _.values(_.pick(featureProperties, element)) + "</span></br>";
            });
        }
        return value;
    },

    /**
     * This function examines the pFeatureArray and extracts the text to show
     * @param  {Array} featureArray Features at MousePosition
     * @returns {string}            text to show
     */
    checkTextArray: function (featureArray) {
        var mouseHoverInfos = this.get("mouseHoverInfos"),
            textArray = [],
            textArrayCheckedLength,
            textArrayBreaked;

        // for each hovered over Feature...
        _.each(featureArray, function (element) {
            var featureProperties = element.feature.getProperties(),
                layerInfos = _.find(mouseHoverInfos, function (mouseHoverInfo) {
                    return mouseHoverInfo.id === element.layerId;
                });

            if (!_.isUndefined(layerInfos)) {
                textArray.push(this.pickValue(layerInfos.mouseHoverField, featureProperties));
            }
        }, this);
        textArrayCheckedLength = this.checkMaxFeaturesToShow(textArray);
        textArrayBreaked = this.addBreak(textArrayCheckedLength);

        return textArrayBreaked;
    },

    /**
     * Adapt the number of texts to show to "numFeaturesToShow" through _.sample
     * @param  {Array} textArray Array containing all texts
     * @return {Array}           Array containing correct number of texts
     */
    checkMaxFeaturesToShow: function (textArray) {
        var maxNum = this.get("numFeaturesToShow"),
            textArrayCorrected = [];

        if (textArray.length > maxNum) {
            textArrayCorrected = _.sample(textArray, maxNum);
            textArrayCorrected.push("<span class='info'>" + this.get("infoText") + "</span>");
        }
        else {
            textArrayCorrected = textArray;
        }

        return textArrayCorrected;
    },

    /**
     * add <br> betweeen every element in values
     * @param  {Array} textArray Array without <br>
     * @return {Array}           Array with <br>
     */
    addBreak: function (textArray) {
        var textArrayBreaked = [];

        _.each(textArray, function (value, index) {
            textArrayBreaked.push(value);
            if (index !== textArray.length - 1) {
                textArrayBreaked.push("<br>");
            }
        });

        return textArrayBreaked;
    },

    /**
     * setter for minShift
     * @param  {Number} value minShift value
     * @return {void}
     */
    setMinShift: function (value) {
        this.set("minShift", value);
    },

    /**
     * setter for textPosition
     * @param  {String} value textPosition value
     * @return {void}
     */
    setTextPosition: function (value) {
        this.set("textPosition", value);
    },

    /**
     * setter for textArray
     * @param  {String} value textArray value
     * @return {void}
     */
    setTextArray: function (value) {
        this.set("textArray", value);
    },

    /**
     * setter for mouseHoverInfos
     * @param  {String | Array} value mouseHoverInfos value
     * @return {void}
     */
    setMouseHoverInfos: function (value) {
        this.set("mouseHoverInfos", value);
    }
});

export default MouseHoverPopup;
