define(function (require) {

    var ol = require("openlayers"),
        $ = require("jquery"),
        Tool = require("modules/core/modelList/tool/model"),
        Animation;

    Animation = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            kreis: "",
            animating: false,
            layer: new ol.layer.Vector({
                source: new ol.source.Vector(),
                alwaysOnTop: true,
                style: null,
                name: "animation_layer"
            }),
            pendlerLegend: [],
            // Der aktuelle Animation Durchlauf (eine Richtung = ein Durchlauf)
            animationCount: 0,
            // Wie wieviele Durchläufe
            animationLimit: 0,
            renderToWindow: true,
            steps: 50,
            zoomlevel: 1,
            url: "http://geodienste.hamburg.de/Test_MRH_WFS_Pendlerverflechtung",
            params: {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
                TYPENAME: "app:mrh_kreise",
                VERSION: "1.1.0",
                maxFeatures: "10000"
            },
            featureType: "mrh_einpendler_gemeinde",
            minPx: 5,
            maxPx: 20,
            colors: [],
            attrAnzahl: "anzahl_einpendler",
            attrGemeinde: "wohnort"
        }),
        initialize: function () {
            var channel = Radio.channel("Animation");

            this.superInitialize();
            channel.reply({
                "getLayer": function () {
                    return this.get("layer");
                }
            }, this);

            this.listenTo(this, {
                "change:isActive": function (model, value) {
                    var layers = Radio.request("Map", "getLayers"),
                        animationLayer;

                    if (value) {
                        animationLayer = _.find(layers.getArray(), function (layer) {
                            return layer.get("name") === "animation_layer";
                        });
                        if (animationLayer === undefined) {
                            Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), layers.getArray().length]);
                        }
                        this.resetAnimationWindow();
                    }
                    else {
                        this.hideMapContent();
                    }
                }
            });

            this.listenTo(this, {
                "change:kreis": function (model, value) {
                    this.unset("gemeinde");
                    this.unset("direction", {silent: true});
                    this.clearAnimation();
                    this.setParams({
                        REQUEST: "GetFeature",
                        SERVICE: "WFS",
                        VERSION: "2.0.0",
                        StoredQuery_ID: "SamtgemeindeZuKreis",
                        kreis: value
                    });
                    this.sendRequest("GET", this.get("params"), this.parseGemeinden);
                },
                "change:gemeinde": function () {
                    this.unset("trefferAnzahl", {silent: true});
                    this.unset("direction", {silent: true});
                    this.clearAnimation();
                },
                "change:trefferAnzahl": function () {
                    this.unset("direction", {silent: true});
                    this.clearAnimation();
                },
                "change:direction": function (model, value) {
                    this.clearAnimation();
                    if (value === "arbeitsort") {
                        this.setAttrGemeinde("wohnort");
                    }
                    else {
                        this.setAttrGemeinde("arbeitsort");
                    }
                    this.createPostBody(value);
                },
                "change:postBody": function (model, value) {
                    this.sendRequest("POST", value, this.parseFeatures);
                },
                "change:lineFeatures": function () {
                    // FIXME: Das könnte auch schon früher passieren, nachdem die Gemeinde festgelegt wurde!
                    this.centerGemeindeAndSetMarker();
                }
            });
            this.sendRequest("GET", this.get("params"), this.parseKreise);
        },

        /**
         * Bricht eine Animation ab (und entfernt die zugehörigen Punkte).
         * Verwendung beispielsweise bei Änderung der Abfrageparameter.
         * @returns {Void} Kein Rückgabewert
         */
        clearAnimation: function () {
            var animationLayer;

            if (this.get("animating")) {
                this.stopAnimation();
            }

            animationLayer = this.get("animationLayer");
            if (!_.isUndefined(animationLayer)) {
                Radio.trigger("Map", "removeLayer", animationLayer);
            }
        },

        /**
         * Führt einen HTTP-Request aus
         * @param {String} type - GET oder POST
         * @param {String} data -
         * @param {function} successFunction - Wird aufgerufen wenn der Request erfolgreich war
         * @returns {void}
         */
        sendRequest: function (type, data, successFunction) {
            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("url")),
                data: data,
                contentType: "text/xml",
                type: type,
                context: this,
                success: successFunction,
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Alert", "alert", error);
                }
            });
        },

        /**
         * Success Funktion für die Landkreise
         * @param  {object} data - Response
         * @returns {void}
         */
        parseKreise: function (data) {
            var kreise = [],
                hits = $("gml\\:featureMember,featureMember", data);

            _.each(hits, function (hit) {
                var kreis = $(hit).find("app\\:kreisname,kreisname")[0].textContent;

                kreise.push(kreis);
            });
            this.setKreise(_.without(kreise.sort(), "Bremen", "Berlin", "Kiel", "Hannover"));
        },

        /**
         * Success Funktion für die Gemeinden
         * @param  {ojbect} data - Response
         * @returns {void}
         */
        parseGemeinden: function (data) {
            var gemeinden = [],
                hits = $("wfs\\:member,member", data);

            _.each(hits, function (hit) {
                var gemeinde = $(hit).find("app\\:gemeinde,gemeinde")[0].textContent;

                gemeinden.push(gemeinde);
            });
            this.setGemeinden(gemeinden.sort());
        },

        /**
         * Success Funktion für die Features
         * @param  {ojbect} data - Response
         * @returns {void}
         */
        parseFeatures: function (data) {
            var wfsReader = new ol.format.WFS({
                featureNS: "http://www.deegree.org/app",
                featureType: this.get("featureType")
            });

            this.get("layer").getSource().clear();
            this.setLineFeatures(wfsReader.readFeatures(data));
            this.prepareData();
        },

        /**
         * Übergibt die Zentrumskoordinate der Gemeinde an die MapView, abhängig der Richtung.
         * @returns {void}
         */
        centerGemeindeAndSetMarker: function () {
            var coords = [];

            if (this.get("direction") === "wohnort") {
                coords = this.get("lineFeatures")[0].getGeometry().getFirstCoordinate();
                Radio.trigger("MapView", "setCenter", coords, this.get("zoomLevel"));
                Radio.trigger("MapMarker", "showMarker", coords);
            }
            else {
                coords = this.get("lineFeatures")[0].getGeometry().getLastCoordinate();
                Radio.trigger("MapView", "setCenter", coords, this.get("zoomLevel"));
                Radio.trigger("MapMarker", "showMarker", coords);
            }
        },

        /**
         * Übernehme nur die vorgegebene Anzahl an Features aus der Liste und verwerfe
         * den Rest. Gezählt wird von vorne.
         * @param {Object[]} features Zu kürzende Feature-Liste
         * @param {String} limitText Anzahl der zu übernehmenden Features in Textform (TopX, Alle)
         * @returns {Object[]} Gekürzte Feature-Liste
         */
        truncateFeatureList: function (features, limitText) {
            var limit;

            switch (limitText) {
                case "top5":
                    limit = 5;
                    break;
                case "top10":
                    limit = 10;
                    break;
                case "top15":
                    limit = 15;
                    break;
                // case "alle": // Deaktiviert, da das Fenster zur Darstellung keine ausreichende Größe besitzt.
                default:
                    // Nichts zu tun, gebe die ungeänderte Liste zurück
                    return features;
            }

            // Gebe eine nach <limit> Einträgen abgeschnittene Liste zurück
            return _.first(features, limit);
        },

        prepareData: function () {
            var rawFeatures = this.get("lineFeatures"),
                colors = this.get("colors"),
                sortedFeatures,
                relevantFeatures,
                min,
                max,
                i;

            // Sortiere nach Anzahl der Pendler
            sortedFeatures = _.sortBy(rawFeatures, function (feature) {
                // Verwende die Gegenzahl als Wert zur Sortierung, um absteigende Reihenfolge zu erhalten.
                return feature.get(this.get("attrAnzahl")) * -1;
            }, this);

            // Schneide Liste gemäß gewähltem Top ab
            relevantFeatures = this.truncateFeatureList(sortedFeatures, this.get("trefferAnzahl"));

            // Wenn zu wenig Farben konfiguriert wurden wird ein alternatives Farbschema berechnet und angewendet (als Fallback)
            if (colors.length < relevantFeatures.length) {
                console.warn("Die Anzahl an konfigurierten Farben reicht zur Darstellung der Ergebnisse nicht aus. Generiere ein alternatives Farbschema.");
                colors = this.generateColors(relevantFeatures.length);
            }

            // Füge eine Farbe zur Darstellung hinzu
            for (i = 0; i < relevantFeatures.length; i++) {
                relevantFeatures[i].color = colors[i];
            }

            // Bestimme statistische Kenngrößen
            min = _.last(relevantFeatures).get(this.get("attrAnzahl"));
            this.setMinVal(min);
            max = _.first(relevantFeatures).get(this.get("attrAnzahl"));
            this.setMaxVal(max);

            this.preparePendlerLegend(relevantFeatures);
            this.createLineString(relevantFeatures);
        },

        /**
         * Generiere eine vorgegebene Anzahl an disjunkten Farben
         * @param {Int} amount Anzahl gewünschter Farbgruppen
         * @returns {String[]} Array mit den Codes (HSLA) der Farben
         */
        generateColors: function (amount) {
            var colors = [],
                h = 0,
                s = 100,
                l = 50,
                a = 0.7,
                dh = 360.0 / amount,
                i;

            // Schreite den Farbkreis ab
            for (i = 0; i < amount; i++) {
                colors.push("hsla(" + h + "," + s + "%," + l + "%," + a + ")");
                h += dh;
            }
            return colors;
        },

        preparePendlerLegend: function (features) {
            var pendlerLegend = [];

            _.each(features, function (feature) {
                // Ein Feature entspricht einer Gemeinde. Extraktion der für die Legende
                // nötigen Attribute (abhängig von der gewünschten Richtung).
                pendlerLegend.push({
                    anzahlPendler: feature.get(this.get("attrAnzahl")),
                    color: feature.color,
                    name: feature.get(this.get("attrGemeinde"))
                });
            }, this);

            this.set("pendlerLegend", pendlerLegend);
        },

        createPostBody: function (value) {
            var postBody = "<?xml version='1.0' encoding='UTF-8' ?>" +
                            "<wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc'>" +
                                "<wfs:Query typeName='app:" + this.get("featureType") + "'>" +
                                    "<ogc:Filter>" +
                                        "<ogc:PropertyIsEqualTo>" +
                                            "<ogc:PropertyName>app:" + value + "</ogc:PropertyName>" +
                                            "<ogc:Literal>" + this.get("gemeinde") + "</ogc:Literal>" +
                                        "</ogc:PropertyIsEqualTo>" +
                                    "</ogc:Filter>" +
                                "</wfs:Query>" +
                            "</wfs:GetFeature>";

            // Wenn sich die zu betrachtende Gemeinde nicht geändert hat bleibt der Request gleich
            // und muss nicht erneut gestellt werden. Löse stattdessen die erneute Verarbeitung der Daten aus.
            if (postBody === this.get("postBody")) {
                this.prepareData();
                return;
            }

            this.setPostBody(postBody);
        },

        setPostBody: function (value) {
            this.set("postBody", value);
        },

        createLineString: function (relevantFeatures) {

            _.each(relevantFeatures, function (feature) {
                var startPoint = feature.getGeometry().getFirstCoordinate(),
                    endPoint = feature.getGeometry().getLastCoordinate(),
                    directionX = (endPoint[0] - startPoint[0]) / this.get("steps"),
                    directionY = (endPoint[1] - startPoint[1]) / this.get("steps"),
                    lineCoords = [],
                    line,
                    newEndPt,
                    i,
                    anzahlPendler = feature.get(this.get("attrAnzahl")),
                    gemeinde = feature.get(this.get("attrGemeinde"));

                for (i = 0; i <= this.get("steps"); i++) {
                    newEndPt = new ol.geom.Point([startPoint[0] + (i * directionX), startPoint[1] + (i * directionY), 0]);

                    lineCoords.push(newEndPt.getCoordinates());
                }
                line = new ol.Feature({
                    geometry: new ol.geom.LineString(lineCoords),
                    anzahlPendler: anzahlPendler,
                    gemeindeName: gemeinde,
                    color: feature.color
                });

                this.get("layer").getSource().addFeature(line);
            }, this);
        },

        moveFeature: function (event) {
            var vectorContext = event.vectorContext,
                frameState = event.frameState,
                features = this.get("layer").getSource().getFeatures(),
                elapsedTime = frameState.time - this.get("now"),
                // here the trick to increase speed is to jump some indexes
                // on lineString coordinates
                index = Math.round(elapsedTime / 100);

            // Bestimmt die Richtung der animation (alle geraden sind rückwärts)
            if (this.get("animationCount") % 2 === 1) {
                index = this.get("steps") - index;
                if (index <= 0) {
                    this.repeatAnimation(features, true);

                }
                else if (this.get("animating")) {
                    this.draw(vectorContext, features, index);
                    Radio.trigger("Map", "render");
                }
            }
            else {
                if (index >= this.get("steps")) {
                    this.repeatAnimation(features);
                    return;
                }

                if (this.get("animating")) {
                    this.draw(vectorContext, features, index);
                    Radio.trigger("Map", "render");
                }

            }
        },

        draw: function (vectorContext, features, index) {
            var currentPoint,
                newFeature;

            _.each(features, function (feature) {
                var coordinates,
                    style;

                if (this.get("animating")) {
                    coordinates = feature.getGeometry().getCoordinates();

                    style = this.preparePointStyle(feature.get("anzahlPendler"), feature.get("color"));
                    currentPoint = new ol.geom.Point(coordinates[index]);
                    newFeature = new ol.Feature(currentPoint);
                    vectorContext.drawFeature(newFeature, style);
                }
            }, this);
        },

        /**
         * Füge Punkte nach Ende der Animation dem Layer hinzu
         * @param {Object[]} features Hinzuzufügende Features
         * @param {Object} layer Ziel-Layer
         * @returns {Void} Keine Rückgabe
         */
        addFeaturesToLayer: function (features, layer) {
            var currentPoint, coordinates,
                newFeature;

            _.each(features, function (feature) {
                var drawIndex,
                    style;

                coordinates = feature.getGeometry().getCoordinates();
                style = this.preparePointStyle(feature.get("anzahlPendler"), feature.get("color"));

                // Ob die Features bei der Startposition oder der Endposition gezeichnet werden müssen,
                // ist abhängig von der Anzahl der Durchgänge
                drawIndex = this.get("animationLimit") % 2 === 1 ? 0 : coordinates.length - 1;

                currentPoint = new ol.geom.Point(coordinates[drawIndex]);
                newFeature = new ol.Feature(currentPoint);
                newFeature.setStyle(style);
                layer.getSource().addFeature(newFeature);
            }, this);
        },

        preparePointStyle: function (anzahlPendler, color) {
            var minVal = this.get("minVal"),
                maxVal = this.get("maxVal"),
                minPx = this.get("minPx"),
                maxPx = this.get("maxPx"),
                percent,
                pixel,
                radius,
                style;

            percent = (anzahlPendler * 100) / (maxVal - minVal);
            pixel = ((maxPx - minPx) / 100) * percent;

            radius = Math.round(minPx + pixel);

            style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({color: color})
                })
            });

            return style;
        },

        prepareAnimation: function () {
            var animationLayer = Radio.request("Map", "createLayerIfNotExists", "animationLayer");

            if (this.get("direction") === "wohnort") {
                this.setAnimationLimit(2);
            }
            else {
                this.setAnimationLimit(1);
            }
            this.setAnimationCount(0);
            this.set("animationLayer", animationLayer);
            this.get("animationLayer").getSource().clear();
            Radio.trigger("Map", "registerListener", "postcompose", this.moveFeature, this);
            if (this.get("animating")) {
                this.stopAnimation([]);
            }
            else {
                this.startAnimation();
            }
        },
        startAnimation: function () {
            this.set("animating", true);
            this.set("now", new Date().getTime());
            Radio.trigger("Map", "render");
        },
        /**
         * Wiederholt die animation, wenn AnimationLimit noch nicht erreicht ist
         * @param  {[type]} features werden für das hinzufügen auf die Layer nach der naimation durchgereicht
         * @returns {void}
         */
        repeatAnimation: function (features) {
            if (this.get("animationCount") < this.get("animationLimit")) {
                this.setAnimationCount(this.get("animationCount") + 1);
                this.startAnimation();
            }
            else {
                this.stopAnimation(features);
            }
        },
        stopAnimation: function (features) {
            Radio.trigger("Map", "unregisterListener", "postcompose", this.moveFeature, this);
            this.set("animating", false);
            // Wenn Animation fertig alle Features als Vectoren auf neue Layer malen.
            // features ist undefined, wenn die Funktion üder den Resetknopf aufgerufen wird
            if (!_.isUndefined(features)) {
                this.addFeaturesToLayer(features, this.get("animationLayer"));
            }
        },
        setAnimationCount: function (value) {
            this.set("animationCount", value);
        },

        setAnimationLimit: function (value) {
            this.set("animationLimit", value);
        },

        setLineFeatures: function (value) {
            this.set("lineFeatures", value);
        },

        setSteps: function (value) {
            this.set("steps", value);
        },

        setUrl: function (value) {
            this.set("url", value);
        },
        setParams: function (value) {
            this.set("params", value);
        },
        setFeatureType: function (value) {
            this.set("featureType", value);
        },
        setAttrAnzahl: function (value) {
            this.set("attrAnzahl", value);
        },
        setAttrGemeinde: function (value) {
            this.set("attrGemeinde", value);
        },
        setMinPx: function (value) {
            this.set("minPx", value);
        },
        setMaxPx: function (value) {
            this.set("maxPx", value);
        },
        setColors: function (value) {
            this.set("colors", value);
        },
        setMinVal: function (val) {
            this.set("minVal", val);
        },
        setMaxVal: function (val) {
            this.set("maxVal", val);
        },
        setKreise: function (value) {
            this.set("kreise", value);
        },
        setKreis: function (value) {
            this.set("kreis", value);
        },
        setGemeinden: function (value) {
            this.set("gemeinden", value);
        },
        setGemeinde: function (value) {
            this.set("gemeinde", value);
        },
        setTrefferAnzahl: function (value) {
            this.set("trefferAnzahl", value);
        },
        setDirection: function (value) {
            this.set("direction", value);
        },

        setZoomLevel: function (value) {
            this.set("zoomLevel", value);
        },

        /**
         * Beende die Animation und enteferne angezeigte Features (durch Aufruf von clearAnimation)
         * und entferne zusätzlich den Marker der selektierten Gemeinde.
         * @returns {Void} keine Rückgabe
         */
        hideMapContent: function () {
            this.clearAnimation();
            Radio.trigger("MapMarker", "hideMarker");
        },

        resetAnimationWindow: function () {
            this.setKreis("");
            this.set("pendlerLegend", []);
            this.unset("postBody", {silent: true});
        }
    });

    return Animation;
});
