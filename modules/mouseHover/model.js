define(function (require) {
    var Config = require("config"),
        Backbone = require("backbone"),
        Radio = require ("backbone.radio"),
        MouseHoverPopup;

    MouseHoverPopup = Backbone.Model.extend({
        defaults: {
            textPosition: null,
            textArray: null,
            wfsList: [],
            minShift: Config.mouseHover.minShift ? Config.mouseHover.minShift : 5,
            numFeaturesToShow: Config.mouseHover.numFeaturesToShow ? Config.mouseHover.numFeaturesToShow : 2,
            infoText: Config.mouseHover.infoText ? Config.mouseHover.infoText : "(weitere Objekte. Bitte zoomen.)"
        },

        initialize: function () {
            var channel = Radio.channel("MouseHover");

            this.listenTo(channel, {
                "hide": this.destroyPopup
            });

            Radio.trigger("Map", "registerListener", "pointermove", this.checkDragging, this);
            this.getMouseHoverInfosFromConfig();
        },

        getMouseHoverInfosFromConfig: function () {
            var wfsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS"}),
                geoJsonLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON"}),
                vectorLayers = _.union(wfsLayers, geoJsonLayers),
                mouseHoverLayers = _.filter(vectorLayers, function (layer) {
                    return _.has(layer, "mouseHoverField") && layer.mouseHoverField !== "";
                }),
                mouseHoverInfos = _.map(mouseHoverLayers, function (layer) {
                    return _.pick(layer, "id", "mouseHoverField");
                });

            this.setMouseHoverInfos(mouseHoverInfos);
        },

        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            this.setTextArray(null);
            this.setTextPosition(null);
            this.trigger("destroy");
        },

        showPopup: function () {
            this.trigger("render", this.getTextArray(), this.getTextPosition());
        },

        movePopup: function () {
            this.trigger("move", this.getTextPosition());
        },

        getFeaturesAtPixel: function (evt) {
            var features = [];

            evt.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
                features.push({
                    feature: feature,
                    layer: layer
                });
            });
            return features;
        },

        isClusterFeature: function (feature) {
            var isClusterFeature = false;

            if (feature.getProperties().features) {
                isClusterFeature = true;
            }
            return isClusterFeature;
        },

        fillFeatureArray: function (featureAtPixel) {
            var pFeatureArray = [],
                selFeature,
                list

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
         */
        checkDragging: function (evt) {
            if (!evt.dragging) {
                this.checkTextPosition(evt);
            }
        },

        /**
         * Prüft, welche Features an MousePosition vorhanden sind
         * @param  {evt} evt PointerMoveEvent
         */
        checkForFeaturesAtPixel: function (evt) {
            var featuresArray = [],
                featureArray = [],
                featuresAtPixel = this.getFeaturesAtPixel(evt);

            _.each(featuresAtPixel, function (featureAtPixel) {
                featureArray = this.fillFeatureArray(featureAtPixel);
                featuresArray = _.union(featuresArray, featureArray);
            }, this);

            this.checkAction(featuresArray);
        },

        /**
         * Prüft anhand der neu darzustellenden Features welche Aktion mit dem MouseHover geschehen soll
         * @param  {Array} featuresArray Array der darzustellenden Features
         */
        checkAction: function (featuresArray) {
            var textArray;

            if (featuresArray.length > 0) {
                textArray = this.checkTextArray(featuresArray);

                if (this.isTextEqual(textArray, this.getTextArray())) {
                    this.movePopup();
                }
                else {
                    this.setTextArray(textArray);
                    this.showPopup();
                }
            }
            else {
                this.destroyPopup();
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
            else {
                return true;
            }
        },

        /**
         * Prüft ob sich MousePosition signifikant entsprechend Config verschoben hat
         * @param  {evt} evt MouseHove
         */
        checkTextPosition: function (evt) {
            var lastPosition = this.getTextPosition(),
                lastPixel = lastPosition ? Radio.request("Map", "getPixelFromCoordinate", lastPosition) : null,
                newPixel = evt.pixel,
                minShift = this.getMinShift();

            if (!lastPixel || newPixel[0] < (lastPixel[0] - minShift) || newPixel[0] > (lastPixel[0] + minShift) || newPixel[1] < (lastPixel[1] - minShift) || newPixel[1] > (lastPixel[1] + minShift)) {
                this.setTextPosition(evt.coordinate);
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
         * @param  {Array} pFeaturesArray Features at MousePosition
         */
        checkTextArray: function (featureArray) {
            var mouseHoverInfos = this.getMouseHoverInfos(),
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

        // getter for minShift
        getMinShift: function () {
            return this.get("minShift");
        },
        // setter for minShift
        setMinShift: function (value) {
            this.set("minShift", value);
        },

        // getter for textPosition
        getTextPosition: function () {
            return this.get("textPosition");
        },
        // setter for textPosition
        setTextPosition: function (value) {
            this.set("textPosition", value);
        },

        // getter for textArray
        getTextArray: function () {
            return this.get("textArray");
        },
        // setter for textArray
        setTextArray: function (value) {
            this.set("textArray", value);
        },

        // getter for mhpOverlay
        getMhpOverlay: function () {
            return this.get("mhpOverlay");
        },

        // setter for mhpOverlay
        setMhpOverlay: function (value) {
            this.set("mhpOverlay", value);
            Radio.trigger("Map", "addOverlay", value);
        },

        // getter for mouseHoverInfos
        getMouseHoverInfos: function () {
            return this.get("mouseHoverInfos");
        },
        // setter for mouseHoverInfos
        setMouseHoverInfos: function (value) {
            this.set("mouseHoverInfos", value);
        }
    });

    return MouseHoverPopup;
});
