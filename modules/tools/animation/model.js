define(function (require) {

    var ol = require("openlayers"),
        $ = require("jquery"),
        Animation;

    Animation = Backbone.Model.extend({
        defaults: {
            kreis: "",
            animating: false,
            layer: new ol.layer.Vector({
                source: new ol.source.Vector(),
                alwaysOnTop: true,
                style: null
            }),
            pendlerLegend: [],
            // Der aktuelle Animation Durchlauf (eine Richtung = ein Durchlauf)
            animationCount: 0,
            // Wie wieviele Durchläufe
            animationLimit: 0,
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
            minPx: 1,
            maxPx: 20,
            num_kreise_to_style: 2,
            colors: ["rgba(255,0,0,0.5)", "rgba(0,0,255,0.5)"],
            attrAnzahl: "anzahl_einpendler",
            attrKreis: "wohnort_kreis"
        },
        initialize: function () {
            var channel = Radio.channel("Animation");

            channel.reply({
                "getLayer": function () {
                    return this.get("layer");
                }
            }, this);

            this.listenTo(Radio.channel("Window"), {
                "winParams": function (args) {
                    this.setStatus(args);
                    if (args[0] === false) {
                        this.hideMapContent();
                        this.resetAnimationWindow();
                    }
                }
            });

            this.listenTo(this, {
                "change:kreis": function (model, value) {
                    this.unset("gemeinde");
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
                    this.unset("direction", {silent: true});
                },
                "change:direction": function (model, value) {
                    if (value === "arbeitsort") {
                        this.setAttrKreis("wohnort_kreis");
                    }
                    else {
                        this.setAttrKreis("arbeitsort_kreis");
                    }
                    this.createPostBody(value);
                },
                "change:postBody": function (model, value) {
                    this.sendRequest("POST", value, this.parseFeatures);
                },
                "change:lineFeatures": function () {
                    this.centerGemeindeAndSetMarker();
                    this.createLineString();
                }
            });
            this.sendRequest("GET", this.get("params"), this.parseKreise);
            Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), Radio.request("Map", "getLayers").getArray().length]);
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

        prepareData: function () {
            var features = this.get("lineFeatures"),
                values = [],
                intermediate = 0,
                data = [],
                ort_kreise = [],
                ort_kreise_mit_anzahl = [],
                num_kreise_to_style = this.get("num_kreise_to_style"),
                colors = this.get("colors"),
                num_kreise_to_style_anzahl = [];

            _.each(features, function (feature) {
                var anzahl = parseInt(feature.get(this.get("attrAnzahl")), 10),
                    kreis = feature.get(this.get("attrKreis"));

                data.push({
                    anzahl_pendler: anzahl,
                    kreis: kreis
                });
                ort_kreise.push(kreis);
                values.push(anzahl);
                intermediate += anzahl;
            }, this);

            values.sort(function (a, b) {
                return a - b;
            });
            this.setMinVal(values[0]);
            this.setMaxVal(values[values.length - 1]);
            intermediate = Math.round(intermediate / values.length);
            this.setIntermediate(intermediate);

            ort_kreise = _.uniq(ort_kreise);
            _.each(ort_kreise, function (kreis) {
                var counter = 0;

                _.each(data, function (feat) {
                    if (feat.kreis === kreis) {
                        counter += feat.anzahl_pendler;
                    }
                });
                ort_kreise_mit_anzahl.push({
                    kreis: kreis,
                    anzahl_pendler: counter,
                    color: null
                });
            });

            num_kreise_to_style_anzahl = _.pluck(ort_kreise_mit_anzahl, "anzahl_pendler");
            num_kreise_to_style_anzahl.sort(function (a, b) {
                return b - a;
            });
            num_kreise_to_style_anzahl = num_kreise_to_style_anzahl.slice(0, num_kreise_to_style);
            _.each(num_kreise_to_style_anzahl, function (kreis_anzahl, index) {
                var obj = _.findWhere(ort_kreise_mit_anzahl, {anzahl_pendler: kreis_anzahl});

                obj.color = colors[index];
            });
            ort_kreise_mit_anzahl = _.sortBy(ort_kreise_mit_anzahl, "anzahl_pendler");
            ort_kreise_mit_anzahl.reverse();
            this.preparePendlerLegend(ort_kreise_mit_anzahl);
            this.setOrtKreiseMitAnzahl(ort_kreise_mit_anzahl);
        },

        preparePendlerLegend: function (kreise) {
            var pendlerLegend = [],
                pendlerCountOther = 0;

            _.each(kreise, function (kreis) {
                if (kreis.color !== null) {
                    pendlerLegend.push(kreis);
                }
                else {
                    pendlerCountOther += kreis.anzahl_pendler;
                }
            });
            pendlerLegend.push({
                anzahl_pendler: pendlerCountOther,
                color: "rgba(0,0,0,.7)",
                kreis: "Andere"
            });
            this.set("pendlerLegend", pendlerLegend);
        },

        setStatus: function (args) {
            if (args[2].get("id") === "animation") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },

        createPostBody: function (value) {
            var postBody = "<?xml version='1.0' encoding='UTF-8' ?>" +
                            "<wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc'>" +
                                "<wfs:Query typeName='app:mrh_einpendler_gemeinde'>" +
                                    "<ogc:Filter>" +
                                        "<ogc:PropertyIsEqualTo>" +
                                            "<ogc:PropertyName>app:" + value + "</ogc:PropertyName>" +
                                            "<ogc:Literal>" + this.get("gemeinde") + "</ogc:Literal>" +
                                        "</ogc:PropertyIsEqualTo>" +
                                    "</ogc:Filter>" +
                                "</wfs:Query>" +
                            "</wfs:GetFeature>";

            this.setPostBody(postBody);
        },

        setPostBody: function (value) {
            this.set("postBody", value);
        },

        createLineString: function () {
            _.each(this.get("lineFeatures"), function (feature) {
                var startPoint = feature.getGeometry().getFirstCoordinate(),
                    endPoint = feature.getGeometry().getLastCoordinate(),
                    directionX = (endPoint[0] - startPoint[0]) / this.get("steps"),
                    directionY = (endPoint[1] - startPoint[1]) / this.get("steps"),
                    lineCoords = [],
                    line,
                    newEndPt,
                    i,
                    anzahl_pendler = feature.get(this.get("attrAnzahl")),
                    kreis = feature.get(this.get("attrKreis"));

                for (i = 0; i <= this.get("steps"); i++) {
                    newEndPt = new ol.geom.Point([startPoint[0] + (i * directionX), startPoint[1] + (i * directionY), 0]);

                    lineCoords.push(newEndPt.getCoordinates());
                }
                line = new ol.Feature({
                    geometry: new ol.geom.LineString(lineCoords),
                    anzahl_pendler: anzahl_pendler,
                    kreis: kreis
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
                var coordinates;

                if (this.get("animating")) {
                    coordinates = feature.getGeometry().getCoordinates();

                    this.preparePointStyle(feature.get("anzahl_pendler"), feature.get("kreis"));
                    currentPoint = new ol.geom.Point(coordinates[index]);
                    newFeature = new ol.Feature(currentPoint);
                    vectorContext.drawFeature(newFeature, this.get("defaultPointStyle"));
                }
            }, this);
        },
        addFeaturesToLayer: function (features, layer) {
            var currentPoint, coordinates,
                newFeature;

            _.each(features, function (feature) {
                var drawIndex;

                coordinates = feature.getGeometry().getCoordinates();
                this.preparePointStyle(feature.get("anzahl_pendler"), feature.get("kreis"));
                // Ob die Feature bei der Startposition oder der Endposition gezeichnet werden müssen, ist abhängig von der anzahl der Durchgänge
                drawIndex = this.get("animationLimit") % 2 === 1 ? 0 : coordinates.length - 1;

                currentPoint = new ol.geom.Point(coordinates[drawIndex]);
                newFeature = new ol.Feature(currentPoint);
                newFeature.setStyle(this.get("defaultPointStyle"));
                layer.getSource().addFeature(newFeature);
            }, this);
        },
        preparePointStyle: function (val, kreis) {
            var minVal = this.get("minVal"),
                maxVal = this.get("maxVal"),
                intermediate = this.get("intermediate"),
                minPx = this.get("minPx"),
                maxPx = this.get("maxPx"),
                percent,
                pixel,
                ort_kreise_mit_anzahl = this.get("ort_kreise_mit_anzahl"),
                ort,
                radius,
                color;

            percent = (val * 100) / (maxVal - minVal);
            pixel = ((maxPx - minPx) / 100) * percent;
            ort = _.findWhere(ort_kreise_mit_anzahl, {kreis: kreis});

            if (!_.isUndefined(ort) && ort.color !== null) {
                color = ort.color;
            }
            else {
                color = "rgba(0,0,0,.5)";
            }
            if (val > intermediate) {
                radius = Math.round(minPx + pixel);
            }
            else {
                radius = minPx;
            }

            this.setDefaultPointStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({color: color})
                })
            }));
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
        setAttrKreis: function (value) {
            this.set("attrKreis", value);
        },
        setMinPx: function (value) {
            this.set("minPx", value);
        },
        setMaxPx: function (value) {
            this.set("maxPx", value);
        },
        setNumKreiseToStyle: function (value) {
            this.set("num_kreise_to_style", value);
        },
        setColors: function (value) {
            this.set("colors", value);
        },
        setDefaultPointStyle: function (value) {
            this.set("defaultPointStyle", value);
        },
        setIntermediate: function (val) {
            this.set("intermediate", val);
        },
        setMinVal: function (val) {
            this.set("minVal", val);
        },
        setMaxVal: function (val) {
            this.set("maxVal", val);
        },
        setOrtKreiseMitAnzahl: function (val) {
            this.set("ort_kreise_mit_anzahl", val);
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
        setDirection: function (value) {
            this.set("direction", value);
        },

        setZoomLevel: function (value) {
            this.set("zoomLevel", value);
        },

        hideMapContent: function () {
            if (this.get("animationLayer")) {
                Radio.trigger("Map", "removeLayer", this.get("animationLayer"));

            }
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
