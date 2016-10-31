define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Util = require("modules/core/util"),
        Animation;

    Animation = Backbone.Model.extend({
        defaults: {
            steps: 50,
            layer: new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                         stroke: new ol.style.Stroke({
                             color: [0, 0, 0, 0]
                         })
                     })
            }),
            params: {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
//                TYPENAME: "app:mrh_auspendler_gesamt",
                TYPENAME: "app:mrh_auspendler_gemeinde",
                VERSION: "1.1.0",
                maxFeatures: "5000"
            },
            defaultPointStyle: new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 6,
                  fill: new ol.style.Fill({color: "red"})
                })
            })
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });

            this.listenTo(this, {
                "change:lineFeatures": this.createLineString
            });

            this.getFeatures();
            Radio.trigger("Map", "addLayer", this.get("layer"));
        },

        prepareData: function () {
            var features = this.getLineFeatures(),
                values = [],
                intermediate = 0,
                data = [],
                wohnort_kreise = [],
                wohnort_kreise_mit_anzahl = [];

            _.each(features, function (feature) {
                var anzahl = parseInt(feature.get("anzahl_auspendler")),
                    wohnort = feature.get("wohnort"),
                    wohnort_kreis = feature.get("wohnort_kreis"),
                    arbeitsort = feature.get("arbeitsort"),
                    arbeitsort_kreis = feature.get("arbeitsort_kreis");

                data.push({
                    anzahl : anzahl,
                    wohnort : wohnort,
                    wohnort_kreis : wohnort_kreis,
                    arbeitsort : arbeitsort,
                    arbeitsort_kreis : arbeitsort_kreis
                });
                wohnort_kreise.push(wohnort_kreis);
                values.push(anzahl);
                intermediate += anzahl;
            });

            values.sort(function(a, b){return a-b});
            this.setIntermediate(intermediate);
            this.setMinVal(values[0]);
            this.setMaxVal(values[values.length-1]);

            intermediate = Math.round(intermediate/values.length);

            wohnort_kreise=_.uniq(wohnort_kreise);
            _.each(wohnort_kreise, function (kreis) {
                var counter = 0;
                _.each(data, function(feat){
                    if(feat.wohnort_kreis === kreis){
                        counter += feat.anzahl;
                    }
                });
                wohnort_kreise_mit_anzahl.push({
                    kreis : kreis,
                    anzahl : counter
                });
            });

            console.log(wohnort_kreise_mit_anzahl);
//            _.sortBy(wohnort_kreise_mit_anzahl,"anzahl");
//            console.log(wohnort_kreise_mit_anzahl);
        },

        setStatus: function (args) {
            if (args[2].getId() === "animation") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },

        getFeatures: function () {
            $.ajax({
                url: Util.getProxyURL("http://geodienste.hamburg.de/Test_MRH_WFS_Pendlerverflechtung"),
                data: this.get("params"),
                type: "GET",
                context: this,
                success: function (data) {
                    var wfsReader = new ol.format.WFS({
                        featureNS: "http://www.deegree.org/app",
//                        featureType: "mrh_auspendler_gesamt"
                        featureType: "mrh_auspendler_gemeinde"
                    });

                    this.setLineFeatures(wfsReader.readFeatures(data));
                    this.prepareData();
                },
                error: function (jqXHR, errorText, error) {
                    console.log(error);
                }
            });
        },

        createLineString: function () {
            _.each(this.getLineFeatures(), function (feature) {
                var startPoint = feature.getGeometry().getFirstCoordinate(),
                    endPoint = feature.getGeometry().getLastCoordinate(),
                    directionX = (endPoint[0] - startPoint[0]) / this.getSteps(),
                    directionY = (endPoint[1] - startPoint[1]) / this.getSteps(),
                    lineCoords = [],
                    anzahl_pendler = feature.get("anzahl_auspendler");

                for (var i = 0; i <= this.getSteps(); i++) {
                    var newEndPt = new ol.geom.Point([startPoint[0] + i * directionX, startPoint[1] + i * directionY, 0]);

                    lineCoords.push(newEndPt.getCoordinates());
                }
                var line = new ol.Feature({
                    geometry: new ol.geom.LineString(lineCoords),
                    anzahl_pendler: anzahl_pendler
                });

                this.get("layer").getSource().addFeature(line);
            }, this);
        },

        setLineFeatures: function (value) {
            this.set("lineFeatures", value);
        },

        setSteps: function (value) {
            this.set("steps", value);
        },

        setDefaultPointStyle: function (value) {
            this.set("defaultPointStyle", value);
        },

        getLineFeatures: function () {
            return this.get("lineFeatures");
        },

        getSteps: function () {
            return this.get("steps");
        },
        getIntermediate: function () {
            return this.get("intermediate");
        },

        setIntermediate: function (val) {
            return this.set("intermediate", val);
        },
        getMinVal: function () {
            return this.get("minVal");
        },

        setMinVal: function (val) {
            return this.set("minVal", val);
        },

        getMaxVal: function () {
            return this.get("maxVal");
        },

        setMaxVal: function (val) {
            return this.set("maxVal", val);
        },

        getDefaultPointStyle: function () {
            return this.get("defaultPointStyle");
        },

        moveFeature: function (event) {
            var vectorContext = event.vectorContext,
                frameState = event.frameState,
                features = this.get("layer").getSource().getFeatures();

//            this.preparePointStyle(features[1].get("anzahl_pendler"));
            for (var i = 0; i < features.length; i++) {
                if (this.get("animating")) {
                    var elapsedTime = frameState.time - this.get("now"),
                        // here the trick to increase speed is to jump some indexes
                        // on lineString coordinates
                        index = Math.round(2 * elapsedTime / 1000),
                        currentPoint,
                        newFeature;

                    if (index >= this.get("steps")) {
                        this.stopAnimation(true);
                        return;
                    }
                    this.preparePointStyle(features[i].get("anzahl_pendler"));
                    currentPoint = new ol.geom.Point(features[i].getGeometry().getCoordinates()[index]);
                    newFeature = new ol.Feature(currentPoint);
                    vectorContext.drawFeature(newFeature, this.getDefaultPointStyle());
                }
            }
            // tell OL3 to continue the postcompose animation
            Radio.trigger("Map", "render");
        },

        preparePointStyle: function (val) {
            var minVal = this.getMinVal(),
                maxVal = this.getMaxVal(),
                intermediate = this.getIntermediate(),
                minPx = 1,
                maxPx = 30,
                percent,
                pixel;

            percent = (val * 100) / (maxVal - minVal);
            pixel = ((maxPx - minPx) / 100) * percent;
            if(val > intermediate){
                this.setDefaultPointStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: minPx + pixel,
                        fill: new ol.style.Fill({color: "rgba(255,0,0,0.5)"})
                    })
                    })
                )
            }
            else{
                this.setDefaultPointStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: minPx,
                        fill: new ol.style.Fill({color: "red"})
                    })
                    })
                )
            }

        },

        startAnimation: function () {
            if (this.get("animating")) {
                this.stopAnimation(false);
            }
            else {
                this.set("animating", true);
                this.set("now", new Date().getTime());
                Radio.trigger("Map", "registerPostCompose", this.moveFeature, this);
                Radio.trigger("Map", "render");
            }
        },

        stopAnimation: function () {
            this.set("animating", false);
            // remove listener
            Radio.trigger("Map", "unregisterPostCompose", this.moveFeature);
        }
    });

    return Animation;
});
