import Overlay from "ol/Overlay.js";

const MouseHoverPopup = Backbone.Model.extend({
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

    initialize: function () {
        var channel = Radio.channel("MouseHover");

        this.listenTo(channel, {
            "hide": this.destroyPopup
        });
        Radio.trigger("Map", "addOverlay", this.get("overlay"));
        Radio.trigger("Map", "registerListener", "pointermove", this.checkDragging.bind(this), this);
        this.getMouseHoverInfosFromConfig();
    },

    getMouseHoverInfosFromConfig: function () {
        var wfsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS"}),
            geoJsonLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON"}),
            sensorThingsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "SensorThings"}),
            vectorLayers = _.union(wfsLayers, geoJsonLayers, sensorThingsLayers),
            mouseHoverLayers = _.filter(vectorLayers, function (layer) {
                return _.has(layer, "mouseHoverField") && layer.mouseHoverField !== "";
            }),
            mouseHoverInfos = _.map(mouseHoverLayers, function (layer) {
                return _.pick(layer, "id", "mouseHoverField");
            });

        this.setMouseHoverInfos(mouseHoverInfos);
    },

    // Vernichtet das Popup.
    destroyPopup: function () {
        this.setTextArray(null);
        this.setTextPosition(null);
        this.setOverlayPosition(undefined);
    },

    showPopup: function () {
        this.trigger("render", this.get("textArray"));
    },

    /**
     * sets the position for the overlay
     * @param {ol.Coordinate | undefined} value - if the value is undefined the overlay is hidden
     * @returns {void}
     */
    setOverlayPosition: function (value) {
        this.get("overlay").setPosition(value);
    },

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

    isClusterFeature: function (feature) {
        if (feature.getProperties().features) {
            return true;
        }
        return false;
    },

    fillFeatureArray: function (featureAtPixel) {
        var pFeatureArray = [],
            selFeature,
            list;

        // featuresAtPixel.layer !== null --> kleiner schneller Hack da sonst beim zeichnen die ganze Zeit versucht wird ein Popup zu zeigen?? SD 01.09.2015
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
     * Prüft auf Drag-Modus
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
     * Prüft, welche Features an MousePosition vorhanden sind
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
     * Prüft anhand der neu darzustellenden Features welche Aktion mit dem MouseHover geschehen soll
     * @param  {Array} featuresArray Array der darzustellenden Features
     * @param {evt} evt Event-Object
     * @returns {void}
     */
    checkAction: function (featuresArray, evt) {
        var textArray;

        // keine Features an MousePosition
        if (featuresArray.length === 0) {
            this.destroyPopup();
            return;
        }
        textArray = this.checkTextArray(featuresArray);

        // keine darzustellenden Texte an MousePosition
        if (textArray.length === 0) {
            this.destroyPopup();
            return;
        }

        // Neupositionierung
        this.setOverlayPosition(evt.coordinate);
        // Änderung des Textes
        if (!this.isTextEqual(textArray, this.get("textArray"))) {
            this.setTextArray(textArray);
            this.showPopup();
        }
    },

    /**
     * Prüft ob die beiden Arrays identisch sind
     * @param  {Array}  array1 neue Texte
     * @param  {Array}  array2 alte Texte
     * @return {Boolean}        Ergebnis der Prüfung
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
     * Prüft ob sich MousePosition signifikant entsprechend Config verschoben hat
     * @param  {evt} evt MouseHove
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
     * Dies Funktion durchsucht das übergebene pFeatureArray und extrahiert den anzuzeigenden Text
     * @param  {Array} featureArray Features at MousePosition
     * @returns {string} darszustellender String
     */
    checkTextArray: function (featureArray) {
        var mouseHoverInfos = this.get("mouseHoverInfos"),
            textArray = [],
            textArrayCheckedLength,
            textArrayBreaked;

        // für jedes gehoverte Feature...
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
     * Passt die Anzahl der darzustellenden Texte an "numFeaturesToShow" über _.sample an.
     * @param  {Array} textArray Array mit allen Texten
     * @return {Array}           Array mit korrekter Anzahl an Texten
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
     * @param  {Array} textArray Array ohne <br>
     * @return {Array}           Array mit <br>
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

    // setter for minShift
    setMinShift: function (value) {
        this.set("minShift", value);
    },

    // setter for textPosition
    setTextPosition: function (value) {
        this.set("textPosition", value);
    },

    // setter for textArray
    setTextArray: function (value) {
        this.set("textArray", value);
    },

    // setter for mouseHoverInfos
    setMouseHoverInfos: function (value) {
        this.set("mouseHoverInfos", value);
    }
});

export default MouseHoverPopup;
