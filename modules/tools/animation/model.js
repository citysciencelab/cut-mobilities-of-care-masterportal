define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Util = require("modules/core/util"),
        Animation;

    Animation = Backbone.Model.extend({
        defaults: {
            steps: 30,
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
                TYPENAME: "app:mrh_auspendler_gesamt",
                VERSION: "1.1.0",
                maxFeatures: "266"
            },
            pointStyle: new ol.style.Style({
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
                        featureType: "mrh_auspendler_gesamt"
                    });

                    this.setLineFeatures(wfsReader.readFeatures(data));
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
                    lineCoords = [];

                for (var i = 0; i <= this.getSteps(); i++) {
                    var newEndPt = new ol.geom.Point([startPoint[0] + i * directionX, startPoint[1] + i * directionY, 0]);

                    lineCoords.push(newEndPt.getCoordinates());
                }
                var line = new ol.Feature({
                    geometry: new ol.geom.LineString(lineCoords)
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

        setPointStyle: function (value) {
            this.set("pointStyle", value);
        },

        getLineFeatures: function () {
            return this.get("lineFeatures");
        },

        getSteps: function () {
            return this.get("steps");
        },

        getPointStyle: function () {
            return this.get("pointStyle");
        },

        moveFeature: function (event) {
            var vectorContext = event.vectorContext,
                frameState = event.frameState,
                features = this.get("layer").getSource().getFeatures();

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
                    currentPoint = new ol.geom.Point(features[i].getGeometry().getCoordinates()[index]);
                    newFeature = new ol.Feature(currentPoint);
                    vectorContext.drawFeature(newFeature, this.getPointStyle());
                }
            }
            // tell OL3 to continue the postcompose animation
            Radio.trigger("Map", "render");
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
