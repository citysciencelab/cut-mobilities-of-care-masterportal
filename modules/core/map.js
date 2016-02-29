define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "config",
    "modules/core/mapView",
    "eventbus",
     "modules/core/util"
], function (Backbone, Radio, ol, Config, MapView, EventBus, Util) {

    var Map = Backbone.Model.extend({

        /**
         *
         */
        defaults: {
            MM_PER_INCHES: 25.4,
            POINTS_PER_INCH: 72
        },

        /**
        *
        */
        initialize: function () {
             var channel = Radio.channel("map");

            channel.reply({
                "getView": MapView.get("view")
            }, this);
            channel.reply({
                "getMap": function () {
                    return this.get("map");
                }
            }, this);

            EventBus.on("activateClick", this.activateClick, this);
            EventBus.on("addLayer", this.addLayer, this);
            EventBus.on("removeLayer", this.removeLayer, this);
            EventBus.on("removeLastLayer", this.removeLastLayer, this);
            EventBus.on("addOverlay", this.addOverlay, this);
            EventBus.on("removeOverlay", this.removeOverlay, this);
            EventBus.on("addControl", this.addControl, this);
            EventBus.on("removeControl", this.removeControl, this);
            EventBus.on("addInteraction", this.addInteraction, this);
            EventBus.on("removeInteraction", this.removeInteraction, this);
            EventBus.on("moveLayer", this.moveLayer, this);
            EventBus.on("addLayerToIndex", this.addLayerToIndex, this);
            EventBus.on("zoomToExtent", this.zoomToExtent, this);
            EventBus.on("updatePrintPage", this.updatePrintPage, this);
            EventBus.on("getMap", this.getMap, this); // getriggert aus MouseHoverPopup
            EventBus.on("setMeasurePopup", this.setMeasurePopup, this); // warte auf Fertigstellung des MeasurePopup für Übergabe

            this.set("view", MapView.get("view"));

            this.set("map", new ol.Map({
                logo: null,
                renderer: "canvas",
                target: "map",
                view: this.get("view"),
                controls: [],
                interactions: ol.interaction.defaults({altShiftDragRotate: false, pinchRotate: false})
            }));

            this.get("map").on("pointermove", this.pointerMoveOnMap);
            // Wenn Touchable, dann implementieren eines Touchevents. Für iPhone nicht nötig, aber auf Android.
            // if (ol.has.TOUCH && navigator.userAgent.toLowerCase().indexOf("android") !== -1) {
            //     var startx = 0,
            //         starty = 0;
            //
            //     this.get("map").getViewport().addEventListener("touchstart", function (e) {
            //         var touchobj = e.changedTouches[0]; // reference first touch point (ie: first finger)
            //
            //         startx = parseInt(touchobj.clientX, 10); // get x position of touch point relative to left edge of browser
            //         // e.preventDefault();
            //     }, false);
            //     this.get("map").getViewport().addEventListener("touchend", function (e) {
            //         var touchobj = e.changedTouches[0], // reference first touch point (ie: first finger)
            //         // Calculate if there was "significant" movement of the finger
            //         movementX = Math.abs(startx - touchobj.clientX),
            //         movementY = Math.abs(starty - touchobj.clientY);
            //
            //         if (movementX < 5 || movementY < 5) {
            //             var x = _.values(_.pick(touchobj, "pageX"))[0],
            //                 y = _.values(_.pick(touchobj, "pageY"))[0],
            //                 coordinates = this.get("map").getCoordinateFromPixel([x, y]);
            //             // TODO: nicht nur GFIParams setzen sondern auch messen implementieren
            //             // this.setGFIParams({coordinate: coordinates});
            //         }
            //         // e.preventDefault(); //verhindert das weitere ausführen von Events. Wird z.B. zum schließen des GFI-Popup aber benötigt.
            //     }.bind(this), false);
            // }
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
            EventBus.trigger("setMap", this.get("map"));
        },

        activateClick: function (tool) {
            if (tool === "coord") {
                this.get("map").un("click", this.setGFIParams, this);
                this.get("map").on("click", this.setPositionCoordPopup, this);
                // this.get("map").un("pointermove", this.pointerMoveOnMap);
            }
            else if (tool === "gfi") {
                this.get("map").un("click", this.setPositionCoordPopup, this);
                this.get("map").on("click", this.setGFIParams, this);
                // this.get("map").un("pointermove", this.pointerMoveOnMap);
            }
            else if (tool === "measure") {
                this.get("map").un("click", this.setPositionCoordPopup, this);
                this.get("map").un("click", this.setGFIParams, this);
                // this.get("map").on("pointermove", this.pointerMoveOnMap);
            }
            else if (tool === "draw" || tool === "record") {
                this.get("map").un("click", this.setPositionCoordPopup, this);
                this.get("map").un("click", this.setGFIParams, this);
                // this.get("map").un("pointermove", this.pointerMoveOnMap);
            }
        },

        pointerMoveOnMap: function (evt) {
            EventBus.trigger("pointerMoveOnMap", evt);
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
        removeLastLayer: function () {
            var layer = this.get("map").getLayers().getArray()[this.get("map").getLayers().getArray().length - 1];

            this.get("map").removeLayer(layer);
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

            // Laden des Layers überwachen
            if (!_.isUndefined(layer) && _.isFunction(layer.getSource) && _.isFunction(layer.getSource().setTileLoadFunction)) {
                this.getLayerLoadStatus(layer);
            }

        },
        // Gibt eine loadTile Funtktion zurück, die die geladenen Tiles zählt und dann die ursprüngliche tileLoadFunktion aufruft
        // Wenn alle Tiles fertig geladen sind wird das Loading gif ausgeblendet
        getTileLoadFunction: function (numLoadingTiles, tileLoadFn, source) {
            return function (tile, src) {
                    if (numLoadingTiles === 0) {
                        Util.showLoader();
                    }
                    ++numLoadingTiles;
                    var image = tile.getImage();

                    image.onload = image.onerror = function () {
                        --numLoadingTiles;
                        if (numLoadingTiles === 0) {
                            Util.hideLoader();
                            // Damit das Loading gif nur beim intitialen Laden kommt (und nicht beim zoom/pan wieder alte loadtile funktion herstellen)
                            source.setTileLoadFunction(tileLoadFn);
                        }
                    };
                tileLoadFn(tile, src);
                };
        },
        // Setzt eine neue "setTileLoadFunction" an die source der übergebenen Layer
        getLayerLoadStatus: function (layer) {
            var context = this;

            layer.getSource().setTileLoadFunction((function () {
                var numLoadingTiles = 0,
                tileLoadFn = layer.getSource().getTileLoadFunction();

                return context.getTileLoadFunction(numLoadingTiles, tileLoadFn, layer.getSource());
            })());
        },

        /**
        *
        */
        setPositionCoordPopup: function (evt) {
            // Abbruch, wenn auf SearchMarker x geklickt wird.
            if (this.checkInsideSearchMarker(evt.pixel[1], evt.pixel[0]) === true) {
                return;
            }
            else {
                EventBus.trigger("setPositionCoordPopup", evt.coordinate);
            }
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
            var visibleWMSLayerList = Radio.request("LayerList", "getLayerListWhere", {visibility: true, typ: "WMS"}),
                visibleGeoJSONLayerList = Radio.request("LayerList", "getLayerListWhere", {visibility: true, typ: "GeoJSON"}),
                visibleLayerList = _.union(visibleWMSLayerList, visibleGeoJSONLayerList),
                gfiParams = [],
                scale = _.findWhere(MapView.get("options"), {resolution: this.get("view").getResolution()}).scale,
                eventPixel = this.get("map").getEventPixel(evt.originalEvent),
                isFeatureAtPixel = this.get("map").hasFeatureAtPixel(eventPixel),
                resolution = this.get("view").getResolution(),
                projection = this.get("view").getProjection(),
                coordinate = evt.coordinate;

            // Abbruch, wenn auf SearchMarker x geklickt wird.
            if (this.checkInsideSearchMarker(eventPixel[1], eventPixel[0]) === true) {
                return;
            }
            // WFS
            if (isFeatureAtPixel === true) {
                var layerByFeature,
                    visibleWFSLayerList = Radio.request("LayerList", "getLayerListWhere", {visibility: true, typ: "WFS"});

                this.get("map").forEachFeatureAtPixel(eventPixel, function (featureAtPixel) {
                    // cluster-source
                    if (_.has(featureAtPixel.getProperties(), "features") === true) {
                        _.each(featureAtPixel.get("features"), function (feature) {
                            layerByFeature = _.find(visibleWFSLayerList, function (layer) {
                                return layer.get("source").getSource().getFeatureById(feature.getId());
                            });
                            if (_.isUndefined(layerByFeature) === false) {
                                gfiParams.push({
                                    typ: "WFS",
                                    feature: feature,
                                    attributes: layerByFeature.get("gfiAttributes"),
                                    name: layerByFeature.get("name"),
                                    ol_layer: layerByFeature.get("layer")
                                });
                            }
                        });
                    }
                    // vector-source
                    else {
                        layerByFeature = _.find(visibleWFSLayerList, function (layer) {
                            return layer.get("source").getFeatureById(featureAtPixel.getId());
                        });
                        gfiParams.push({
                            typ: "WFS",
                            feature: featureAtPixel,
                            attributes: layerByFeature.get("gfiAttributes"),
                            name: layerByFeature.get("name"),
                            ol_layer: layerByFeature.get("layer")
                        });
                    }
                });
            }

            // WMS und GeoJSON
            _.each(visibleLayerList, function (element) {
                if (element.get("typ") !== "GROUP") {
                    var gfiAttributes = element.get("gfiAttributes");

                    if (_.isObject(gfiAttributes) || _.isString(gfiAttributes) && gfiAttributes.toUpperCase() !== "IGNORE") {
                        if (element.get("typ") === "WMS") {
                            var gfiURL = element.get("source").getGetFeatureInfoUrl(
                                coordinate, resolution, projection,
                                {INFO_FORMAT: element.get("infoFormat") || "text/xml"}
                            );

                            gfiParams.push({
                                typ: "WMS",
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
                                var gfiURL = layer.get("source").getGetFeatureInfoUrl(
                                    coordinate, resolution, projection,
                                    {INFO_FORMAT: layer.get("infoFormat") || "text/xml"}
                                );

                                gfiParams.push({
                                    typ: "WMS",
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
            EventBus.trigger("setGFIParams", [gfiParams, coordinate]);
        },
        zoomToExtent: function (extent) {
            this.get("view").fit(extent, this.get("map").getSize());
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
        }
    });

    return Map;
});
