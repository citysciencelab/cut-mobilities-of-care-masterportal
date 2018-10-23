/* eslint-disable one-var,vars-on-top */
define(function (require) {

    var ol = require("openlayers"),
        vcs = require("oblique"),
        ObliqueMap;

    ObliqueMap = Backbone.Model.extend({

        defaults: {
            active: false
        },
        initialize: function () {
            var channel = Radio.channel("ObliqueMap");

            this.pausedInteractions = [];

            channel.reply({
                "isActive": function () {
                    return this.get("active");
                },
                "getOLMap": function () {
                    return this.get("map");
                },
                "getCurrentImage": this.getCurrentImage
            }, this);

            channel.on({
                "activate": this.activate,
                "deactivate": this.deactivate,
                "registerLayer": this.registerLayer,
                "activateLayer": this.activateNewLayer,
                "changeDirection": this.changeDirection,
                "setCenter": this.setCenter
            }, this);
            this.layers = [];
            /** @type {vcs.oblique.Direction | null} */
            this.currentDirection = null;

            /** @type {vcs.oblique.Collection | null} */
            this.currentCollection = null;

            this.currentLayer = null;

            /** @type {boolean} */
            this.switchOnEdge = true;

            /** @type {number} */
            this.switchThreshold = 0.0;

            this.listenerKeys = [];

            this.listenTo(Radio.channel("MapView"), {
                "centerSet": this.setCenter
            });
        },
        isActive: function () {
            return this.get("active");
        },
        getCurrentImage: function () {
            return this.currentDirection && this.currentDirection.currentImage;
        },
        activateNewLayer: function (layer) {
            if (this.currentDirection && this.isActive()) {
                return this.getCenter().then(function (center) {
                    var resolution = this.currentDirection.currentView.view.getResolution();

                    return this.activateLayer(layer, center.coords, resolution);
                }.bind(this));
            }
            return Promise.reject(new Error("there is no currentDirection"));
        },
        activateLayer: function (layer, coordinate, resolution) {
            if (this.currentLayer) {
                this.currentLayer.deactivateLayer();
                if (this.currentDirection) {
                    this.currentDirection.deactivate();
                }
                this.currentCollection = null;
                this.currentDirection = null;
            }
            this.currentLayer = layer;
            return layer.getObliqueCollection().then(function (collection) {
                this.currentCollection = collection;
                var direction = collection.directions[vcs.oblique.ViewDirection.NORTH];

                if (!direction) {
                    var key = Object.keys(collection.directions)[0];

                    direction = collection.directions[key];
                }
                if (direction) {
                    this.currentDirection = direction;
                    return direction.activate(this.get("map"), coordinate, resolution).then(function () {
                        Radio.trigger("ObliqueMap", "newImage", direction.currentImage);
                    });
                }
                return Promise.reject(new Error("there is no direction"));
            }.bind(this));
        },
        registerLayer: function (layer) {
            this.layers.push(layer);
        },
        deactivate: function () {
            var interactions, map2D;

            map2D = Radio.request("Map", "getMap");

            if (this.isActive()) {
                this.getCenter().then(function (center) {
                    var resolution,
                        resolutionFactor = this.currentLayer.get("resolution");

                    resolution = this.currentDirection.currentView.view.getResolution() / resolutionFactor;

                    this.container.style.visibility = "hidden";
                    this.set("active", false);
                    map2D.getOverlayContainer().classList.remove("olcs-hideoverlay");
                    map2D.getOverlayContainerStopEvent().classList.remove("olcs-hideoverlay");
                    ol.Observable.unByKey(this.listenerKeys);
                    interactions = map2D.getInteractions();
                    this.pausedInteractions.forEach((interaction) => {
                        interactions.push(interaction);
                    });
                    this.pausedInteractions.length = 0;
                    this.listenerKeys.length = 0;
                    Radio.trigger("MapView", "setCenter", center.coords);
                    Radio.trigger("MapView", "setConstrainedResolution", resolution, 0);
                    Radio.trigger("Map", "change", "2D");
                }.bind(this));

            }
        },

        changeDirection: function (directionName) {
            var direction = vcs.oblique.viewDirectionNames[directionName];

            if (!direction || direction === this.currentDirection.direction) {
                return;
            }
            var newDirection = this.currentCollection.directions[direction];

            if (newDirection) {
                this.getCenter().then(function (center) {
                    var resolution = this.currentDirection.currentView.view.getResolution();

                    this.currentDirection.deactivate();
                    this.currentDirection = newDirection;
                    newDirection.activate(this.get("map"), center.coords, resolution).then(function () {
                        Radio.trigger("ObliqueMap", "newImage", newDirection.currentImage);
                    });
                }.bind(this));
            }
        },
        /**
         * sets the center to the given coordinate
         * @param {ol.Coordinate} coordinate -
         * @param {number} resolution - optional
         * @return {Promise} -
         */
        setCenter: function (coordinate, resolution) {
            if (this.currentDirection) {
                var oldImageID = this.currentDirection.currentImage.id,
                    resolutionFactor = this.currentLayer.get("resolution");
                var useResolution = resolution ? resolution * resolutionFactor : this.get("map").getView().getResolution();

                return this.currentDirection.setView(coordinate, useResolution).then(function () {
                    if (this.currentDirection.currentImage) {
                        if (this.currentDirection.currentImage.id !== oldImageID) {
                            Radio.trigger("ObliqueMap", "newImage", this.currentDirection.currentImage);
                        }
                    }
                }.bind(this));
            }
            return Promise.reject(new Error("there is no currentDirection"));
        },

        /**
         * returns the center coordiantes of the current view
         * @returns {Promise<{coords: ol.Coordinate, estimate: (boolean|undefined)}>} -
         */
        getCenter: function () {
            var center;

            if (this.currentCollection && this.currentDirection && this.currentDirection.currentImage) {
                center = this.get("map").getView().getCenter();
                return vcs.oblique.transformFromImage(this.currentDirection.currentImage, center, {
                    dataProjection: this.get("projection")
                });
            }
            return Promise.reject(new Error("there is no currentImage"));
        },

        activate: function () {
            var fillArea, oc, containerAttribute, map2D, interactions;

            if (!this.isActive()) {
                var center = Radio.request("MapView", "getCenter");
                var resolution = Radio.request("MapView", "getResolution");

                map2D = Radio.request("Map", "getMap");
                if (!this.container) {
                    fillArea = "position:absolute;top:0;left:0;width:100%;height:100%;";
                    oc = map2D.getViewport().querySelector(".ol-overlaycontainer");
                    this.container = document.createElement("DIV");
                    containerAttribute = document.createAttribute("style");
                    containerAttribute.value = fillArea + "visibility:hidden;";
                    this.container.setAttributeNode(containerAttribute);

                    if (oc && oc.parentNode) {
                        oc.parentNode.insertBefore(this.container, oc);
                    }

                    this.set("map", new ol.Map({
                        logo: null,
                        target: this.container,
                        controls: [],
                        interactions: ol.interaction.defaults({altShiftDragRotate: false, pinchRotate: false})
                    }));
                    this.get("map").on("postrender", this.postRenderHandler.bind(this));
                    this.get("map").on("click", this.reactToClickEvent.bind(this));
                }
                interactions = map2D.getInteractions();
                interactions.forEach((el) => {
                    this.pausedInteractions.push(el);
                });
                if (this.currentLayer && this.currentCollection && this.currentDirection) {
                    interactions.clear();
                    this.listenerKeys.push(interactions.on("add", function (event) {
                        this.pausedInteractions.push(event.element);
                        interactions.clear();
                    }.bind(this)));
                    map2D.getOverlayContainer().classList.add("olcs-hideoverlay");
                    map2D.getOverlayContainerStopEvent().classList.add("olcs-hideoverlay");
                    this.set("active", true);
                    this.container.style.visibility = "visible";
                    this.setCenter(center, resolution.resolution).then(function () {
                        Radio.trigger("Map", "change", "Oblique");
                    });
                }
                else {
                    // load first Layer which is active on startup or
                    // otherwise just take the first layer, abort if no layer exists.
                    var layer = null;

                    for (var i = 0; i < this.layers.length; i++) {
                        if (this.layers[i].get("isVisibleInMap")) {
                            layer = this.layers[i];
                            break;
                        }
                    }
                    if (!layer && this.layers.length > 0) {
                        layer = this.layers[0];
                    }

                    if (layer) {
                        interactions.clear();
                        this.listenerKeys.push(interactions.on("add", function (event) {
                            this.pausedInteractions.push(event.element);
                            interactions.clear();
                        }.bind(this)));
                        map2D.getOverlayContainer().classList.add("olcs-hideoverlay");
                        map2D.getOverlayContainerStopEvent().classList.add("olcs-hideoverlay");
                        this.set("active", true);
                        this.container.style.visibility = "visible";

                        this.activateLayer(layer, center, resolution.resolution).then(function () {
                            layer.set("isVisibleInMap", true);
                            layer.set("isSelected", true);
                            Radio.trigger("Map", "change", "Oblique");
                        });
                    }
                    // no oblique layer, obliqueMap is not loaded.
                }

            }
        },
        postRenderHandler: function () {
            if (this.currentDirection && this.switchOnEdge) {
                var coord = this.get("map").getView().getCenter();
                var currentImage = this.currentDirection.currentImage;
                var ratioLower = this.switchThreshold;
                var ratioUpper = 1 - ratioLower;

                if (
                    !currentImage || (
                        coord[0] / currentImage.size[0] > ratioLower &&
                        coord[0] / currentImage.size[0] < ratioUpper &&
                        coord[1] / currentImage.size[1] > ratioLower &&
                        coord[1] / currentImage.size[1] < ratioUpper
                    )
                ) {
                    return;
                }

                if (currentImage.averageHeight === null) {
                    return;
                }
                this.currentDirection.postRenderHandler(coord);
            }
        },
        reactToClickEvent: function (event) {
            if (this.currentDirection && this.currentDirection.currentImage) {
                vcs.oblique.transformFromImage(this.currentDirection.currentImage, event.coordinate, {
                    dataProjection: this.get("projection")
                }).then(function (coords) {
                    Radio.trigger("ObliqueMap", "clicked", coords.coords);
                });
            }
        }
    });

    return ObliqueMap;
});
