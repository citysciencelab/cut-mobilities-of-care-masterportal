define([
    "backbone",
    "eventbus",
    "config",
    "modules/core/requestor"
], function (Backbone, EventBus, Config, Requestor) {

    var FeatureListerModel = Backbone.Model.extend({
        defaults: {
            maxFeatures: 20, // über Config konfigurierbare Max-Anzahl an pro Layer geladenen Features
            isActive: false,
            layerlist: [], // Array aus {id, name, features}
            layerid: "", // ID des visibleLayer, der angezeigt werden soll.
            layer: {}, // Layer aus Layerlist mit gesuchter layerid
            headers: [], // Liste der Überschriften in Liste
            featureid: "", // ID des Features, das angezeigt werden soll.
            featureProps: {} // Properties des Features mit gesuchter featureid
        },
        initialize: function () {
            this.set("maxFeatures", Config.menu.featureLister);

            EventBus.on("layerlist:sendVisibleWFSlayerList", this.checkVisibleLayer, this); // wird automatisch getriggert, wenn sich visibility ändert
            EventBus.on("setGFIParams", this.highlightMouseFeature, this); // wird beim Öffnen eines GFI getriggert
            this.listenTo(this, {"change:layerid": this.createList});
            this.listenTo(this, {"change:featureid": this.showFeature});
        },
        /*
        * Wird ein GFI geöffnet, wird versucht das entsprechende Feature in der Liste zu finden und zu selektieren
        */
        highlightMouseFeature: function (evt) {
            var features = this.get("layer").features,
                mapFeatures = evt[0],
                layername = this.get("layer").name,
                treffer = [];

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
        showFeature: function () {
            var featureid = this.get("featureid"),
                features = this.get("layer").features,
                feature = _.find(features, function (feat) {
                    return feat.id.toString() === featureid;
                }),
                geometry = feature.geometry,
                properties = feature.properties;

            // Zoom auf Extent
            if (geometry) {
                EventBus.trigger("mapHandler:zoomTo", {
                    type: "Feature-Lister-Click",
                    coordinate: geometry
                });
            }
            // Zeigen der Details
            this.set("featureProps", properties);
        },
        /*
        * Ruft über EventBus Hover des selektierten Features
        */
        showMarker: function (id) {
            var features = this.get("layer").features,
                feature = _.find(features, function (feat) {
                    return feat.id.toString() === id;
                }),
                geometry = feature.geometry;

            if (geometry) {
                EventBus.trigger("mapHandler:zoomTo", {
                    type: "Feature-Lister-Hover",
                    coordinate: geometry
                });
            }
        },
        /*
        * Merkt sich selektierten Layer.
        */
        createList: function () {
            var layers = this.get("layerlist"),
                layer = _.find(layers, {id: this.get("layerid")});

            if (layer) {
                this.set("layer", layer);
            }
        },
        /*
        * Werter Layerlist aus und übernimmt neue Layer
        */
        checkVisibleLayer: function (layers) {
            var layerlist = this.get("layerlist");

            // entferne nicht mehr sichtbare Layer
            _.each(layerlist, function (layer) {
                var tester = _.filter(layers, function (lay) {
                    return lay.id === layer.id;
                });
                if (tester.length === 0) {
                    this.removeLayerFromList(layer);
                }
            }, this);
            // füge neue Layer hinzu
            _.each(layers, function (layer) {
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
        getFeatureList: function (layer) {
            var gfiAttributes = layer.get("gfiAttributes"),
                features = layer.get("layer").getSource().getFeatures(),
                ll = [],
                counter = 0;

            _.each(features, function (feature) {
                if (feature.get("features")) {
                    _.each(feature.get("features"), function (feat) {
                        var props = Requestor.translateGFI([feat.getProperties()], gfiAttributes)[0],
                            geom = feat.getGeometry().getExtent();

                        ll.push({
                            id: counter,
                            properties: props,
                            geometry: geom,
                            feature: feat
                        });
                        counter += 1;
                    });
                }
                else {
                    var props = Requestor.translateGFI([feature.getProperties()], gfiAttributes)[0],
                        geom = feature.getGeometry().getExtent();

                    ll.push({
                        id: counter,
                        properties: props,
                        geometry: geom,
                        feature: feature
                    });
                    counter += 1;
                }
            }, this);
            return ll;
        },
        /*
        * Fügt Layer zur Liste hinzu.
        */
        addLayerToList: function (layer) {
            var layerlist = this.get("layerlist"),
                featurelist = this.getFeatureList(layer);

            layerlist.push({
                id: layer.id,
                name: layer.get("name"),
                features: featurelist
            });
            this.unset("layerlist", {silent: true});
            this.set("layerlist", layerlist);
        }
    });

    return new FeatureListerModel();
});
