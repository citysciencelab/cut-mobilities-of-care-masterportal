import Requestor from "../core/requestor";
import Tool from "../core/modelList/tool/model";

const FeatureListerModel = Tool.extend(/** @lends FeatureListerModel.prototype */{
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
        highlightedFeatureStyle: null,
        glyphicon: "glyphicon-menu-hamburger"
    }),
    /**
     * @class FeatureListerModel
     * @extends Core.ModelList.Tool
     * @memberof FeatureLister
     * @constructs
     * @property {Number} maxFeatures=20 maximally loaded features per layer, can be configured
     * @property {Boolean} isActive=false Flag if the model is active
     * @property {Array} layerlist Array of {id, name, features}
     * @property {String} layerid="" id of visible Layer which shall be shown
     * @property {Core.ModelList.Layer} layer={} Layer of the layerlist with requested layerid
     * @property {Array} headers Array table headers in the list
     * @property {String} featureid="" id of the feature to be shown
     * @property {Object} featureProps={} Properties of the feature with requested featureid
     * @property {Object} highlightedFeature=null Feature that is currently highlighted
     * @property {Object} highlightedFeatureStyle=null Feature style of the currently highlighted feature
     * @property {String} glyphicon="glyphicon-menu-hamburger" id of the glyphicon to use in the template
     * @fires FeatureLister#changeLayerId
     * @fires FeatureLister#changeFeatureId
     * @fires FeatureLister#changeIsActive
     * @fires FeatureLister#changeLayerList
     * @fires FeatureLister#changeLayer
     * @fires FeatureLister#changeFeatureProps
     * @listens ModelList#RadioTriggerModelListUpdateVisibleInMapList
     * @listens Map#RadioTriggerMapSetGFIParams
     * @listens FeatureLister#changeLayerId
     * @listens FeatureLister#changeFeatureId
     */
    initialize: function () {
        this.superInitialize();

        if (this.has("lister") === true) {
            this.set("maxFeatures", this.get("lister"));
        }
        Radio.on("ModelList", "updateVisibleInMapList", this.checkVisibleLayer, this);
        Radio.on("Map", "setGFIParams", this.highlightMouseFeature, this); // wird beim Öffnen eines GFI getriggert
        this.listenTo(this, {"change:layerid": this.getLayerWithLayerId});
        this.listenTo(this, {"change:featureid": this.getFeatureWithFeatureId});

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang();
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        this.set({
            "currentLng": lng
        });
    },

    /**
     * When a gfi opens, this function trys to find the corresponding feature in the list and select it
     * @param {Event} evt Event, which feature shall be highlighted
     * @fires FeatureLister#RadioTriggerGfiHit
     * @fires FeatureLister#RadioTriggerGfiClose
     * @return {void}
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
    /**
     * Takes the selected feature, checks the properties and zooms to it
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires MapMarker#RadioTriggerMapMarkerZoomTo
     * @return {void}
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
    /**
     * Scales the style of the selected feature by 1.5
     * @param {String} id id of the feature to highlight
     * @return {void}
     */
    highlightFeature: function (id) {
        // Layer angepasst und nicht nur auf das eine Feature. Nach Merge MML-->Dev nochmal prüfen
        var layer = this.get("layer"),
            features = layer.features,
            feature = _.find(features, function (feat) {
                return feat.id.toString() === id;
            }).feature,
            style = feature.getStyle() ? feature.getStyle() : layer.style(feature),
            clonedStyle = style.clone(),
            clonedImage = clonedStyle.getImage();

        if (clonedImage) {
            this.setHighlightedFeature(feature);
            this.setHighlightedFeatureStyle(feature.getStyle());

            clonedImage.setScale(clonedImage.getScale() * 1.5);

            feature.setStyle(clonedStyle);
        }
    },
    /**
     * Scales the style of the deselected feature back to previous value
     * @return {void}
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
    /**
     * Keeps the selected layer in mind
     * @return {void}
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
    /**
     * Checks the layer list and adds new layers
     * @fires ModelList#RadioRequestModelListGetModelsByAttributes
     * @return {void}
     */
    checkVisibleLayer: function () {
        var layerlist = this.get("layerlist"),
            modelList = Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, typ: "WFS"}),
            activeLayerId = this.get("layerid");

        // entferne nicht mehr sichtbare Layer
        _.each(layerlist, function (layer) {
            var tester = modelList.filter(function (lay) {
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
            var tester = layerlist.filter(function (lay) {
                return lay.id === layer.id;
            });

            if (tester.length === 0) {
                this.addLayerToList(layer);
            }
        }, this);
    },
    /**
     * Removes no longer visible layers from the list
     * @param {Object} layer layer to remove from the list
     * @return {void}
     */
    removeLayerFromList: function (layer) {
        var layerlist = this.get("layerlist"),
            remainLayer = layerlist.filter(function (lay) {
                return lay.id !== layer.id;
            });

        this.unset("layerlist", {silent: true});
        this.set("layerlist", remainLayer);
    },
    /**
     * Gets the features from a layer when the layer is selected
     * @param {String} layerId id of the layer to read the features
     * @fires ModelList#RadioRequestModelListGetModelsByAttributes
     * @return {void}
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
    /**
     * Adds layers to the list
     * @param {Object} layer layer to add to the list
     * @return {void}
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
    /**
     * setter for highlightedFeature
     * @param {Object} value feature to set as highlightedFeature
     * @return {void}
     */
    setHighlightedFeature: function (value) {
        this.set("highlightedFeature", value);
    },
    /**
     * setter for highlightedFeatureStyle
     * @param {Object} value style to set as highlightedFeatureStyle
     * @return {void}
     */
    setHighlightedFeatureStyle: function (value) {
        this.set("highlightedFeatureStyle", value);
    }
});

export default FeatureListerModel;
