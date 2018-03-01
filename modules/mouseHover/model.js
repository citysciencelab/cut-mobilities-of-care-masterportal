define(function (require) {
    require("bootstrap/popover");
    var Config = require("config"),
        Backbone = require("backbone"),
        Radio = require ("backbone.radio"),
        ol = require("openlayers"),
        MouseHoverPopup;

    MouseHoverPopup = Backbone.Model.extend({
        defaults: {
            wfsList: [],
            mhpresult: "",
            mhpcoordinates: [],
            oldSelection: [],
            GFIPopupVisibility: false,
            numFeaturesToShow: Config.mouseHover.numFeaturesToShow ? Config.mouseHover.numFeaturesToShow : 2,
            infoText: Config.mouseHover.infoText ? Config.mouseHover.infoText : "(weitere Objekte. Bitte zoomen.)"
        },
        initialize: function () {
            var channel = Radio.channel("MouseHover");

            this.listenTo(channel, {
                "hide": this.destroyPopup
            });

            Radio.trigger("Map", "registerListener", "pointermove", this.checkDragging, this);

            $("#map").append("<div id='mousehoverpopup' class='col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5'></div>");

            this.set("mhpOverlay", new ol.Overlay({
                element: $("#mousehoverpopup")[0]
            }));

            this.filterWFSList();
            this.set("element", this.get("mhpOverlay").getElement());
            Radio.trigger("Map", "addOverlay", this.get("mhpOverlay"));
        },
        filterWFSList: function () {
            var wfsList = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS"}),
                wfsListFiltered = [];

            _.each(wfsList, function (element) {
                if (_.has(element, "mouseHoverField")) {
                    wfsListFiltered.push({
                        layerId: element.id,
                        fieldname: element.mouseHoverField
                    });
                }
            });

            this.set("wfsList", wfsListFiltered);
        },

        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            this.set("oldSelection", "");
            this.unset("mhpresult", {silent: true});
            $(this.get("element")).tooltip("destroy");
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
            var pFeatureArray = [];

            // featuresAtPixel.layer !== null --> kleiner schneller Hack da sonst beim zeichnen die ganze Zeit versucht wird ein Popup zu zeigen?? SD 01.09.2015
            if (!_.isUndefined(featureAtPixel) && featureAtPixel.layer !== null) {
                var selFeature = featureAtPixel.feature;

                if (this.isClusterFeature(selFeature)) {
                    var list = selFeature.getProperties().features;

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
                this.checkForFeaturesAtPixel(evt);
            }
        },

        /**
         * Prüft, welche Features an MousePosition vorhanden sind und fragt deren Texte ab
         * @param  {evt} evt PointerMoveEvent
         */
        checkForFeaturesAtPixel: function (evt) {
            var pFeaturesArray = [],
                pFeatureArray = [],
                featuresAtPixel = this.getFeaturesAtPixel(evt),
                textArray,
                textPosition;

            if (featuresAtPixel.length > 0) {
                _.each(featuresAtPixel, function (featureAtPixel) {
                    pFeatureArray = this.fillFeatureArray(featureAtPixel);
                    pFeaturesArray = _.union(pFeaturesArray, pFeatureArray);
                }, this);
                if (pFeaturesArray.length > 0) {
                    if (this.get("oldSelection").length > 0 && this.compareArrayOfObjects(pFeaturesArray, this.get("oldSelection")) === false) {
                        this.destroyPopup(pFeaturesArray);
                    }
                    this.set("oldSelection", pFeaturesArray);
                    textArray = this.getTextArray(pFeaturesArray);
                    textPosition = this.getTextPosition(pFeaturesArray[0].feature.getGeometry());
                    this.setMouseHoverFeature(textArray, textPosition);
                }
            }
            else {
                this.destroyPopup();
            }
        },

        compareArrayOfObjects: function (arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }
            for (var i = 0; i < arr1.length; i++) {
                var obj1 = arr1[i],
                    obj2 = arr2[i];

                if (_.isEqual(obj1, obj2) === false) {
                    return false;
                }
            }
            return true;
        },

        setMouseHoverFeature: function (textArray, textPosition) {
            this.get("mhpOverlay").setPosition(textPosition);
            this.set("mhpresult", textArray);
        },

        getTextPosition: function (featureGeometry, evt) {
            var coord;

            if (featureGeometry.getType() === "MultiPolygon") {
                coord = _.flatten(featureGeometry.getInteriorPoints().getCoordinates());
            }
            else if (featureGeometry.getType() === "Polygon") {
                coord = _.flatten(featureGeometry.getInteriorPoint().getCoordinates());
            }
            else if (featureGeometry.getType() === "MultiLineString") {
                coord = _.flatten(featureGeometry.getCoordinates());
            }
            else {
                coord = _.flatten(featureGeometry.getCoordinates());
            }

            return coord;
        },

        getLayerInfosFromWfsList: function (element) {
            return _.find(this.get("wfsList"), function (ele) {
                return ele.layerId === element.layerId;
            });
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
         * @return {Array}                Texte fürs Mousehover
         */
        getTextArray: function (featureArray) {
            var textArray = [],
                textArrayCheckedLength,
                textArrayBreaked;

            // für jedes gehoverte Feature...
            _.each(featureArray, function (element) {
                var featureProperties = element.feature.getProperties(),
                    // featureGeometry = element.feature.getGeometry(),
                    layerInfos = this.getLayerInfosFromWfsList(element);

                if (!_.isUndefined(layerInfos)) {
                    textArray.push(this.pickValue(layerInfos.fieldname, featureProperties));
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
        }
    });

    return MouseHoverPopup;
});
