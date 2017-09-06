define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "bootstrap/popover"
], function (Backbone, Radio, ol) {

    var MouseHoverPopup = Backbone.Model.extend({
        defaults: {
            wfsList: [],
            mhpresult: "",
            mhpcoordinates: [],
            oldSelection: ""
        },
        initialize: function () {
            var channel = Radio.channel("MouseHover");
            channel.on({
                "registerListener": this.registerListener,
                "unregisterListener": this.unregisterListener
            }, this);
            Radio.trigger("Map", "registerListener", "pointermove", this.checkForEachFeatureAtPixel, this);

            $("body").append("<div id='mousehoverpopup' class='col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5'></div>");

            this.set("mhpOverlay", new ol.Overlay({
                element: $("#mousehoverpopup")[0]
            }));

            this.filterWFSList();
            this.set("element", this.get("mhpOverlay").getElement());
        },
        registerListener: function () {
            Radio.trigger("Map", "registerListener", "pointermove", this.checkForEachFeatureAtPixel, this);
        },
        unregisterListener: function () {
            Radio.trigger("Map", "unregisterListener", "pointermove", this.checkForEachFeatureAtPixel, this);
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
            var pFeatureArray = [],
                featuresAtPixel = evt.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
                    return {
                        feature: feature,
                        layer: layer
                    };
            });
            // featuresAtPixel.layer !== null --> kleiner schneller Hack da sonst beim zeichnen die ganze Zeit versucht wird ein Popup zu zeigen?? SD 01.09.2015
            if (featuresAtPixel !== undefined && featuresAtPixel.layer !== null) {
                var selFeature = featuresAtPixel.feature;
                // Cluster-Features
                if (selFeature.getProperties().features) {
                    var list = selFeature.getProperties().features;

                    _.each(list, function (element) {
                        pFeatureArray.push({
                            feature: element,
                            layerId: featuresAtPixel.layer.get("id")
                        });
                    });
                }
                else {
                    pFeatureArray.push({
                        feature: selFeature,
                        layerId: featuresAtPixel.layer.get("id")
                    });
                }
                if (pFeatureArray.length > 0) {
                    if (this.get("oldSelection") === "") {
                        this.set("oldSelection", pFeatureArray);
                        this.prepMouseHoverFeature(pFeatureArray);
                    }
                    else {
                        if (this.compareArrayOfObjects(pFeatureArray, this.get("oldSelection")) === false) {
                            this.destroyPopup(pFeatureArray);
                            this.set("oldSelection", pFeatureArray);
                                this.prepMouseHoverFeature(pFeatureArray);
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
        /**
        * Dies Funktion durchsucht das übergebene pFeatureArray und extrahiert den
        * anzuzeigenden Text sowie die Popup-Koordinate und setzt
        * mhpresult. Auf mhpresult lauscht die View, die daraufhin rendert
        */
        prepMouseHoverFeature: function (pFeatureArray) {
            var wfsList = this.get("wfsList"),
                value = "",
                coord;

            if (pFeatureArray.length > 0) {
                // für jedes gehoverte Feature...
                _.each(pFeatureArray, function (element) {
                    var featureProperties = element.feature.getProperties(),
                        featureGeometry = element.feature.getGeometry(),
                        listEintrag = _.find(wfsList, function (ele) {
                            return ele.layerId === element.layerId;
                    });

                    if (listEintrag) {
                        var mouseHoverField = listEintrag.fieldname;

                        if (mouseHoverField && _.isString(mouseHoverField)) {
                            if (_.has(featureProperties, mouseHoverField)) {
                                value = value + _.values(_.pick(featureProperties, mouseHoverField))[0];
                            }
                        }
                        else if (mouseHoverField && _.isArray(mouseHoverField)) {
                            _.each(mouseHoverField, function (element) {
                                value = value + "<span>" + _.values(_.pick(featureProperties, element)) + "</span></br>";
                            });
                        }
                        if (!coord) {
                            if (featureGeometry.getType() === "MultiPolygon" || featureGeometry.getType() === "Polygon") {
                                coord = _.flatten(featureGeometry.getInteriorPoints().getCoordinates());
                            }
                            else {
                                coord = _.flatten(featureGeometry.getCoordinates());
                            }
                        }
                    }
                }, this);

                if (value !== "") {
                    this.get("mhpOverlay").setPosition(coord);
                    this.get("mhpOverlay").setOffset([10, -15]);
                    this.set("mhpcoordinates", coord);
                    this.set("mhpresult", value);
                }
            }
        }
    });

    return new MouseHoverPopup();
});
