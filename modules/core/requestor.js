define([
    "backbone",
    "eventbus",
    "openlayers",
    "modules/core/util",
    "config"
], function (Backbone, EventBus, ol, Util, Config) {

    var Requestor = Backbone.Model.extend({
        /**
         * params: [0] = Objekt mit name und url; [1] = Koordinate
         */
        requestFeatures: function (params) {
            Util.showLoader();
            this.set("wfsCoordinate", []);
            // Anzeige der GFI und GF in alphabetischer Reihenfolge der Layernamen
            var sortedParams = _.sortBy(params[0], "name"),
                gfiContent,
                pContent = [],
                pTitles = [],
                position = params[1],
                positionGFI = params[1];
            // Abfrage jedes Layers der von der map übermittelt wurde.
            _.each(sortedParams, function (visibleLayer, index, list) {
                gfiContent = null;
                switch (visibleLayer.ol_layer.get("typ")) {
                    case "WMS": {
                        gfiContent = this.setWMSPopupContent(visibleLayer);
                        break;
                    }
                    case "WFS": {
                        gfiContent = this.setWFSPopupContent(visibleLayer.source, visibleLayer.style, position, visibleLayer.scale, visibleLayer.ol_layer.get("gfiAttributes"));
                        if (this.get("wfsCoordinate").length > 0) {
                            positionGFI = this.get("wfsCoordinate");
                        };
                        break;
                    }
                    case "GeoJSON": {
                        gfiContent = this.setGeoJSONPopupContent(visibleLayer.feature);
                        break;
                    }
                }
                pContent.push({
                    content: gfiContent,
                    name: visibleLayer.name,
                    ol_layer: visibleLayer.ol_layer
                });
            }, this);
            Util.hideLoader();
            return [pContent, positionGFI];
        },

        setGeoJSONPopupContent: function (feature) {
            var featureList = [];

            if (_.has(feature.getProperties(), "gfiAttributes")) {
                featureList.push(feature.getProperties().gfiAttributes);
            }
            else {
                _.each(feature.getProperties().features, function (feature) {
                    featureList.push(feature.get("gfiAttributes"));
                });
            }
            return featureList;
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
            if (Config.feature_count) {
                var index = -1;
                debugger;
                _.each(Config.feature_count, function (layer, idx) {
                    if (layer.id + "" === params.id) {
                        index = idx;
                        return;
                    }
                });
                if (index !== -1) {
                    data += "FEATURE_COUNT=" + Config.feature_count[index].count;
                }
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
                        dataProjection: Config.view.proj
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
        }
    });

    return new Requestor();
});
