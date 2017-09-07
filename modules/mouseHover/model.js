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
            Radio.trigger("Map", "registerListener", "pointermove", this.checkForEachFeatureAtPixel, this);

            $("#map").append("<div id='mousehoverpopup' class='col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5'></div>");

            this.set("mhpOverlay", new ol.Overlay({
                element: $("#mousehoverpopup")[0]
            }));

            this.filterWFSList();
            this.set("element", this.get("mhpOverlay").getElement());
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
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            $(this.get("element")).tooltip("show");
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
        * forEachFeatureAtPixel greift nur bei sichtbaren Features.
        * wenn 2. Parameter (layer) == null, dann kein Layer
        * Wertet an der aktuell getriggerten Position alle Features der
        * Map aus, die über subfunction function(layer) zurückgegeben werden.
        * pFeatureArray wird so mit allen darzustellenden Features gepusht.
        * Nachdem die Selektion erstellt wurde, wird diese für initiale
        * if-Bedingung gespeichert und abschließend wird das Aufbereiten dieser
        * Selektion angestpßen.
        */
        checkForEachFeatureAtPixel: function (evt) {
            var pFeaturesArray = [],
                pFeatureArray = [],
                featuresAtPixel = this.getFeaturesAtPixel(evt);

            if (featuresAtPixel.length > 0) {
                _.each(featuresAtPixel, function (featureAtPixel) {
                    pFeatureArray = this.fillFeatureArray(featureAtPixel);
                    pFeaturesArray = _.union(pFeaturesArray, pFeatureArray);
                }, this);
                if (pFeaturesArray.length > 0) {
                    if (this.get("oldSelection").length === 0) {
                        this.set("oldSelection", pFeaturesArray);
                        this.prepMouseHoverFeature(pFeaturesArray);
                    }
                    else {
                        if (this.compareArrayOfObjects(pFeaturesArray, this.get("oldSelection")) === false) {
                            this.destroyPopup(pFeaturesArray);
                            this.set("oldSelection", pFeaturesArray);
                            this.prepMouseHoverFeature(pFeaturesArray);
                        }
                    }
                }
            }
            else {
                this.removeMouseHoverFeatureIfSet();
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

        /**
        * Diese Funktion prüft ob mhpresult = "" und falls nicht
        * wird MouseHover destroyt
        */
        removeMouseHoverFeatureIfSet: function () {
            if (this.get("mhpresult") && this.get("mhpresult") !== "") {
                this.destroyPopup();
            }
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
        pickCoord: function (featureGeometry) {
            var coord;

            if (featureGeometry.getType() === "MultiPolygon" || featureGeometry.getType() === "Polygon") {
                coord = _.flatten(featureGeometry.getInteriorPoints().getCoordinates());
            }
            else {
                coord = _.flatten(featureGeometry.getCoordinates());
            }
            return coord;
        },
        /**
        * Dies Funktion durchsucht das übergebene pFeatureArray und extrahiert den
        * anzuzeigenden Text sowie die Popup-Koordinate und setzt
        * mhpresult. Auf mhpresult lauscht die View, die daraufhin rendert
        */
        prepMouseHoverFeature: function (pFeaturesArray) {
            var mouseHoverObj = {values: []},
                value = "",
                coord;

            if (pFeaturesArray.length > 0) {
                // für jedes gehoverte Feature...
                _.each(pFeaturesArray, function (element) {
                    var featureProperties = element.feature.getProperties(),
                        featureGeometry = element.feature.getGeometry(),
                        layerInfos = this.getLayerInfosFromWfsList(element);

                    if (!_.isUndefined(layerInfos)) {
                        var mouseHoverField = layerInfos.fieldname;

                        value = this.pickValue(mouseHoverField, featureProperties);
                        if (_.isUndefined(coord)) {
                            coord = this.pickCoord(featureGeometry);
                        }
                        mouseHoverObj.coord = coord;
                        mouseHoverObj.values.push(value);
                    }
                }, this);
            }

            if (mouseHoverObj.values.length > 0) {
                var maxNum = this.get("numFeaturesToShow");

                if (mouseHoverObj.values.length > maxNum) {
                    mouseHoverObj.values = _.sample(mouseHoverObj.values, maxNum);
                    mouseHoverObj.values.push("<span class='info'>" + this.get("infoText") + "</span>");
                }
                this.get("mhpOverlay").setPosition(mouseHoverObj.coord);
                this.get("mhpOverlay").setOffset([10, -15]);
                this.set("mhpcoordinates", mouseHoverObj.coord);
                this.set("mhpresult", mouseHoverObj.values);
            }
        }
    });

    return MouseHoverPopup;
});
