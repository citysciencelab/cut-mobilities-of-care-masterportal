define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        mouseeventPolyfill = require("mouseeventPolyfill"),
        ol = require("openlayers"),
        Cesium = require("cesium"),
        MapView = require("modules/core/mapView"),
        Config = require("config"),
        Map;

    Map = Backbone.Model.extend({

        /**
         *
         */
        defaults: {
            initalLoading: 0
        },

        /**
        *
        */
        initialize: function () {
            this.listenTo(this, "change:initalLoading", this.initalLoadingChanged);
            var channel = Radio.channel("Map"),
                mapView = new MapView();

            channel.reply({
                "getLayers": this.getLayers,
                "getWGS84MapSizeBBOX": this.getWGS84MapSizeBBOX,
                "createLayerIfNotExists": this.createLayerIfNotExists,
                "getEventPixel": this.getEventPixel,
                "hasFeatureAtPixel": this.hasFeatureAtPixel,
                "getSize": this.getSize,
                "isMap3d" : this.isMap3d,
                "getMap3d" : this.getMap3d,
                "getMapMode" : this.getMapMode,
                "getFeatures3dAtPosition": this.getFeatures3dAtPosition
            }, this);

            channel.on({
                "addLayer": this.addLayer,
                "addLayerToIndex": this.addLayerToIndex,
                "addOverlay": this.addOverlay,
                "addInteraction": this.addInteraction,
                "addControl": this.addControl,
                "removeLayer": this.removeLayer,
                "removeOverlay": this.removeOverlay,
                "removeInteraction": this.removeInteraction,
                "setBBox": this.setBBox,
                "render": this.render,
                "zoomToExtent": this.zoomToExtent,
                "createVectorLayer": this.createVectorLayer,
                "addLoadingLayer": this.addLoadingLayer,
                "removeLoadingLayer": this.removeLoadingLayer,
                "registerListener": this.registerListener,
                "unregisterListener": this.unregisterListener,
                "forEachFeatureAtPixel": this.forEachFeatureAtPixel,
                "activateMap3d" : this.activateMap3d,
                "deactivateMap3d" : this.deactivateMap3d,
                "setCameraParameter" : this.setCameraParameter
            }, this);

            this.listenTo(this, {
                "change:vectorLayer": function (model, value) {
                    this.addLayerToIndex([value, 0]);
                }
            });

            this.set("view", mapView.get("view"));

            this.set("map", new ol.Map({
                logo: null,
                renderer: "canvas",
                target: "map",
                view: this.get("view"),
                controls: [],
                interactions: ol.interaction.defaults({altShiftDragRotate: false, pinchRotate: false})
            }));

            this.getMap().on('click', this.reactToClickEvent, this);


            Radio.trigger("zoomtofeature", "zoomtoid");
            Radio.trigger("ModelList", "addInitialyNeededModels");
            if (Config.startingMap3D) {
                this.activateMap3d();
            }
        },

        /**
         * Findet einen Layer über seinen Namen und gibt ihn zurück
         * @param  {string} layerName - Name des Layers
         * @return {ol.layer}
         */
        getLayerByName: function (layerName) {
            var layers = this.get("map").getLayers().getArray(),
                layer = _.find(layers, function (layer) {
                    return layer.get("name") === layerName;
                });

            return layer;
        },

        /**
         * Erstellt einen Vectorlayer
         * @param {string} layerName - Name des Vectorlayers
         */
        createVectorLayer: function (layerName) {
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector({useSpatialIndex: false}),
                alwaysOnTop: true,
                name: layerName,
                altitudeMode : "clampToGround"
            });

            this.setVectorLayer(layer);
        },

        setVectorLayer: function (value) {
            this.set("vectorLayer", value);
        },

        getVectorLayer: function () {
            return this.get("vectorLayer");
        },

        getLayers: function () {
            return this.get("map").getLayers();
        },

        render: function () {
            this.get("map").render();
        },

        setBBox: function (bbox) {
            this.set("bbox", bbox);
            this.BBoxToMap(this.get("bbox"));
        },
        BBoxToMap: function (bbox) {
            if (bbox) {
                this.get("view").fit(bbox, this.get("map").getSize());
            }
        },
        getMapMode: function () {
            return this.getMap3d() && this.getMap3d().getEnabled() ? "3D" : "2D";
        },
        /**
        *
        */
        isMap3d: function () {
            return this.getMap3d() && this.getMap3d().getEnabled();
        },
        /**
         */
        activateMap3d: function () {
            if(!this.getMap3d()) {
                this.setMap3d(new olcs.OLCesium({
                    map: this.getMap(),
                    stopOpenLayersEventsPropagation : true,
                    createSynchronizers: function(map, scene){
                        return [
                            new olcs.WMSRasterSynchronizer(map, scene),
                            new olcs.VectorSynchronizer(map, scene),
                            new olcs.OverlaySynchronizer(map, scene)
                        ];
                    }
                }));
                var eventHandler = new Cesium.ScreenSpaceEventHandler(this.getMap3d().getCesiumScene().canvas);
                eventHandler.setInputAction(this.reactTo3DClickEvent.bind(this), Cesium.ScreenSpaceEventType["LEFT_CLICK"]);
                var camera = this.getMap3d().getCamera();
                if (Config.cameraParameter.tilt) {
                    var tilt = Number.parseFloat(Config.cameraParameter.tilt);
                    camera.setTilt(tilt);
                }
                if (Config.cameraParameter.heading) {
                    var heading = Number.parseFloat(Config.cameraParameter.heading);
                    camera.setHeading(heading);
                }
                if (Config.cameraParameter.altitude) {
                    var altitude  = Number.parseFloat(Config.cameraParameter.altitude);
                    camera.setAltitude(altitude);
                }
                var scene = this.getMap3d().getCesiumScene();
                var cesiumCamera = scene.camera;
                if (Config.cesiumParameter) {
                    if (Config.cesiumParameter.fog) {
                        if (_.isBoolean(Config.cesiumParameter.fog.enabled)) {
                            scene.fog.enabled = Config.cesiumParameter.fog.enabled;
                        }
                        if (_.isNumber(Config.cesiumParameter.fog.density)) {
                            scene.fog.density = Config.cesiumParameter.fog.density;
                        }
                        if (_.isNumber(Config.cesiumParameter.fog.screenSpaceErrorFactor)) {
                            scene.fog.screenSpaceErrorFactor = Config.cesiumParameter.fog.screenSpaceErrorFactor;
                        }
                    }
                    if (_.isNumber(Config.cesiumParameter.tileCacheSize)) {
                        scene.globe.tileCacheSize = Config.cesiumParameter.tileCacheSize;
                    }
                    if (_.isNumber(Config.cesiumParameter.maximumScreenSpaceError)) {
                        scene.globe.maximumScreenSpaceError = Config.cesiumParameter.maximumScreenSpaceError;
                    }
                    if (_.isBoolean(Config.cesiumParameter.fxaa)) {
                        scene.fxaa = Config.cesiumParameter.fxaa;
                    }
                    if (_.isBoolean(Config.cesiumParameter.enableLighting)) {
                        scene.globe.enableLighting = Config.cesiumParameter.enableLighting;
                    }
                }

                cesiumCamera.changed.addEventListener(this.reactToCameraChanged, this);
            }
            this.getMap3d().setEnabled(true);
            Radio.trigger("Map", "change", "3D");
        },

        setCameraParameter: function(parameter) {
            if(this.getMap3d()) {
                var camera = this.getMap3d().getCamera();
                if (parameter.tilt) {
                    var tilt = Number.parseFloat(parameter.tilt);
                    camera.setTilt(tilt);
                }
                if (parameter.heading) {
                    var heading = Number.parseFloat(parameter.heading);
                    camera.setHeading(heading);
                }
                if (parameter.altitude) {
                    var altitude = Number.parseFloat(parameter.altitude);
                    camera.setAltitude(altitude);
                }
            }
        },
         getFeatures3dAtPosition : function(position) {
            if(this.getMap3d()) {
                var scene = this.getMap3d().getCesiumScene();
                var objects = scene.drillPick(position);
                return objects;
            }
        },
        reactToClickEvent : function(evt) {
            var coords = evt.coordinate;
            Radio.trigger("Map", "clickedMAP", coords);
        },

        reactTo3DClickEvent : function(event){
            var scene = this.getMap3d().getCesiumScene();
            var ray = scene.camera.getPickRay(event.position);
            var cartesian = scene.globe.pick(ray, scene);
            var height;
            var coords;
            if (cartesian) {
                var cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                coords = [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)];
                height = scene.globe.getHeight(cartographic);
                if(height){
                    coords = coords.concat([height]);
                }

                var distance = Cesium.Cartesian3.distance(cartesian, scene.camera.position);
                var resolution =  this.getMap3d().getCamera().calcResolutionForDistance(distance, cartographic.latitude);
                var mapProjection = Radio.request("MapView", "getProjection");
                var transformedCoords = ol.proj.transform(coords, ol.proj.get("EPSG:4326"), mapProjection);
                var transformedPickedPosition = null;

                if (scene.pickPositionSupported) {
                    var pickedPositionCartesian = scene.pickPosition(event.position);
                    if (pickedPositionCartesian) {
                        var cartographicPickedPosition = scene.globe.ellipsoid.cartesianToCartographic(pickedPositionCartesian);
                        transformedPickedPosition = ol.proj.transform([Cesium.Math.toDegrees(cartographicPickedPosition.longitude), Cesium.Math.toDegrees(cartographicPickedPosition.latitude)], ol.proj.get("EPSG:4326"), mapProjection);
                        transformedPickedPosition.push(cartographicPickedPosition.height);
                    }
                }
                Radio.trigger("Map", "clickedMAP", transformedCoords);
                Radio.trigger("Map", "clickedWindowPosition", {position:event.position, pickedPosition: transformedPickedPosition, coordinate:transformedCoords, latitude: coords[0], longitude: coords[1], resolution: resolution});
            }
        },
        /**
         */
        deactivateMap3d: function () {
            if(this.getMap3d()) {
                this.get("view").animate({rotation: 0}, function(){
                    this.getMap3d().setEnabled(false);
                    this.get("view").setRotation(0);
                    var resolution = this.get("view").getResolution();
                    var resolutions = this.get("view").getResolutions();
                    if (resolution > resolutions[0]) {
                        this.get("view").setResolution(resolutions[0]);
                    }
                    if (resolution < resolutions[resolutions.length-1]) {
                        this.get("view").setResolution(resolutions[resolutions.length-1]);
                    }
                    Radio.trigger("Map", "change", "2D");
                }.bind(this));
            }
        },

        /**
         *
         */
        setMap3d: function (map3d) {
            return this.set("map3d", map3d);
        },

        /**
         *
         */
        getMap3d: function () {
            return this.get("map3d");
        },
        /**
         *
         */
        reactToCameraChanged: function() {
            var camera = this.getMap3d().getCamera();
            Radio.trigger("Map", "cameraChanged", {"heading" : camera.getHeading(), "altitude" : camera.getAltitude(), "tilt" : camera.getTilt()});
        },

        getWGS84MapSizeBBOX: function () {
            var bbox = this.get("view").calculateExtent(this.get("map").getSize()),
                firstCoord = [bbox[0], bbox[1]],
                secondCoord = [bbox[2], bbox[3]],
                firstCoordTransform = Radio.request("CRS", "transform", {fromCRS: "EPSG:25832", toCRS: "EPSG:4326", point: firstCoord}),
                secondCoordTransform = Radio.request("CRS", "transform", {fromCRS: "EPSG:25832", toCRS: "EPSG:4326", point: secondCoord});

            return [firstCoordTransform[0], firstCoordTransform[1], secondCoordTransform[0], secondCoordTransform[1]];
        },

        getMap: function () {
            return this.get("map");
        },

        /**
         * Registriert Listener für bestimmte Events auf der Karte
         * Siehe http://openlayers.org/en/latest/apidoc/ol.Map.html
         * @param {String} event - Der Eventtyp
         * @param {Function} callback - Die Callback Funktion
         * @param {Object} context
         */
        registerListener: function (event, callback, context) {
            this.getMap().on(event, callback, context);
        },

        /**
         * Meldet Listener auf bestimmte Events ab
         * @param {String} event - Der Eventtyp
         * @param {Function} callback - Die Callback Funktion
         * @param {Object} context
         */
        unregisterListener: function (event, callback, context) {
            this.getMap().un(event, callback, context);
        },

        /**
         * Gibt die Kartenpixelposition für ein Browser-Event relative zum Viewport zurück
         * @param  {Event} evt - Mouse Events | Keyboard Events | ...
         * @return {ol.Pixel}
         */
        getEventPixel: function (evt) {
            return this.getMap().getEventPixel(evt);
        },

        /**
         * Ermittelt ob Features ein Pixel im Viewport schneiden
         * @param  {ol.Pixel} pixel
         * @return {Boolean}
         */
        hasFeatureAtPixel: function (pixel) {
            return this.getMap().hasFeatureAtPixel(pixel);
        },

        /**
         * Iteriert über alle Features, die ein Pixel auf dem Viewport schneiden
         * @param  {ol.Pixel} pixel
         * @param  {Function} callback - Die Feature Callback Funktion
         */
        forEachFeatureAtPixel: function (pixel, callback) {
            this.getMap().forEachFeatureAtPixel(pixel, callback);
        },

        /**
        * Interaction-Handling
        */
        addInteraction: function (interaction) {
            this.get("map").addInteraction(interaction);
        },
        removeInteraction: function (interaction) {
            this.get("map").removeInteraction(interaction);
        },
        /**
        * Overlay-Handling
        */
        addOverlay: function (overlay) {
            this.get("map").addOverlay(overlay);
        },
        /**
        */
        removeOverlay: function (overlay) {
            this.get("map").removeOverlay(overlay);
        },
        /**
        * Control-Handling
        */
        addControl: function (control) {
            this.get("map").addControl(control);
        },
        removeControl: function (control) {
            this.get("map").removeControl(control);
        },
        /**
        * Layer-Handling
        */
        addLayer: function (layer) {
            var layerList,
                firstVectorLayer,
                index;

            // Alle Layer
            layerList = this.get("map").getLayers().getArray();
            // der erste Vectorlayer in der Liste
            firstVectorLayer = _.find(layerList, function (layer) {
                return layer instanceof ol.layer.Vector;
            });
            // Index vom ersten VectorLayer in der Layerlist
            index = _.indexOf(layerList, firstVectorLayer);
            if (index !== -1 && _.has(firstVectorLayer, "id") === false) {
                // Füge den Layer vor dem ersten Vectorlayer hinzu. --> damit bleiben die Vectorlayer(Messen, Zeichnen,...) immer oben auf der Karte
                this.get("map").getLayers().insertAt(index, layer);
            }
            else {
                this.get("map").getLayers().push(layer);
            }
        },

        /**
        */
        removeLayer: function (layer) {
            this.get("map").removeLayer(layer);
        },

        /**
         * Bewegt den Layer auf der Karte an die vorhergesehene Position
         * @param {Array} args - [0] = Layer, [1] = Index
         */
         addLayerToIndex: function (args) {
            var layer = args[0],
                index = args[1],
                layersCollection = this.get("map").getLayers();

            layersCollection.remove(layer);
            layersCollection.insertAt(index, layer);
            this.setImportDrawMeasureLayersOnTop(layersCollection);

            // Laden des Layers überwachen
            if (layer instanceof ol.layer.Group) {
                layer.getLayers().forEach(function (singleLayer) {
                    singleLayer.getSource().on("wmsloadend", function () {
                        Radio.trigger("Map", "removeLoadingLayer");
                    });
                    singleLayer.getSource().on("wmsloadstart", function () {
                        Radio.trigger("Map", "addLoadingLayer");
                    });
                });
            }
            else {
                layer.getSource().on("wmsloadend", function () {
                    Radio.trigger("Map", "removeLoadingLayer");
                });
                layer.getSource().on("wmsloadstart", function () {
                    Radio.trigger("Map", "addLoadingLayer");
                });
            }
        },

        // verschiebt die layer nach oben, die alwaysOnTop=true haben (measure, import/draw)
        setImportDrawMeasureLayersOnTop: function (layers) {
            var layersOnTop = _.filter(layers.getArray(), function (layer) {
                return layer.get("alwaysOnTop") === true;
            });

            _.each(layersOnTop, function (layer) {
                layers.remove(layer);
                layers.push(layer);
            });
        },

        zoomToExtent: function (extent, options) {
            this.get("view").fit(extent, this.get("map").getSize(), options);
        },

        /**
         * Gibt die Größe in Pixel der Karte zurück.
         * @return {ol.Size} - Ein Array mit zwei Zahlen [width, height]
         */
        getSize: function () {
            return this.getMap().getSize();
        },

        addLoadingLayer: function () {
            this.set("initalLoading", this.get("initalLoading") + 1);
        },
        removeLoadingLayer: function () {
            this.set("initalLoading", this.get("initalLoading") - 1);
        },
        /**
         * Initiales Laden. "initalLoading" wird layerübergreifend hochgezählt, wenn mehrere Tiles abgefragt werden und wieder heruntergezählt, wenn die Tiles geladen wurden.
         * Listener wird anschließend gestoppt, damit nur beim initialen Laden der Loader angezeigt wird - nicht bei zoom/pan
         */
        initalLoadingChanged: function () {
            var num = this.get("initalLoading");

            if (num > 0) {
                Radio.trigger("Util", "showLoader");
            }
            else if (num === 0) {
                Radio.trigger("Util", "hideLoader");
                this.stopListening(this, "change:initalLoading");
            }
        },
        // Prüft ob der Layer mit dem Namen "Name" schon existiert und verwendet ihn, wenn nicht, erstellt er neuen Layer
        createLayerIfNotExists: function (name) {
            var layers = this.getLayers(),
                found = false,
                resultLayer = {};

            _.each(layers.getArray(), function (layer) {
                if (layer.get("name") === name) {
                    found = true;
                    resultLayer = layer;
                }
            }, this);

            if (!found) {
                var source = new ol.source.Vector({useSpatialIndex: false}),
                    layer = new ol.layer.Vector({
                    name: name,
                    source: source,
                    alwaysOnTop: true,
                    altitudeMode : "clampToGround"
                });

                resultLayer = layer;
                Radio.trigger("Map", "addLayerToIndex", [layer, layers.getArray().length]);
            }
            return resultLayer;
        }
    });

    return Map;
});
