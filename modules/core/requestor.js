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
            // Anzeige der GFI und GF in alphabetischer Reihenfolge der Layernamen
            var sortedParams = _.sortBy(params[0], "name"),
                gfiContent,
                pContent = [],
                positionGFI = params[1];

            // Abfrage jedes Layers der von der map übermittelt wurde.
            _.each(sortedParams, function (visibleLayer) {
                gfiContent = null;
                switch (visibleLayer.ol_layer.get("typ")) {
                    case "WMS": {
                        gfiContent = this.setWMSPopupContent(visibleLayer);
                        break;
                    }
                    case "WFS": {
                        gfiContent = this.setWFSPopupContent(visibleLayer.attributes, visibleLayer.feature);
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
        setWFSPopupContent: function (gfiAttributes, feature) {
            var featureProperties = feature.getProperties(),
                gfi = {};

                if (gfiAttributes === "showAll") {
                    _.each(featureProperties, function (value, key) {
                        key = key.substring(0, 1).toUpperCase() + key.substring(1).replace("_", " ");
                        if (_.isNumber(value) || _.isBoolean(value)) {
                            value = value.toString();
                        }
                        if (!value || !_.isString(value)) {
                            return;
                        }
                        gfi[key] = value;
                    });
                }
                else {
                    _.each(gfiAttributes, function (value, key) {
                        var attributeValue = _.propertyOf(featureProperties)(key);

                        if (attributeValue) {
                            gfi[value] = attributeValue;
                        }
                    });
                }
            return [gfi];
        },

        setWMSPopupContent: function (params) {
            var url, data, pgfi = [];

            if (params.url.search(location.host) === -1) {
                url = Util.getProxyURL(params.url);
            }
            else {
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

                _.each(Config.feature_count, function (layer, idx) {

                    if (layer.id + "" === params.ol_layer.id) {
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
                    // das reverse wird fürs Planportal gebraucht SD 18.01.2016
                    gfiFeatures = gfiFormat.readFeatures(data, {
                        dataProjection: Config.view.proj
                    }).reverse();

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
                    else { // OS (deegree, UMN, Geoserver) is parsed by ol-format
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
                            if (params.ol_layer.get("gfiAttributes") === "showAll") {
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
                                    key = params.ol_layer.get("gfiAttributes")[key];
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
