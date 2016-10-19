define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        MapView = require("modules/core/mapView"),
        Util = require("modules/core/util"),
        Map;

     Map = Backbone.Model.extend({

        /**
         *
         */
        defaults: {
            MM_PER_INCHES: 25.4,
            POINTS_PER_INCH: 72,
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
                "getMap": function () {
                    return this.get("map");
                },
                "getLayers": this.getLayers
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
                "registerPostCompose": this.registerPostCompose,
                "unregisterPostCompose": this.unregisterPostCompose,
                "zoomToExtent": this.zoomToExtent,
                "updatePrintPage": this.updatePrintPage,
                "activateClick": this.activateClick,
                "addLoadingLayer": this.addLoadingLayer,
                "removeLoadingLayer": this.removeLoadingLayer
            }, this);

            this.set("view", mapView.get("view"));

            this.set("map", new ol.Map({
                logo: null,
                renderer: "canvas",
                target: "map",
                view: this.get("view"),
                controls: [],
                interactions: ol.interaction.defaults({altShiftDragRotate: false, pinchRotate: false})
            }));

            this.registerPointerMove();

            Radio.trigger("zoomtofeature", "zoomtoid");
            Radio.trigger("ModelList", "addInitialyNeededModels");
            var activeItem = Radio.request("Parser", "getItemByAttributes", {isActive: true});

            if (!_.isUndefined(activeItem)) {
                this.activateClick(activeItem.id);
            }

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

        GFIPopupVisibility: function (value) {
            if (value === true) {
                this.set("GFIPopupVisibility", true);
            }
            else {
                this.set("GFIPopupVisibility", false);
            }
        },

        getMap: function () {
            return this.get("map");
        },

        activateClick: function (tool) {
            if (tool === "coord") {
                this.get("map").un("click", this.setGFIParams, this);
                this.get("map").on("click", this.setPositionCoordPopup, this);
                // this.get("map").un("pointermove", this.registerPointerMove);
            }
            else if (tool === "gfi") {
                this.get("map").un("click", this.setPositionCoordPopup, this);
                this.get("map").on("click", this.setGFIParams, this);
                // this.get("map").un("pointermove", this.registerPointerMove);
            }
            else if (tool === "measure") {
                this.get("map").un("click", this.setPositionCoordPopup, this);
                this.get("map").un("click", this.setGFIParams, this);
                // this.get("map").on("pointermove", this.registerPointerMove);
            }
            else if (tool === "draw" || tool === "record") {
                this.get("map").un("click", this.setPositionCoordPopup, this);
                this.get("map").un("click", this.setGFIParams, this);
                // this.get("map").un("pointermove", this.registerPointerMove);
            }
        },

        registerPostCompose: function (callback, context) {
            this.get("map").on("postcompose", callback, context);
        },

        unregisterPostCompose: function (callback) {
            this.get("map").un("postcompose", callback);
        },

        registerPointerMove: function () {
            this.get("map").on("pointermove", function (evt) {
                Radio.trigger("Map", "pointerMoveOnMap", evt);
            });
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
            // layers = this.get("map").getLayers().getArray();
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
            layer.getSource().on("wmsloadend", function () {
                Radio.trigger("Map", "removeLoadingLayer");
            });
            layer.getSource().on("wmsloadstart", function () {
                Radio.trigger("Map", "addLoadingLayer");
            });
        },

        // verschiebt die layer nach oben, die alwaysOnTop=true haben (measure, import/draw)
        setImportDrawMeasureLayersOnTop: function (layers) {
            var layersOnTop = [];

            for (var i = layers.getLength(); i >= 0; i--) {
                var layer = layers.item(i);

                if (!_.isUndefined(layer) && layer.get("alwaysOnTop")) {
                    layers.removeAt(i);
                    layersOnTop.push(layer);
                }
            }

            _.each(layersOnTop, function (layer) {
                layers.push(layer);
            });
        },

        /**
        *
        */
        setPositionCoordPopup: function (evt) {
            // Abbruch, wenn auf SearchMarker x geklickt wird.
            // TODO
            // if (this.checkInsideSearchMarker(evt.pixel[1], evt.pixel[0]) === true) {
            //     return;
            // }
            // else {
                Radio.trigger("Map", "setPositionCoordPopup", evt.coordinate);
            // }
        },
        /**
        * Prüft, ob clickpunkt in RemoveIcon und liefert true/false zurück.
        */
        checkInsideSearchMarker: function (top, left) {
            var button = Radio.request("MapMarker", "getCloseButtonCorners"),
                bottomSM = button.bottom,
                leftSM = button.left,
                topSM = button.top,
                rightSM = button.right;

            if (top <= topSM && top >= bottomSM && left >= leftSM && left <= rightSM) {
                return true;
            }
            else {
                return false;
            }
        },
        /**
         * Stellt die notwendigen Parameter für GFI zusammen. Gruppenlayer werden nicht abgefragt, wohl aber deren ChildLayer.
         */
        setGFIParams: function (evt) {
            var visibleWMSLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "WMS"}),
                visibleGeoJSONLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "GeoJSON"}),
                visibleLayerList = _.union(visibleWMSLayerList, visibleGeoJSONLayerList),
                gfiParams = [],
                scale = Radio.request("MapView", "getOptions").scale,
                // scale = _.findWhere(Radio.request("MapView", "getOptions"), {resolution: this.get("view").getResolution()}).scale,
                eventPixel = this.get("map").getEventPixel(evt.originalEvent),
                isFeatureAtPixel = this.get("map").hasFeatureAtPixel(eventPixel),
                resolution = this.get("view").getResolution(),
                projection = this.get("view").getProjection(),
                coordinate = evt.coordinate;

            // WFS
            if (isFeatureAtPixel === true) {
                this.get("map").forEachFeatureAtPixel(eventPixel, function (featureAtPixel, pLayer) {
                    var modelByFeature = Radio.request("ModelList", "getModelByAttributes", {id: pLayer.get("id")});
                    // Cluster Feature
                    if (_.has(featureAtPixel.getProperties(), "features") === true) {
                        _.each(featureAtPixel.get("features"), function (feature) {
                             if (_.isUndefined(modelByFeature) === false) {
                                 gfiParams.push({
                                     typ: "WFS",
                                     feature: feature,
                                     attributes: modelByFeature.get("gfiAttributes"),
                                     name: modelByFeature.get("name"),
                                     ol_layer: modelByFeature.get("layer")
                                 });
                             }
                        });
                    }
                    // Feature
                    else {
                        if (!_.isUndefined(modelByFeature)) {
                            gfiParams.push({
                                typ: "WFS",
                                feature: featureAtPixel,
                                attributes: modelByFeature.get("gfiAttributes"),
                                name: modelByFeature.get("name"),
                                ol_layer: modelByFeature.get("layer")
                            });
                        }
                    }
                });
            }

            // WMS und GeoJSON
            _.each(visibleLayerList, function (element) {
                if (element.get("typ") !== "GROUP") {
                    var gfiAttributes = element.get("gfiAttributes");

                    if (_.isObject(gfiAttributes) || _.isString(gfiAttributes) && gfiAttributes.toUpperCase() !== "IGNORE") {
                        if (element.get("typ") === "WMS") {
                            var gfiURL = element.getLayerSource().getGetFeatureInfoUrl(
                                coordinate, resolution, projection,
                                {INFO_FORMAT: element.getInfoFormat()}
                            );

                            gfiParams.push({
                                typ: "WMS",
                                infoFormat: element.getInfoFormat(),
                                scale: scale,
                                url: gfiURL,
                                name: element.get("name"),
                                ol_layer: element
                            });
                        }
                    }
                    else if (element.get("typ") === "GeoJSON" && isFeatureAtPixel === true) {
                        this.get("map").forEachFeatureAtPixel(evt.pixel, function (feature) {
                            gfiParams.push({
                                typ: "GeoJSON",
                                feature: feature,
                                name: element.get("name"),
                                ol_layer: element
                            });
                        });
                    }
                }
                else {
                    element.get("backbonelayers").forEach(function (layer) {
                        var gfiAttributes = layer.get("gfiAttributes");

                        if (_.isObject(gfiAttributes) || _.isString(gfiAttributes) && gfiAttributes.toUpperCase() !== "IGNORE") {
                            if (layer.get("typ") === "WMS") {
                                var gfiURL = layer.getLayerSource().getGetFeatureInfoUrl(
                                    coordinate, resolution, projection,
                                    {INFO_FORMAT: layer.getInfoFormat()}
                                );

                                gfiParams.push({
                                    typ: "WMS",
                                    infoFormat: layer.getInfoFormat(),
                                    // scale: scale,
                                    url: gfiURL,
                                    name: layer.get("name"),
                                    ol_layer: layer
                                });
                            }
                        }
                    });
                }
            }, this);
            Radio.trigger("Map", "setGFIParams", [gfiParams, coordinate]);
        },
        zoomToExtent: function (extent, options) {
            this.get("view").fit(extent, this.get("map").getSize(), options);
        },
        updatePrintPage: function (args) {
            this.set("layoutPrintPage", args[1]);
            this.set("scalePrintPage", args[2]);
            if (args[0] === true) {
                this.get("map").on("precompose", this.handlePreCompose);
                this.get("map").on("postcompose", this.handlePostCompose, this);
            }
            else {
                this.get("map").un("precompose", this.handlePreCompose);
                this.get("map").un("postcompose", this.handlePostCompose, this);
            }
            this.get("map").render();
        },
        calculatePageBoundsPixels: function () {
            var s = this.get("scalePrintPage"),
                width = this.get("layoutPrintPage").width,
                height = this.get("layoutPrintPage").height,
                view = this.get("map").getView(),
                resolution = view.getResolution(),
                w = width / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * s / resolution * ol.has.DEVICE_PIXEL_RATIO,
                h = height / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * s / resolution * ol.has.DEVICE_PIXEL_RATIO,
                mapSize = this.get("map").getSize(),
                center = [mapSize[0] * ol.has.DEVICE_PIXEL_RATIO / 2 ,
                mapSize[1] * ol.has.DEVICE_PIXEL_RATIO / 2],
                minx, miny, maxx, maxy;

            minx = center[0] - (w / 2);
            miny = center[1] - (h / 2);
            maxx = center[0] + (w / 2);
            maxy = center[1] + (h / 2);
            return [minx, miny, maxx, maxy];
        },
        handlePreCompose: function (evt) {
            var ctx = evt.context;

            ctx.save();
        },
        handlePostCompose: function (evt) {
            var ctx = evt.context,
                size = this.get("map").getSize(),
                height = size[1] * ol.has.DEVICE_PIXEL_RATIO,
                width = size[0] * ol.has.DEVICE_PIXEL_RATIO,
                minx, miny, maxx, maxy,
                printPageRectangle = this.calculatePageBoundsPixels(),
                minx = printPageRectangle[0],
                miny = printPageRectangle[1],
                maxx = printPageRectangle[2],
                maxy = printPageRectangle[3];

            ctx.beginPath();
            // Outside polygon, must be clockwise
            ctx.moveTo(0, 0);
            ctx.lineTo(width, 0);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.lineTo(0, 0);
            ctx.closePath();
            // Inner polygon,must be counter-clockwise
            ctx.moveTo(minx, miny);
            ctx.lineTo(minx, maxy);
            ctx.lineTo(maxx, maxy);
            ctx.lineTo(maxx, miny);
            ctx.lineTo(minx, miny);
            ctx.closePath();
            ctx.fillStyle = "rgba(0, 5, 25, 0.55)";
            ctx.fill();
            ctx.restore();
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
                Util.showLoader();
            }
            else if (num === 0) {
                Util.hideLoader();
                this.stopListening(this, "change:initalLoading");
            }
        }
    });

    return Map;
});
