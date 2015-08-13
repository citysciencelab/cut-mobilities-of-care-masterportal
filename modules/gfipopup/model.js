define([
    "backbone",
    "eventbus",
    "openlayers",
    "config",
    "bootstrap/popover",
    "modules/gfipopup/img/view",
    "modules/gfipopup/video/view",
    "modules/core/util"
], function (Backbone, EventBus, ol, Config, Popover, ImgView, VideoView, Util) {

    var GFIPopup = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            gfiOverlay: new ol.Overlay({ element: $("#gfipopup") }), // ol.Overlay
            gfiContent: [],
            gfiTitles: [],
            wfsCoordinate: [],
            gfiURLs: [],
            gfiCounter: 0,
            isCollapsed: false,
            isVisible: false
        },
        /**
         *
         */
        initialize: function () {
            this.set("element", this.get("gfiOverlay").getElement());
            this.listenTo(this, "change:isPopupVisible", this.sendGFIForPrint);
            EventBus.on("mapView:replyProjection", this.setProjection, this);
            EventBus.trigger("mapView:requestProjection");
            EventBus.trigger("addOverlay", this.get("gfiOverlay")); // listnener in map.js
            EventBus.on("setGFIParams", this.setGFIParams, this); // trigger in map.js
            this.setRouteLayer();
        },

        setRouteLayer: function () {
            this.set("routeLayer", new ol.layer.Vector({
                source: new ol.source.Vector({
                    projection: this.get("projection")
                }),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "blue",
                        width: 5
                    })
                })
            }));
        },

        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            // destroye child-Views/Templates, z.B. imgTemplate
            _.each(this.get('gfiContent'), function(layer) {
                _.each(layer, function(child) {
                    // only call remove on Backbone.View objects or extended Backbone.View objects
                    if (child instanceof Backbone.View) {
                        child.remove();
                    }
                });
            });
            this.get("element").popover("destroy");
            this.set("isPopupVisible", false);
            this.unset("coordinate", {silent: true});
        },
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            $("#popovermin").fadeOut(500, function () {
                $("#popovermin").remove();
            });
            this.get("element").popover("show");
            this.set("isPopupVisible", true);
        },
        /**
         * params: [0] = Objekt mit name und url; [1] = Koordinate
         */
        setGFIParams: function (params) {
            $("#loader").show();
            this.set("wfsCoordinate", []);
            // Anzeige der GFI und GF in alphabetischer Reihenfolge der Layernamen
            var sortedParams = _.sortBy(params[0], "name"),
                gfiContent,
                pContent = [],
                pTitles = [],
                pRoutables = [];

            for (var i = 0; i < sortedParams.length; i += 1) {
                if (sortedParams[i].typ === "WMS") {
                    gfiContent = this.setWMSPopupContent(sortedParams[i]);
                }
                else if (sortedParams[i].typ === "WFS") {
                    gfiContent = this.setWFSPopupContent(sortedParams[i].source, sortedParams[i].style, params[1], sortedParams[i].scale, sortedParams[i].attributes);
                }
                else if (sortedParams[i].typ === "GeoJSON") {
                    gfiContent = this.setGeoJSONPopupContent(sortedParams[i].source, params[1], sortedParams[i].scale);
                }

                if (gfiContent !== undefined) {
                    _.each(gfiContent, function (content) {
                        pContent.push(content);
                        pTitles.push(sortedParams[i].name);
                        // Nur wenn Config.menu.routing==true, werden die einzelnen Routable-Informationen ausgewertet und im Template abgefragt
                        if (Config.menu.routing && Config.menu.routing === true) {
                            pRoutables.push(sortedParams[i].routable);
                        }
                    });
                }
            }
            pContent = this.replaceValuesWithObjects(pContent);
            if (pContent.length > 0) {
                var position;

                if (this.get("wfsCoordinate").length > 0) {
                    position = this.get("wfsCoordinate");
                }
                else {
                    position = params[1];
                }
                this.get("gfiOverlay").setPosition(position);
                this.set("gfiContent", pContent);
                this.set("gfiTitles", pTitles);
                this.set("gfiRoutables", pRoutables);
                this.set("gfiCounter", pContent.length);
                this.set("coordinate", position);
            }
            else {
                EventBus.trigger("closeGFIParams", this);
            }
            $("#loader").hide();
        },

        replaceValuesWithObjects: function (pContent) {
            _.each(pContent, function (element, index) {
                _.each(element, function (val, key) {
                    if (key === "Bild") {
                        val = new ImgView(val);
                        element[key] = val;
                    } else if (key === "video") {
                        val = new VideoView(val);
                        element[key] = val;
                    }
                });
                pContent[index] = element;
            });
            return pContent;
        },

        setGeoJSONPopupContent: function (source, coordinate, scale) {

            var feature = source.getClosestFeatureToCoordinate(coordinate),
                pMaxDist = 0.002 * scale, // 1 cm um Klickpunkt forEachFeatureInExtent
                pExtent = feature.getGeometry().getExtent(),
                pX = coordinate[0],
                pY = coordinate[1],
                pMinX = pExtent[0] - pMaxDist,
                pMaxX = pExtent[2] + pMaxDist,
                pMinY = pExtent[1] - pMaxDist,
                pMaxY = pExtent[3] + pMaxDist;
                // console.log(_.omit(feature.getProperties(), function (value) {
                //     return _.isObject(value);
                // }));
                // console.log(feature.get("gfiAttributes"));
            if (pX < pMinX || pX > pMaxX || pY < pMinY || pY > pMaxY) {
                return;
            }
            else {
                return [feature.get("gfiAttributes")];
            }
        },

        /**
         *
         */
        setWFSPopupContent: function (pSourceAllFeatures, pLayerStyle, pCoordinate, pScale, attributes) {
            // NOTE: Hier werden die Features auf ihre Sichtbarkeit untersucht, bevor das nächstgelegene Feature zurückgegeben wird
            var pSource = new ol.source.Vector;

            if (pLayerStyle) {
                pSource.addFeatures(pSourceAllFeatures.getFeatures());
            }
            else {
                pSource.addFeatures(_.filter(pSourceAllFeatures.getFeatures(), function (feature) {
                    if (feature.getStyle()) {
                        if (feature.getStyle()[0].image_.getSrc() !== "../../img/blank.png") {
                            return feature;
                        }
                    }
                }));
            }
            var pFeatures = pSource.getClosestFeatureToCoordinate(pCoordinate);

            if (!pFeatures) {
                return;
            }
            // 1 cm um Klickpunkt forEachFeatureInExtent
            var pMaxDist = 0.01 * pScale,
                pExtent = pFeatures.getGeometry().getExtent(),
                pX = pCoordinate[0],
                pY = pCoordinate[1],
                pMinX = pExtent[0] - pMaxDist,
                pMaxX = pExtent[2] + pMaxDist,
                pMinY = pExtent[1] - pMaxDist,
                pMaxY = pExtent[3] + pMaxDist;

            if (pX < pMinX || pX > pMaxX || pY < pMinY || pY > pMaxY) {
                return;
            }
            else {
                this.set("wfsCoordinate", pFeatures.getGeometry().getFirstCoordinate());
                var pQueryFeatures = [];

                if (pFeatures.getProperties().features) {
                    _.each(pFeatures.getProperties().features, function (element) {
                        pQueryFeatures.push(element);
                    });
                }
                else {
                    pQueryFeatures.push(pFeatures);
                }
                var pgfi = [];

                _.each(pQueryFeatures, function (element) {
                    var gfi = {},
                        pAttributes = element.getProperties();

                    if (attributes === "showAll") {
                        _.each(pAttributes, function (value, key) {
                            var keyArray = [],
                                valArray = [],
                                newgfi;

                            key = key.substring(0, 1).toUpperCase() + key.substring(1).replace("_", " ");
                            keyArray.push(key);
                            if (_.isNumber(value) || _.isBoolean(value)) {
                                value = value.toString();
                            }
                            if (!value || !_.isString(value)) {
                                return;
                            }
                            valArray.push(value);
                            newgfi = _.object(keyArray, valArray);
                            gfi = _.extend(gfi, newgfi);
                        });
                    }
                    else {
                        _.each(attributes, function (value, key) {
                            var pAttributeValue = _.values(_.pick(pAttributes, key))[0];

                            if (pAttributeValue) {
                                var key = [],
                                    val = [],
                                    newgfi;

                                key.push(value);
                                val.push(pAttributeValue);
                                newgfi = _.object(key, val);
                                gfi = _.extend(gfi, newgfi);
                            }
                        });
                    }
                    pgfi.push(gfi);
                });
                return pgfi;
            }
        },
        setWMSPopupContent: function (params) {
            var url, data, pgfi = [];

            if (params.url.search(location.host) === -1) {
                url = Util.getProxyURL(params.url);
            }
            else {
                url = params.url;
            }

            // Für B-Pläne wird Feature_Count auf 3 gesetzt
            if (params.name === "Festgestellte Bebauungspläne" || params.name === "Sportstätten") {
                data = "FEATURE_COUNT=3";
            }
            else {
                data = "";
            }

            $.ajax({
                url: url,
                data: data,
                async: false,
                type: "GET",
                context: this, // das model
                success: function (data) {
                    var gfiList = [],
                        gfiFormat ,
                        gfiFeatures;

                    // handle non text/xml responses arriving as string
                    if (_.isString(data)) {
                        data = $.parseXML(data);
                    }

                    // parse result, try built-in ol-format first
                    gfiFormat = new ol.format.WMSGetFeatureInfo();
                    gfiFeatures = gfiFormat.readFeatures(data, {
                        dataProjection: Config.view.projection
                    });

                    // ESRI is not parsed by the ol-format
                    if (_.isEmpty(gfiFeatures)) {
                        if (data.getElementsByTagName("FIELDS")[0] !== undefined) {
                            _.each(data.getElementsByTagName("FIELDS"), function (element) {
                                var gfi = {};

                                _.each(element.attributes, function (attribute) {
                                    var key = attribute.localName;

                                    if (this.isValidValue(attribute.value)) {
                                        gfi[key] = attribute.value;
                                    }
                                    else if (this.isValidValue(attribute.textContent)) {
                                        gfi[key] = attribute.textContent;
                                    }
                                }, this);

                                gfiList.push(gfi);
                            }, this);
                        }
                    }
                    // OS (deegree, UMN, Geoserver) is parsed by ol-format
                    else {
                        _.each(gfiFeatures, function (feature) {
                            gfiList.push(feature.getProperties());
                        });
                    }

                    if (gfiList) {
                        _.each(gfiList, function (element) {
                            var preGfi = {},
                                gfi = {};

                            // get rid of invalid keys and keys with invalid values; trim values
                            _.each(element, function (value, key) {
                                if (this.isValidKey(key) && this.isValidValue(value)) {
                                    preGfi[key] = value.trim();
                                }
                            }, this);

                            if (params.attributes === "showAll") {
                                // beautify keys
                                _.each(preGfi, function (value, key) {
                                    var key;

                                    key = this.beautifyString(key);
                                    gfi[key] = value;
                                }, this);
                            }
                            else {
                                // map object keys to gfiAttributes from layer model
                                _.each(preGfi, function (value, key) {
                                    key = params.attributes[key];
                                    if (key) {
                                        gfi[key] = value;
                                    }
                                });
                            }
                            if (_.isEmpty(gfi) !== true) {
                                pgfi.push(gfi);
                            }
                        }, this);
                    }
                },
                error: function (jqXHR, textStatus) {
                    alert("Ajax-Request " + textStatus);
                }
            });
            return pgfi;
        },
        isValidKey: function (key) {
            var invalidKeys = ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID"];

            if (_.indexOf(invalidKeys, key.toUpperCase()) !== -1) {
                return false;
            }
            return true;
        },
        /** helper function: check, if str has a valid value */
        isValidValue: function (str) {
            if (str && _.isString(str) && str !== "" && str.toUpperCase() !== "NULL") {
                return true;
            }
            return false;
        },
        /** helper function: first letter upperCase, _ becomes " " */
        beautifyString: function (str) {
                return str.substring(0, 1).toUpperCase() + str.substring(1).replace("_", " ");
        },
        sendGFIForPrint: function () {
            EventBus.trigger("gfiForPrint", [this.get("gfiContent")[0], this.get("isPopupVisible")]);
        },

        /**
         * Enfernt den "Route-Layer" von der Karte.
         */
        clearRoute: function () {
            this.get("routeLayer").getSource().clear();
            EventBus.trigger("removeLayer", this.get("routeLayer"));
        },

        /**
         * Zeigt die ausgewählte Route.
         * @param  {String} target - Ziel der Route
         */
        showRoute: function (target) {
            var gfiWithRoute,
                route,
                feature;

            // Wählt der Route für das Ziel aus
            switch (target) {
                case "AD Horster Dreieck": {
                    route = "Route6";
                    break;
                }
                case "AD Buchholzer Dreieck": {
                    route = "Route5";
                    break;
                }
                case "AD HH-Nordwest": {
                    route = "Route4";
                    break;
                }
                case "Hafen AS HH-Waltershof": {
                    route = "Route3";
                    break;
                }
                case "Arenen AS HH-Volkspark": {
                    route = "Route2";
                    break;
                }
                case "Flughafen Hamburg": {
                    route = "Route1";
                    break;
                }
            }

            // GFI welches die Routen enthält
            gfiWithRoute = _.find(this.get("gfiContent"), function (element) {
                return element[route] !== undefined;
            });

            // Feature mit der gesuchten Route
            feature = new ol.Feature({
                geometry: gfiWithRoute[route],
                name: target
            });
            this.get("routeLayer").getSource().clear();
            this.get("routeLayer").getSource().addFeature(feature);

            EventBus.trigger("addLayer", this.get("routeLayer"));
            EventBus.trigger("zoomToExtent", feature.getGeometry().getExtent());
        },

        setProjection: function (proj) {
            this.set("projection", proj);
        }
    });

    return new GFIPopup();
});
