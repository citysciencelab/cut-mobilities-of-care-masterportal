define(function (require) {

    var PendlerCoreModel = require("modules/tools/pendler/core/model"),
        ol = require("openlayers"),
        Animation;

    Animation = PendlerCoreModel.extend({
        defaults: _.extend({}, PendlerCoreModel.prototype.defaults, {
            animating: false,
            pathLayer: new ol.layer.Vector({
                source: new ol.source.Vector(),
                alwaysOnTop: true,
                style: null,
                name: "pathLayer"
            }),
            // Der aktuelle Animation Durchlauf (eine Richtung = ein Durchlauf)
            animationCount: 0,
            // Wie wieviele Durchläufe
            animationLimit: 0,
            steps: 50,
            minPx: 5,
            maxPx: 20,
            colors: [],
            glyphicon: "glyphicon-play-circle"
        }),

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

        /**
         * Bricht eine Animation ab (und entfernt die zugehörigen Punkte).
         * Verwendung beispielsweise bei Änderung der Abfrageparameter.
         * @returns {Void} Kein Rückgabewert
         */
        clear: function () {
            var animationLayer;

            if (this.get("animating")) {
                this.stopAnimation();
            }

            animationLayer = this.get("animationLayer");
            if (!_.isUndefined(animationLayer)) {
                Radio.trigger("Map", "removeLayer", animationLayer);
            }
        },

        colorFeatures: function (features) {
            var colors = this.get("colors"),
                i;

            // Wenn zu wenig Farben konfiguriert wurden wird ein alternatives Farbschema berechnet und angewendet (als Fallback)
            if (colors.length < features.length) {
                console.warn("Die Anzahl an konfigurierten Farben reicht zur Darstellung der Ergebnisse nicht aus. Generiere ein alternatives Farbschema.");
                colors = this.generateColors(features.length);
            }

            // Füge eine Farbe zur Darstellung hinzu
            for (i = 0; i < features.length; i++) {
                features[i].color = colors[i];
            }

            return features;
        },

        handleData: function () {
            var rawFeatures = this.get("lineFeatures"),
                topFeatures,
                coloredFeatures,
                min,
                max;


            this.centerGemeinde(true);

            topFeatures = this.selectFeatures(rawFeatures);

            coloredFeatures = this.colorFeatures(topFeatures);

            // Bestimme statistische Kenngrößen
            min = _.last(coloredFeatures).get(this.get("attrAnzahl"));
            this.setMinVal(min);
            max = _.first(coloredFeatures).get(this.get("attrAnzahl"));
            this.setMaxVal(max);


            this.preparePendlerLegend(coloredFeatures);
            this.createLineString(coloredFeatures);
        },

        createLineString: function (relevantFeatures) {

            this.get("pathLayer").getSource().clear();

            _.each(relevantFeatures, function (feature) {
                var startPoint = feature.getGeometry().getFirstCoordinate(),
                    endPoint = feature.getGeometry().getLastCoordinate(),
                    steps = this.get("steps"),
                    directionX = (endPoint[0] - startPoint[0]) / steps,
                    directionY = (endPoint[1] - startPoint[1]) / steps,
                    lineCoords = [],
                    line,
                    newEndPt,
                    i,
                    anzahlPendler = feature.get(this.get("attrAnzahl")),
                    gemeinde = feature.get(this.get("attrGemeinde"));

                for (i = 0; i <= steps; i++) {
                    newEndPt = new ol.geom.Point([startPoint[0] + (i * directionX), startPoint[1] + (i * directionY), 0]);

                    lineCoords.push(newEndPt.getCoordinates());
                }

                line = new ol.Feature({
                    geometry: new ol.geom.LineString(lineCoords),
                    anzahlPendler: anzahlPendler,
                    gemeindeName: gemeinde,
                    color: feature.color
                });

                this.get("pathLayer").getSource().addFeature(line);

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

        moveFeature: function (event) {
            var vectorContext = event.vectorContext,
                frameState = event.frameState,
                features = this.get("pathLayer").getSource().getFeatures(),
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

        setAnimationCount: function (value) {
            this.set("animationCount", value);
        },

        setAnimationLimit: function (value) {
            this.set("animationLimit", value);
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

        setSteps: function (value) {
            this.set("steps", value);
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
        }
    });

    return Animation;
});
