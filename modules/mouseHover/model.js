define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "eventbus",
    "config",
    "bootstrap/popover"
], function (Backbone, Radio, ol, EventBus, Config) {

    var MouseHoverPopup = Backbone.Model.extend({
        defaults: {
            wfsList: [],
            mhpresult: "",
            mhpcoordinates: [],
            oldSelection: "",
            GFIPopupVisibility: false
        },
        initialize: function () {
            $("body").append("<div id='mousehoverpopup' class='col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5'></div>");

            this.set("mhpOverlay", new ol.Overlay({
                element: $("#mousehoverpopup")[0]
            }));
            this.set("element", this.get("mhpOverlay").getElement());
            EventBus.on("newMouseHover", this.checkForEachFeatureAtPixel, this); // MouseHover auslösen. Trigger von mouseHoverCollection-Funktion
            EventBus.on("GFIPopupVisibility", this.GFIPopupVisibility, this); // GFIPopupStatus auslösen. Trigger in GFIPopoupView
            this.checkLayersAndRegisterEvent(Radio.request("map", "getMap"));
        },
        GFIPopupVisibility: function (GFIPopupVisibility) {
            this.set("GFIPopupVisibility", GFIPopupVisibility);
        },
        checkLayersAndRegisterEvent: function (map) {
            // Lese Config-Optionen ein
            var layerIDs = Config.tree.layer,
                wfsList = [];

            _.each(layerIDs, function (element) {
                if (_.has(element, "mouseHoverField")) {
                    var id = element.id,
                        mhf = element.mouseHoverField;

                    wfsList.push({
                        layerId: id,
                        fieldname: mhf
                    });
                }
            });
            // speichere Ergebnisse in wfsList
            this.set("wfsList", wfsList);
            if (wfsList && wfsList.length > 0) {
                map.on("pointermove", function (evt) {
                    if (this.get("GFIPopupVisibility") === false) {
                        EventBus.trigger("newMouseHover", evt, map);
                    }
                }, this);
                /**
                 * FEHLER: map.addInteraction() bewirkt zwar das hinzufügen der Interaction, fortan kann die map aber nicht mehr
                 * verschoben werden. Weder hier noch in map.js läßt sich addInteraction() erfolgreich ausführen.
                 * Weder über addInteraction noch über interactios:ol.interaction.defaults().extend([])
                 * Ursache: ol.events.condition.mouseMove ist experimental. Mit ol.events.condition.click klappt es.
                 * Bug #2666
                 */
                /*var selectMouseMove = new ol.interaction.Select({
                    condition: ol.events.condition.mouseMove
                });
                map.getInteractions().forEach(function(interaction){
                    console.log(interaction);
                }, this);
                map.addInteraction(selectMouseMove);
                var mouseHoverCollection = selectMouseMove.getFeatures();
                mouseHoverCollection.on("add", function(ele) {
                    EventBus.trigger("newMouseHover", ele);
                });*/
            }
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
        checkForEachFeatureAtPixel: function (evt, map) {
            var pFeatureArray = [],
                featuresAtPixel = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
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
                            layerId: featuresAtPixel.layer.id
                        });
                    });
                }
                else {
                    pFeatureArray.push({
                        feature: selFeature,
                        layerId: featuresAtPixel.layer.id
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
                            return ele.layerId = element.layerId;
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
                            coord = featureGeometry.getCoordinates();
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
