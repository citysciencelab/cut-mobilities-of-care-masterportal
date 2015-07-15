define([
    "backbone",
    "eventbus",
    "openlayers",
    "config",
    "bootstrap/popover",
    "videojs"
], function (Backbone, EventBus, ol, Config, Popover, VideoJS) {

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
            isVisible: false,
            routeLayer: new ol.layer.Vector({
                source: new ol.source.Vector({
                    projection: ol.proj.get("EPSG:25832")
                }),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "blue",
                        width: 5
                    })
                })
            })
        },

        /**
         *
         */
        initialize: function () {
            this.set("element", this.get("gfiOverlay").getElement());
            this.listenTo(this, "change:isPopupVisible", this.sendGFIForPrint);
            EventBus.trigger("addOverlay", this.get("gfiOverlay")); // listnener in map.js
            EventBus.on("setGFIParams", this.setGFIParams, this); // trigger in map.js
            EventBus.on("streamVideoByID", this.starteStreaming, this); // trigger in map.js
//            EventBus.on("getGFIForPrint", this.sendGFIForPrint, this);
        },

        /**
         * Diese Funktion startet das Video unter der übergebenen id
         */
        starteStreaming: function (id) {
            if (document.getElementById(id)) {
                VideoJS(id, {"autoplay": true, "preload": "auto", "children": {"controlBar": false}}, function() {
//                    console.log("loaded");
                });
            }
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
            this.get("routeLayer").getSource().clear();
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
                    // console.log(gfiContent);
                }
                else if (sortedParams[i].typ === "WFS") {
                    gfiContent = this.setWFSPopupContent(sortedParams[i].source, sortedParams[i].style, params[1], sortedParams[i].scale, sortedParams[i].attributes);
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
            // Umwandeln der diensteAPI-URLs in lokale URL gemäß httpd.conf
            if (params.url.search(location.host) === -1) {
                if (params.url.indexOf("http://WSCA0620.fhhnet.stadt.hamburg.de") !== -1) {
                    url = params.url.replace("http://WSCA0620.fhhnet.stadt.hamburg.de", "/wsca0620");
                }
                else if (params.url.indexOf("http://bsu-ims.fhhnet.stadt.hamburg.de") !== -1) {
                    url = params.url.replace("http://bsu-ims.fhhnet.stadt.hamburg.de", "/bsu-ims");
                }
                else if (params.url.indexOf("http://bsu-ims") !== -1) {
                    url = params.url.replace("http://bsu-ims", "/bsu-ims");
                }
                else if (params.url.indexOf("http://bsu-uio.fhhnet.stadt.hamburg.de") !== -1) {
                    url = params.url.replace("http://bsu-uio.fhhnet.stadt.hamburg.de", "/bsu-uio");
                }
                else if (params.url.indexOf("http://geofos.fhhnet.stadt.hamburg.de") !== -1) {
                    url = params.url.replace("http://geofos.fhhnet.stadt.hamburg.de", "/geofos");
                }
                else if (params.url.indexOf("http://geofos") !== -1) {
                    url = params.url.replace("http://geofos", "/geofos");
                }
                else if (params.url.indexOf("http://wscd0095") !== -1) {
                    url = params.url.replace("http://wscd0095", "/geofos");
                }
                else if (params.url.indexOf("http://wscd0096") !== -1) {
                    url = params.url.replace("http://wscd0096", "/wscd0096");
                }
                else if (params.url.indexOf("http://hmbtg.geronimus.info") !== -1) {
                    url = params.url.replace("http://hmbtg.geronimus.info", "/hmbtg");
                }
                else if (params.url.indexOf("http://lgvfds01.fhhnet.stadt.hamburg.de") !== -1) {
                    url = params.url.replace("http://lgvfds01.fhhnet.stadt.hamburg.de", "/lgvfds01");
                }
                else if (params.url.indexOf("http://lgvfds02.fhhnet.stadt.hamburg.de") !== -1) {
                    url = params.url.replace("http://lgvfds02.fhhnet.stadt.hamburg.de", "/lgvfds02");
                }
                else if (params.url.indexOf("http://wsca0620.fhhnet.stadt.hamburg.de") !== -1) {
                    url = params.url.replace("http://wsca0620.fhhnet.stadt.hamburg.de", "/wsca0620");
                }
                else if (params.url.indexOf("http://geodienste-hamburg.de") !== -1) {
                    url = params.url.replace("http://geodienste-hamburg.de", "/geodienste-hamburg");
                }
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
                success: function (data) {//console.log(data);
                    var gfiList = [];
                    // ESRI
                    if (data.getElementsByTagName("FIELDS")[0] !== undefined) {
                        _.each(data.getElementsByTagName("FIELDS"), function (element) {
                            gfiList.push(element.attributes);
                        });
                        // gfiList.push(data.getElementsByTagName("FIELDS")[0].attributes);
                    }
                    // deegree
                    else if (data.getElementsByTagName("gml:featureMember")[0] !== undefined) {
                        _.each(data.getElementsByTagName("gml:featureMember"), function (element) {
                            var nodeList = element.childNodes[0].nextSibling.childNodes;

                            gfiList.push(_.filter(nodeList, function (element) {
                                return element.nodeType === 1;
                            }));
                        });
                    }
                    // deegree alle auf WebKit basierenden Browser (Chrome, Safari)
                    else if (data.getElementsByTagName("featureMember")[0] !== undefined) {
                        _.each(data.getElementsByTagName("featureMember"), function (element) {
                            var nodeList = element.childNodes[0].nextSibling.childNodes;

                            gfiList.push(_.filter(nodeList, function (element) {
                                return element.nodeType === 1;
                            }));
                        });
                    }
                    if (gfiList) {
                        _.each(gfiList, function (element) {
                            var gfi = {};

                            if (params.attributes === "showAll") {
                                _.each(element, function (element) {
                                    var attribute = element.localName.substring(0, 1).toUpperCase() + element.localName.substring(1).replace("_", " ");

                                    if (element.value && element.value !== "") {
                                        gfi[attribute] = element.value.trim();
                                    }
                                    else if (element.textContent && element.textContent !== "") {
                                        gfi[attribute] = element.textContent.trim();
                                    }
                                });
                            }
                            else {
                                _.each(params.attributes, function (value, key) {
                                    var node = _.find(element, function (node) {
                                        return node.localName === key;
                                    });

                                    if (node) {
                                        var nodevalue;

                                        if (node.value && node.value !== "" && node.value !== "Null") {
                                            nodevalue = node.value.trim();
                                        }
                                        else if (node.textContent && node.textContent !== "" && node.textContent !== "Null") {
                                            nodevalue = node.textContent.trim();
                                        }
                                        if (nodevalue) {
                                            var key = [],
                                                val = [],
                                                newgfi;

                                            key.push(value);
                                            val.push(nodevalue);
                                            newgfi = _.object(key, val);
                                            gfi = _.extend(gfi, newgfi);
                                        }
                                    }
                                });
                            }
                            if (_.isEmpty(gfi) !== true) {
                                pgfi.push(gfi);
                            }
                        });
                    }
                },
                error: function (jqXHR, textStatus) {
                    alert("Ajax-Request " + textStatus);
                }
            });
            return pgfi;
        },
        sendGFIForPrint: function () {
            EventBus.trigger("gfiForPrint", [this.get("gfiContent")[0], this.get("isPopupVisible")]);
        },

        /**
         * Enfernt den "Route-Layer" von der Karte.
         */
        clearRoute: function () {
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
        }
    });

    return new GFIPopup();
});
