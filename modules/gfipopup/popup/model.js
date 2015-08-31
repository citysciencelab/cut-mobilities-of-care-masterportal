define([
    "backbone",
    "eventbus",
    "openlayers",
    "config",
    "bootstrap/popover",
    "modules/gfipopup/gfiObjects/img/view",
    "modules/gfipopup/gfiObjects/video/view",
    "modules/gfipopup/gfiObjects/routing/view",
    "modules/gfipopup/gfiObjects/routable/view",
    "modules/gfipopup/themes/default/view",
    "modules/gfipopup/themes/mietenspiegel/view",
    "modules/core/util"
], function (Backbone, EventBus, ol, Config, Popover, ImgView, VideoView, RoutingView, RoutableView, DefaultTheme, MietenspiegelTheme, Util) {
    "use strict";
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
            EventBus.trigger("addOverlay", this.get("gfiOverlay")); // listnener in map.js
            EventBus.on("setGFIParams", this.setGFIParams, this); // trigger in map.js
        },
        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
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
                position = params[1],
                positionGFI = params[1],
                templateView;
            // Abfrage jedes Layers der von der map übermittelt wurde.
            _.each(sortedParams, function(visibleLayer, index, list) {
                gfiContent = null;
                switch (visibleLayer.typ) {
                    case 'WMS':
                        gfiContent = this.setWMSPopupContent(visibleLayer);
                        break;
                    case 'WFS':
                        gfiContent = this.setWFSPopupContent(visibleLayer.source, visibleLayer.style, position, visibleLayer.scale, visibleLayer.ol_layer.get('gfiAttributes'));
                        if (this.get("wfsCoordinate").length > 0) positionGFI = this.get("wfsCoordinate");
                        break;
                    case 'GeoJSON':
                        gfiContent = this.setGeoJSONPopupContent(visibleLayer.source, position, visibleLayer.scale);
                        break;
                }
                // Erzeugen eines TemplateModels anhand 'gfiTheme'
                _.each(gfiContent, function(layerresponse, index, list) {
                    switch (visibleLayer.ol_layer.get('gfiTheme')) {
                        case 'mietenspiegel':
                            templateView = new MietenspiegelTheme(visibleLayer, layerresponse);
                            break;
                        default:
                            templateView = new DefaultTheme(visibleLayer, layerresponse, positionGFI);
                            break;
                    }
                    pContent.push(templateView);
                    pTitles.push(visibleLayer.name);
                }, this);
            }, this);
            // Abspeichern der gesammelten Informationen
            if (pContent.length > 0) {
                this.get("gfiOverlay").setPosition(positionGFI);
                this.set("gfiContent", pContent);
                this.set("gfiTitles", pTitles);
                this.set("gfiCounter", pContent.length);
                this.set("coordinate", positionGFI);
            } else {
                EventBus.trigger("closeGFIParams", this);
            }
            $("#loader").hide();
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
            if (pX < pMinX || pX > pMaxX || pY < pMinY || pY > pMaxY) {
                return;
            } else {
                return [feature.get("gfiAttributes")];
            }
        },
        /**
         *
         */
        setWFSPopupContent: function (pSourceAllFeatures, pLayerStyle, pCoordinate, pScale, attributes) {
            // NOTE: Hier werden die Features auf ihre Sichtbarkeit untersucht, bevor das nächstgelegene Feature zurückgegeben wird
            var pSource = new ol.source.Vector(),
                pFeatures;

            if (pLayerStyle) {
                pSource.addFeatures(pSourceAllFeatures.getFeatures());
            } else {
                pSource.addFeatures(_.filter(pSourceAllFeatures.getFeatures(), function (feature) {
                    if (feature.getStyle()) {
                        if (feature.getStyle()[0].image_.getSrc() !== "../../img/blank.png") {
                            return feature;
                        }
                    }
                }));
            }
            pFeatures = pSource.getClosestFeatureToCoordinate(pCoordinate);

            if (!pFeatures) {
                return;
            }
            // 10 mm um Klickpunkt forEachFeatureInExtent
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
            } else {
                this.set("wfsCoordinate", pFeatures.getGeometry().getFirstCoordinate());
                var pQueryFeatures = [];

                if (pFeatures.getProperties().features) {
                    _.each(pFeatures.getProperties().features, function (element) {
                        pQueryFeatures.push(element);
                    });
                } else {
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
                    } else {
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
            } else {
                url = params.url;
            }

            // Für B-Pläne wird Feature_Count auf 3 gesetzt --> besser über ID (hier aber nicht vorhanden)
            if (params.name === "Festgestellte Bebauungspläne" || params.name === "Sportstätten") {
                data = "FEATURE_COUNT=3";
            }
            else if (params.name === "SUB Umringe Historischer Karten") {
                data = "FEATURE_COUNT=30";
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
                                    } else if (this.isValidValue(attribute.textContent)) {
                                        gfi[key] = attribute.textContent;
                                    }
                                }, this);

                                gfiList.push(gfi);
                            }, this);
                        }
                    } else { // OS (deegree, UMN, Geoserver) is parsed by ol-format
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
                            if (params.ol_layer.get('gfiAttributes') === "showAll") {
                                // beautify keys
                                _.each(preGfi, function (value, key) {
                                    var key;

                                    key = this.beautifyString(key);
                                    gfi[key] = value;
                                }, this);
                            } else {
                                // map object keys to gfiAttributes from layer model
                                _.each(preGfi, function (value, key) {
                                    key = params.ol_layer.get('gfiAttributes')[key];
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
         * Alle childTemplates im gfiContent müssen hier removed werden.
         * Das gfipopup.model wird nicht removed - nur reset.
         */
        removeChildObjects: function () {
            _.each(this.get('gfiContent'), function (element) {
                element.remove();
            }, this);
        }
    });

    return new GFIPopup();
});
