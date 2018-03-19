define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "proj4",
    "config",
    "backbone.radio"
], function (Backbone, Radio, ol, proj4, Config, Radio) {

    var OrientationModel = Backbone.Model.extend({
        defaults: {
            zoomMode: "once", // once oder always entsprechend Config
            firstGeolocation: true, // Flag, ob es sich um die erste geolocation handelt, damit "once" abgebildet werden kann.
            marker: new ol.Overlay({
                positioning: "center-center",
                stopEvent: false
            }),
            showPoi: false,
            poiDistances: [500, 1000, 2000],
            tracking: false, // Flag, ob derzeit getrackt wird.
            geolocation: null, // ol.geolocation wird bei erstmaliger Nutzung initiiert.
            position: "",
            isGeolocationDenied: false,
            isGeoLocationPossible: false
        },
        initialize: function () {
            var channel = Radio.channel("geolocation");

            channel.on({
                "removeOverlay": this.removeOverlay,
                "getPOI": this.getPOI,
                "sendPosition": this.sendPosition
            }, this);

            channel.reply({
                "isGeoLocationPossible": function () {
                    return this.getIsGeoLocationPossible();
                },
                "getPoiDistances": function () {
                    return this.getPoiDistances();
                },
                "getFeaturesInCircle": this.getVectorFeaturesInCircle
            }, this);

            this.listenTo(this, {
                "change:isGeoLocationPossible": function () {
                    channel.trigger("changedGeoLocationPossible", this.getIsGeoLocationPossible());
                }
            }, this);

            this.listenTo(Radio.channel("ModelList"), {
                "updateVisibleInMapList": this.checkWFS
            });

            this.setConfig();
            this.setIsGeoLocationPossible();
        },

        /**
         * Fügt das Element der ol.Overview hinzu. Erst nach render kann auf document.getElementById zugegriffen werden.
         */
        addElement: function () {
            this.getMarker().setElement(document.getElementById("geolocation_marker"));
        },

        /**
         * Übernimmt die Einträge der config.json
         */
        setConfig: function () {
            var config = Radio.request("Parser", "getItemByAttributes", {id: "orientation"}).attr;

            if (config.zoomMode) {
                this.setZoomMode(config.zoomMode);
            }

            if (config.poiDistances) {
                if (_.isArray(config.poiDistances) && config.poiDistances.length > 0) {
                    this.setPoiDistances(config.poiDistances);
                    this.setShowPoi(true);
                }
                else if (config.poiDistances === true) {
                    this.setShowPoi(true);
                }
            }
        },

        /*
        * Triggert die Standpunktkoordinate auf Radio
        */
        sendPosition: function () {
            if (this.get("tracking") === false) {
                this.listenToOnce(this, "change:position", function () {
                    Radio.trigger("geolocation", "position", this.get("position"));
                    this.untrack();
                });
                this.track();
            }
            else {
                Radio.trigger("geolocation", "position", this.get("position"));
            }
        },
        removeOverlay: function () {
            Radio.trigger("Map", "removeOverlay", this.getMarker());
        },
        untrack: function () {
            var geolocation = this.get("geolocation");

            geolocation.un ("change", this.positioning, this);
            geolocation.un ("error", this.onError, this);
            this.set("firstGeolocation", true);
            this.set("tracking", false);
            this.removeOverlay();
        },
        track: function () {
            var geolocation;

            if (this.getIsGeolocationDenied() === false) {
                Radio.trigger("Map", "addOverlay", this.getMarker());
                if (this.get("geolocation") === null) {
                    geolocation = new ol.Geolocation({tracking: true, projection: ol.proj.get("EPSG:4326")});
                    this.set("geolocation", geolocation);
                }
                else {
                    geolocation = this.get("geolocation");
                    this.positioning();
                }
                geolocation.on ("change", this.positioning, this);
                geolocation.on ("error", this.onError, this);
                this.set("tracking", true);
            }
            else {
                this.onError();
            }
        },
        positionMarker: function (position) {
            try {
                this.getMarker().setPosition(position);
            }
            catch (e) {
            }
        },
        zoomAndCenter: function (position) {
            Radio.trigger("MapView", "setCenter", position, 6);
        },
        positioning: function () {
            var geolocation = this.get("geolocation"),
                position = geolocation.getPosition(),
                firstGeolocation = this.get("firstGeolocation"),
                zoomMode = this.get("zoomMode"),
                centerPosition = proj4(proj4("EPSG:4326"), proj4(Config.view.epsg), position);

            // speichere Position
            this.set("position", centerPosition);

            // Bildschirmnavigation
            if (zoomMode === "once") {
                if (firstGeolocation === true) {
                    this.positionMarker(centerPosition);
                    this.zoomAndCenter(centerPosition);
                    this.set("firstGeolocation", false);
                }
                else {
                    this.positionMarker(centerPosition);
                }
            }
            else {
                this.positionMarker(centerPosition);
                this.zoomAndCenter(centerPosition);
            }
        },
        onError: function () {
            Radio.trigger("Alert", "alert", {
                text: "<strong>Lokalisierung nicht verfügbar: </strong>",
                kategorie: "alert-danger"
            });
            this.setIsGeolocationDenied(true);
            this.untrack();
        },
        onPOIError: function (evt) {
            Radio.trigger("Alert", "alert", {
                text: "<strong>'In meiner Nähe' nicht verfügbar: </strong>" + evt.message,
                kategorie: "alert-danger"
            });
            this.untrack();
            $("#loader").hide();
        },
        trackPOI: function () {
            var geolocation;

            Radio.trigger("Map", "addOverlay", this.getMarker());
            if (this.get("geolocation") === null) {
                geolocation = new ol.Geolocation({tracking: true, projection: ol.proj.get("EPSG:4326")});
                this.set("geolocation", geolocation);
            }
            else {
                geolocation = this.get("geolocation");
                this.callGetPOI();
            }
            geolocation.once ("change", this.callGetPOI, this);
            geolocation.once ("error", this.onPOIError, this);
        },
        untrackPOI: function () {
            var geolocation = this.get("geolocation");

            geolocation.un ("change", this.callGetPOI, this);
            geolocation.un ("error", this.onPOIError, this);
        },
        callGetPOI: function () {
            Radio.trigger("POI", "showPOIModal");
        },

        /**
         * Ermittelt die Features aus Vektprlayern in einem Umkreis zur Position. Funktioniert auch mit Clusterlayern.
         * @param  {integer} distance Umkreis
         * @return {Array}          Array of ol.features
         */
        getVectorFeaturesInCircle: function (distance) {
            var geolocation = this.get("geolocation"),
                position = geolocation.getPosition(),
                centerPosition = proj4(proj4("EPSG:4326"), proj4(Config.view.epsg), position),
                circle = new ol.geom.Circle(centerPosition, distance),
                circleExtent = circle.getExtent(),
                visibleWFSLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
                featuresAll = [],
                features = [];

            _.each(visibleWFSLayers, function (layer) {
                if (layer.has("layerSource") === true) {
                    features = layer.get("layerSource").getFeaturesInExtent(circleExtent);
                    _.each(features, function (feat) {
                        feat = _.extend(feat, {
                            styleId: layer.get("styleId"),
                            dist2Pos: this.getDistance(feat, centerPosition)
                        });
                    }, this);
                    featuresAll = _.union(features, layer.get("layerSource").getFeaturesInExtent(circleExtent));
                }
            }, this);

            return featuresAll
        },

        /**
         * Ermittelt die Entfernung des Features zur Geolocation auf Metergenauigkeit
         * @param  {ol.feature} feat Feature
         * @return {float}      Entfernung
         */
        getDistance: function (feat, centerPosition) {
            var closestPoint = feat.getGeometry().getClosestPoint(centerPosition),
                line = new ol.geom.LineString([closestPoint, centerPosition]),
                dist = Math.round(line.getLength() * 1) / 1;

            return dist;
        },

        /**
         * Setter Methode für das Attribut zoomMode
         * @param {String} value - once oder always
         */
        setZoomMode: function (value) {
            this.set("zoomMode", value);
        },

        // setter für showPoi
        setShowPoi: function (value) {
            this.set("showPoi", value);
        },
        // getter für showPoi
        getShowPoi: function () {
            return this.get("showPoi");
        },

        setIsGeolocationDenied: function (value) {
            this.set("isGeolocationDenied", value);
            this.set("isGeoLocationPossible", false);
        },

        getIsGeolocationDenied: function () {
            return this.get("isGeolocationDenied");
        },

        getIsGeoLocationPossible: function () {
            return this.get("isGeoLocationPossible");
        },
        setIsGeoLocationPossible: function () {
            this.set("isGeoLocationPossible", window.location.protocol === "https:" || _.contains(["localhost","127.0.0.1"], window.location.hostname));
        },

        // getter for poiDistances
        getPoiDistances: function () {
            return this.get("poiDistances");
        },
        // setter for poiDistances
        setPoiDistances: function (value) {
            this.set("poiDistances", value);
        },

        // getter for marker
        getMarker: function () {
            return this.get("marker");
        },
        // setter for marker
        setMarker: function (value) {
            this.set("marker", value);
        }
    });

    return new OrientationModel();
});
