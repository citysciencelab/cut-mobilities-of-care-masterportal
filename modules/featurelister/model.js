define(function (require) {
    var Requestor = require("modules/core/requestor"),
        Tool = require("modules/core/modelList/tool/model"),
        FeatureListerModel;

    FeatureListerModel = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            maxFeatures: 20, // über Config konfigurierbare Max-Anzahl an pro Layer geladenen Features
            isActive: false,
            layerlist: [], // Array aus {id, name, features}
            layerid: "", // ID des visibleLayer, der angezeigt werden soll.
            layer: {}, // Layer aus Layerlist mit gesuchter layerid
            headers: [], // Liste der Überschriften in Liste
            featureid: "", // ID des Features, das angezeigt werden soll.
            featureProps: {}, // Properties des Features mit gesuchter featureid
            highlightedFeature: null,
            highlightedFeatureStyle: null
        }),
        initialize: function () {
            this.superInitialize();

            if (this.has("lister") === true) {
                this.set("maxFeatures", this.get("lister"));
            }
            Radio.on("ModelList", "updateVisibleInMapList", this.checkVisibleLayer, this);
            Radio.on("Map", "setGFIParams", this.highlightMouseFeature, this); // wird beim Öffnen eines GFI getriggert
            this.listenTo(this, {"change:layerid": this.getLayerWithLayerId});
            this.listenTo(this, {"change:featureid": this.getFeatureWithFeatureId});
        },

        /*
        * Wird ein GFI geöffnet, wird versucht das entsprechende Feature in der Liste zu finden und zu selektieren
        */
        highlightMouseFeature: function (evt) {
            var features = this.get("layer").features,
                mapFeatures = evt[0],
                layername = this.get("layer").name;

            this.trigger("gfiClose"); // entfernt evtl. Highlights
            _.each(features, function (feature) {
                _.each(mapFeatures, function (mapFeature) {
                    if (mapFeature.typ === "WFS" && mapFeature.name === layername) {
                        if (_.isEqual(feature.geometry, mapFeature.feature.getGeometry().getExtent())) {
                            this.trigger("gfiHit", feature);
                        }
                    }
                }, this);
            }, this);
        },
        /*
        * Nimmt selektiertes Feature, wertet dessen Properties aus und zoomt ggf. auf Feature
        */
        getFeatureWithFeatureId: function () {
            var featureid = this.get("featureid"),
                features = this.get("layer").features,
                feature = _.find(features, function (feat) {
                    return feat.id.toString() === featureid;
                }),
                geometry,
                properties;

            if (feature) {
                geometry = feature.geometry;
                properties = feature.properties;

                // Zoom auf Extent
                if (geometry) {
                    Radio.trigger("MapMarker", "zoomTo", {type: "Feature-Lister-Click", coordinate: geometry});
                }
                else {
                    Radio.trigger("Alert", "alert", {
                        text: "Der Versuch das selektierte Feature zu zeigen ist fehlgeschlagen, da es keine Geometrie hat.",
                        kategorie: "alert-warning"
                    });
                }
                // Zeigen der Details
                this.set("featureProps", properties);
            }
            else {
                this.set("featureProps", {});
            }
        },

        /*
        * Skaliert den Style des selektierten Features um das 1.5-fache
        */
        highlightFeature: function (id) {
            // Layer angepasst und nicht nur auf das eine Feature. Nach Merge MML-->Dev nochmal prüfen
            var layer = this.get("layer"),
                features = layer.features,
                feature = _.find(features, function (feat) {
                    return feat.id.toString() === id;
                }).feature,
                style = feature.getStyle() ? feature.getStyle() : layer.style(),
                clonedStyle = style.clone(),
                image = clonedStyle.getImage();

            if (image) {
                this.setHighlightedFeature(feature);
                this.setHighlightedFeatureStyle(feature.getStyle());

                image.setScale(image.getScale() * 1.5);
                feature.setStyle(clonedStyle);
            }
        },

        /*
        * Skaliert den Style des zuvor selektierten Features auf den Ursprungswert
        */
        downlightFeature: function () {
            var highlightedFeature = this.get("highlightedFeature"),
                highlightedFeatureStyle = this.get("highlightedFeatureStyle");

            if (highlightedFeature) {
                highlightedFeature.setStyle(highlightedFeatureStyle);
                this.setHighlightedFeature(null);
                this.setHighlightedFeatureStyle(null);
            }
        },
        /*
        * Merkt sich selektierten Layer.
        */
        getLayerWithLayerId: function () {
            var layers = this.get("layerlist"),
                layer = _.find(layers, {id: this.get("layerid")});

            // wenn Layer wechselt, kann auch kein Feature mehr aktiv sein.
            this.set("featureid", "");
            // Layer wegen Tab-switch-Reihenfolge erst hinterher setten.
            if (layer) {
                this.getFeatureList(this.get("layerid"));
                this.set("layer", layer);
            }
            else {
                this.set("layer", {});
            }
        },
        /*
        * Werter Layerlist aus und übernimmt neue Layer
        */
        checkVisibleLayer: function () {
            var layerlist = this.get("layerlist"),
                modelList = Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, typ: "WFS"}),
                activeLayerId = this.get("layerid");

            // entferne nicht mehr sichtbare Layer
            _.each(layerlist, function (layer) {
                var tester = _.filter(modelList, function (lay) {
                    return lay.id === layer.id;
                });

                if (tester.length === 0) {
                    // layer ist nun nicht sichtbar...
                    if (activeLayerId && activeLayerId === layer.id) {
                        // entfernter Layer wird in Tabelle angezeigt. Diese muss nun gelöscht werden.
                        this.set("layerid", "");
                    }
                    // ... und muss aus Liste entfernt werden
                    this.removeLayerFromList(layer);
                }
            }, this);
            // füge neue Layer hinzu
            _.each(modelList, function (layer) {
                var tester = _.filter(layerlist, function (lay) {
                    return lay.id === layer.id;
                });

                if (tester.length === 0) {
                    this.addLayerToList(layer);
                }
            }, this);
        },
        /*
        * Entfernt nicht mehr sichtbare Layer aus Liste
        */
        removeLayerFromList: function (layer) {
            var layerlist = this.get("layerlist"),
                remainLayer = _.filter(layerlist, function (lay) {
                    return lay.id !== layer.id;
                });

            this.unset("layerlist", {silent: true});
            this.set("layerlist", remainLayer);
        },
        /*
        * Übernimmt Features bei Selektion eines Layers.
        */
        getFeatureList: function (layerId) {
            var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
                gfiAttributes = layerModel.get("gfiAttributes"),
                layerFromList = _.findWhere(this.get("layerlist"), {id: layerId}),
                features = layerModel.get("layer").getSource().getFeatures(),
                ll = [];

            // Es muss sichergetellt werden, dass auch Features ohne Geometrie verarbeitet werden können. Z.B. KitaEinrichtunen
            _.each(features, function (feature, index) {
                var props, geom;

                if (feature.get("features")) {
                    _.each(feature.get("features"), function (feat, idx) {
                        props = Requestor.translateGFI([feat.getProperties()], gfiAttributes)[0];
                        geom = feat.getGeometry() ? feat.getGeometry().getExtent() : null;

                        ll.push({
                            id: idx,
                            properties: props,
                            geometry: geom,
                            feature: feat
                        });
                    });
                }
                else {
                    props = Requestor.translateGFI([feature.getProperties()], gfiAttributes)[0];
                    geom = feature.getGeometry() ? feature.getGeometry().getExtent() : null;

                    ll.push({
                        id: index,
                        properties: props,
                        geometry: geom,
                        feature: feature
                    });
                }
            }, this);

            layerFromList.features = ll;
        },
        /*
        * Fügt Layer zur Liste hinzu.
        */
        addLayerToList: function (layer) {
            var layerlist = this.get("layerlist");

            layerlist.push({
                id: layer.id,
                name: layer.get("name"),
                style: layer.get("style")
            });
            this.unset("layerlist", {silent: true});
            this.set("layerlist", layerlist);
            this.trigger("switchTabToTheme"); // bei zusätzlichen Layern soll sich gleich der Tab öffnen.
        },

        // setter for highlightedFeature
        setHighlightedFeature: function (value) {
            this.set("highlightedFeature", value);
        },

        // setter for highlightedFeatureStyle
        setHighlightedFeatureStyle: function (value) {
            this.set("highlightedFeatureStyle", value);
        }
    });

    return FeatureListerModel;
});
